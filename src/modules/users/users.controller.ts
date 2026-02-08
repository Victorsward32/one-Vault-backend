import { Controller, Get, Patch, Body, Req, Delete } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";

@Controller("users")
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllUsers() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("profile")
  async getProfile(@Req() req: any) {
    return this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mobile: true,
        createdAt: true,
      },
    });
  }

  @Patch("profile")
  async updateProfile(@Body() dto: any, @Req() req: any) {
    return this.prisma.user.update({
      where: { id: req.user.id },
      data: dto,
    });
  }

  @Patch("email")
  async updateEmail(@Body("email") email: string, @Req() req: any) {
    return this.prisma.user.update({
      where: { id: req.user.id },
      data: { email },
    });
  }

  @Patch("mobile")
  async updateMobile(@Body("mobile") mobile: string, @Req() req: any) {
    return this.prisma.user.update({
      where: { id: req.user.id },
      data: { mobile },
    });
  }

  @Patch("preferences")
  async updatePreferences(@Body() preferences: any, @Req() req: any) {
    return this.prisma.user.update({
      where: { id: req.user.id },
      data: { preferences },
    });
  }

  @Delete("account")
  async deleteAccount(@Req() req: any) {
    await this.prisma.user.update({
      where: { id: req.user.id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }
}
