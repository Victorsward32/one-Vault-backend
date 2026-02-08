import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  Post,
  Body,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";

@Controller()
export class SystemController {
  constructor(private readonly prisma: PrismaService) {}

  // Notifications
  @Get("notifications")
  async getNotifications(@Req() req: any) {
    return this.prisma.notification.findMany({
      where: { userId: req.user.id },
    });
  }

  @Patch("notifications/:id/read")
  async readNotification(@Param("id") id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  @Delete("notifications/:id")
  async deleteNotification(@Param("id") id: string) {
    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  // Audit Logs
  @Get("audit")
  async getAuditLogs(@Req() req: any) {
    return this.prisma.auditLog.findMany({ where: { userId: req.user.id } });
  }

  @Get("audit/:id")
  async getAuditLog(@Param("id") id: string) {
    return this.prisma.auditLog.findUnique({ where: { id } });
  }

  @Get("audit/user/:userId")
  async getAuditLogsByUser(@Param("userId") userId: string) {
    return this.prisma.auditLog.findMany({ where: { userId } });
  }

  // System
  @Get("health")
  async getHealth() {
    return { status: "ok", timestamp: new Date() };
  }

  @Get("metrics")
  async getMetrics() {
    return { users: 0, documents: 0, vaultEntries: 0 }; // Placeholder
  }

  @Get("config")
  async getConfig() {
    return { version: "1.0.0", stage: "alpha" };
  }

  @Post("feedback")
  async submitFeedback(@Body() dto: any) {
    return { success: true };
  }
}
