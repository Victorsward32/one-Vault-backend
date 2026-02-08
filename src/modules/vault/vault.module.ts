import { Module } from "@nestjs/common";
import { VaultController } from "./vault.controller";
import { VaultCategoriesController } from "./categories.controller";
@Module({ controllers: [VaultController, VaultCategoriesController] })
export class VaultModule {}
