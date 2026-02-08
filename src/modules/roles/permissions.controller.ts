import { Controller, Get } from "@nestjs/common";
import { RolesService } from "./roles.service";

@Controller("permissions")
export class PermissionsController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getPermissions() {
    return this.rolesService.getPermissions();
  }
}
