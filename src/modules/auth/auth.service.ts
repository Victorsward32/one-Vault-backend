import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { RegisterDto, LoginDto, ResetPasswordDto } from "./dto/auth.dto";

import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    this.eventEmitter.emit("auth.welcome", {
      email: user.email,
      name: user.firstName || "User",
    });

    const tokens = await this.generateTokens(user.id, user.email);
    return { ...tokens, user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return { ...tokens, user };
  }

  async logout(userId: string) {
    await this.prisma.session.deleteMany({ where: { userId } });
    return { success: true };
  }

  async refresh(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    return this.generateTokens(payload.sub, payload.email);
  }

  async setPin(userId: string, pin: string) {
    const hashedPin = await bcrypt.hash(pin, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { pin: hashedPin, isPinSet: true },
    });
    return { success: true };
  }

  async verifyPin(userId: string, pin: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.pin || !(await bcrypt.compare(pin, user.pin))) {
      throw new UnauthorizedException("Invalid PIN");
    }
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        message: "If your email is registered, you will receive an OTP.",
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.prisma.verificationCode.upsert({
      where: { email_type: { email, type: "PASSWORD_RESET" } },
      update: { code: otp, expiresAt },
      create: { email, type: "PASSWORD_RESET", code: otp, expiresAt },
    });

    this.eventEmitter.emit("auth.forgotPassword", {
      email: user.email,
      name: user.firstName || "User",
      otp,
    });

    return { message: "OTP sent successfully" };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const verification = await this.prisma.verificationCode.findUnique({
      where: { email_type: { email: dto.email, type: "PASSWORD_RESET" } },
    });

    if (!verification || verification.code !== dto.otp) {
      throw new UnauthorizedException("Invalid OTP");
    }

    if (verification.expiresAt < new Date()) {
      throw new UnauthorizedException("OTP expired");
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { email: dto.email },
      data: { password: hashedPassword },
    });

    await this.prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    return { message: "Password reset successful" };
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({ where: { userId } });
  }

  async deleteSession(id: string) {
    await this.prisma.session.delete({ where: { id } });
    return { success: true };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET as string,
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || "7d") as any,
    });

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
