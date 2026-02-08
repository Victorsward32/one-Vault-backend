import { Module } from "@nestjs/common";
import { FamilyController } from "./family.controller";

@Module({
  controllers: [FamilyController],
})
export class FamilyModule {}
