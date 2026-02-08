import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";
import { FcmService } from "./push/fcm.service";
import { EmailProvider } from "../../shared/providers/email/email.provider";
import { SendPushDto, SendEmailDto } from "./dto/notification.dto";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmService: FcmService,
    private readonly emailProvider: EmailProvider,
  ) {}

  @OnEvent("auth.welcome")
  async handleWelcomeEvent(payload: { email: string; name: string }) {
    this.logger.log(`Handling welcome event for ${payload.email}`);
    await this.sendEmail({
      to: payload.email,
      subject: "Welcome to OneVault",
      template: "welcome",
      context: { name: payload.name },
    });
  }

  @OnEvent("auth.forgotPassword")
  async handleForgotPasswordEvent(payload: {
    email: string;
    name: string;
    otp: string;
  }) {
    this.logger.log(`Handling forgot password event for ${payload.email}`);
    await this.sendEmail({
      to: payload.email,
      subject: "Reset Your OneVault Password",
      template: "forgot-password",
      context: { name: payload.name, otp: payload.otp },
    });
  }

  @OnEvent("family.invite")
  async handleFamilyInviteEvent(payload: {
    email: string;
    inviterName: string;
    inviteId: string;
  }) {
    this.logger.log(`Handling family invite event for ${payload.email}`);
    await this.sendEmail({
      to: payload.email,
      subject: "You're invited to join a Family Vault on OneVault",
      template: "family-invitation",
      context: {
        inviterName: payload.inviterName,
        inviteUrl: `https://onevault.app/accept-invite?id=${payload.inviteId}`,
      },
    });
  }

  @OnEvent("emergency.contactAdded")
  async handleEmergencyContactAddedEvent(payload: {
    email: string;
    contactName: string;
    userName: string;
  }) {
    this.logger.log(
      `Handling emergency contact added event for ${payload.email}`,
    );
    await this.sendEmail({
      to: payload.email,
      subject: "You've been added as an Emergency Contact",
      template: "emergency-contact-added",
      context: {
        contactName: payload.contactName,
        userName: payload.userName,
      },
    });
  }

  async sendPush(dto: SendPushDto) {
    // 1. Get User's Devices
    const devices = await this.prisma.device.findMany({
      where: { userId: dto.userId, deviceToken: { not: null } },
    });

    if (devices.length === 0) {
      this.logger.warn(`No devices found for user ${dto.userId}`);
      return { success: false, message: "No devices registered" };
    }

    // 2. Persist In-App Notification
    await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.body,
        type: "SYSTEM",
        data: dto.data || {},
      },
    });

    // 3. Send to all devices
    const results = await Promise.allSettled(
      devices.map((device) =>
        this.fcmService.sendToDevice(
          device.deviceToken!,
          dto.title,
          dto.body,
          dto.data,
        ),
      ),
    );

    // 4. Log Results
    results.forEach(async (res, index) => {
      const status = res.status === "fulfilled" ? "SENT" : "FAILED";
      const error = res.status === "rejected" ? String(res.reason) : null;
      const responseId =
        res.status === "fulfilled" ? (res.value as string) : null;

      await this.prisma.notificationLog.create({
        data: {
          userId: dto.userId,
          channel: "PUSH",
          status,
          providerResponse: responseId,
          error,
        },
      });
    });

    return {
      success: true,
      sentCount: results.filter((r) => r.status === "fulfilled").length,
    };
  }

  async sendEmail(dto: SendEmailDto) {
    // Logic to find userId from email (optional, for logging)
    const user = await this.prisma.user.findUnique({
      where: { email: dto.to },
    });
    const userId = user ? user.id : "anonymous"; // Or handle strictly

    try {
      const messageId = await this.emailProvider.sendEmail(
        dto.to,
        dto.subject,
        dto.template,
        dto.context || {},
      );

      if (user) {
        await this.prisma.notificationLog.create({
          data: {
            userId: user.id,
            channel: "EMAIL",
            status: "SENT",
            providerResponse: messageId,
          },
        });
      }
      return { success: true, messageId };
    } catch (error) {
      if (user) {
        await this.prisma.notificationLog.create({
          data: {
            userId: user.id,
            channel: "EMAIL",
            status: "FAILED",
            error: String(error),
          },
        });
      }
      throw error;
    }
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getLogs() {
    return this.prisma.notificationLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    });
  }

  async registerDevice(
    userId: string,
    deviceToken: string,
    deviceName?: string,
  ) {
    // Check if exists
    const existing = await this.prisma.device.findFirst({
      where: { deviceToken, userId },
    });
    if (existing) return existing;

    return this.prisma.device.create({
      data: {
        userId,
        deviceToken,
        deviceName: deviceName || "Unknown Device",
      },
    });
  }

  async unregisterDevice(userId: string, deviceToken: string) {
    await this.prisma.device.deleteMany({
      where: { userId, deviceToken },
    });
    return { success: true };
  }
}
