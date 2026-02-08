import { Module, Global } from "@nestjs/common";
import { PrismaService } from "../config/prisma.config";
import { Logger } from "./logger/logger.service";

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: "LOGGER",
      useValue: new Logger("Global"),
    },
  ],
  exports: [PrismaService, "LOGGER"],
})
export class CommonModule {}
