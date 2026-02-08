import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { FcmService } from "./push/fcm.service";
import { EmailModule } from "../../shared/providers/email/email.module";

@Module({
  imports: [EmailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, FcmService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
