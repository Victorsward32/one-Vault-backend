import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Delete,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import {
  SendPushDto,
  SendEmailDto,
  TestNotificationDto,
} from "./dto/notification.dto";
// import { Roles } from "../../common/decorators/roles.decorator"; // If strict RBAC needed

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("push/send")
  async sendPush(@Body() dto: SendPushDto) {
    return this.notificationsService.sendPush(dto);
  }

  @Post("email/send")
  async sendEmail(@Body() dto: SendEmailDto) {
    return this.notificationsService.sendEmail(dto);
  }

  @Get("user")
  async getUserNotifications(@Req() req: any) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Get("logs")
  async getLogs() {
    // In real app, restrict to ADMIN
    return this.notificationsService.getLogs();
  }

  @Post("test")
  async testNotification(@Body() dto: TestNotificationDto, @Req() req: any) {
    if (dto.channel === "PUSH") {
      // Send to self
      return this.notificationsService.sendPush({
        userId: req.user.id, // Implicitly target self for safety in test
        title: "Test Push",
        body: "This is a test notification",
        data: { type: "TEST" },
      });
    } else {
      return this.notificationsService.sendEmail({
        to: dto.target, // Explicit target for email
        subject: "Test Email",
        template: "welcome",
        context: { name: "Tester" },
      });
    }
  }

  @Post("register-device")
  async registerDevice(
    @Body() dto: { deviceToken: string; deviceName?: string },
    @Req() req: any,
  ) {
    // Delegating to service or direct DB call. Since this is simple, using DB access via service would be cleaner if service exposed it.
    // However, for now, we can reuse logic or call prisma directly if permissible. Use Service for cleanliness.
    return this.notificationsService.registerDevice(
      req.user.id,
      dto.deviceToken,
      dto.deviceName,
    );
  }

  @Delete("unregister-device")
  async unregisterDevice(
    @Body("deviceToken") deviceToken: string,
    @Req() req: any,
  ) {
    return this.notificationsService.unregisterDevice(req.user.id, deviceToken);
  }
}
