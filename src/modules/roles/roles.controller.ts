import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { RolesService } from "./roles.service";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async createRole(@Body() dto: { name: string; permissions: string[] }) {
    return this.rolesService.createRole(dto.name, dto.permissions);
  }

  @Get()
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Patch(":id")
  async updateRole(
    @Param("id") id: string,
    @Body() dto: { name?: string; permissions?: string[] },
  ) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException("Update data (body) cannot be empty");
    }
    return this.rolesService.updateRole(id, dto);
  }

  @Delete(":id")
  async deleteRole(@Param("id") id: string) {
    return this.rolesService.deleteRole(id);
  }
}
