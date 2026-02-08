import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { FamilyModule } from "./modules/family/family.module";
import { VaultModule } from "./modules/vault/vault.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { EmergencyModule } from "./modules/emergency/emergency.module";
import { SecurityModule } from "./modules/security/security.module";
import { SystemModule } from "./modules/system/system.module";
import { CommonModule } from "./common/common.module";
import { RolesModule } from "./modules/roles/roles.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { CloudinaryModule } from "./shared/providers/cloudinary/cloudinary.module";

import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    CommonModule,
    AuthModule,
    UsersModule,
    SecurityModule,
    FamilyModule,
    VaultModule,
    DocumentsModule,
    EmergencyModule,
    SystemModule,
    RolesModule,
    NotificationsModule,
    CloudinaryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
