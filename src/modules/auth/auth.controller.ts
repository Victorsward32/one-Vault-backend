import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Delete,
  Param,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  RegisterDto,
  LoginDto,
  VerifyPinDto,
  SetPinDto,
  ResetPasswordDto,
} from "./dto/auth.dto";
import { Public } from "../../common/decorators/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @Public()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @Public()
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("logout")
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }

  @Post("refresh-token")
  @Public()
  async refreshToken(@Body("refreshToken") token: string) {
    return this.authService.refresh(token);
  }

  @Post("verify-pin")
  async verifyPin(@Body() dto: VerifyPinDto, @Req() req: any) {
    return this.authService.verifyPin(req.user.id, dto.pin);
  }

  @Post("set-pin")
  async setPin(@Body() dto: SetPinDto, @Req() req: any) {
    return this.authService.setPin(req.user.id, dto.pin);
  }

  @Post("reset-pin")
  async resetPin(@Body() dto: SetPinDto, @Req() req: any) {
    return this.authService.setPin(req.user.id, dto.pin);
  }

  @Post("forgot-password")
  @Public()
  async forgotPassword(@Body("email") email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post("reset-password")
  @Public()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get("me")
  async getMe(@Req() req: any) {
    return req.user;
  }

  @Get("sessions")
  async getSessions(@Req() req: any) {
    return this.authService.getSessions(req.user.id);
  }

  @Delete("sessions/:id")
  async deleteSession(@Param("id") id: string) {
    return this.authService.deleteSession(id);
  }
}
