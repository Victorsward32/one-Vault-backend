import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  Body,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";
import { AuthService } from "../auth/auth.service";

@Controller("security")
export class SecurityController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Post("pin/verify")
  async verifyPin(@Body("pin") pin: string, @Req() req: any) {
    return this.authService.verifyPin(req.user.id, pin);
  }

  @Post("device/register")
  async registerDevice(@Body() dto: any, @Req() req: any) {
    return this.prisma.device.create({
      data: { ...dto, userId: req.user.id },
    });
  }

  @Get("devices")
  async getDevices(@Req() req: any) {
    return this.prisma.device.findMany({ where: { userId: req.user.id } });
  }

  @Delete("devices/:id")
  async deleteDevice(@Param("id") id: string) {
    await this.prisma.device.delete({ where: { id } });
    return { success: true };
  }

  @Get("activity")
  async getActivity(@Req() req: any) {
    return this.prisma.auditLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }
}
