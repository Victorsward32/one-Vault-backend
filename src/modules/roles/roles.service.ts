import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultRoles();
  }

  async ensureDefaultRoles() {
    // Ensure core permissions exist
    const permissions = [
      "VAULT_READ",
      "VAULT_WRITE",
      "DOC_READ",
      "DOC_WRITE",
      "FAMILY_MANAGE",
    ];

    for (const action of permissions) {
      await this.prisma.permission.upsert({
        where: { action },
        update: {},
        create: { action },
      });
    }

    // Ensure default role exists
    const defaultRoleName = "MEMBER";
    const role = await this.prisma.role.findUnique({
      where: { name: defaultRoleName },
    });

    if (!role) {
      await this.createRole(defaultRoleName, ["VAULT_READ", "DOC_READ"]);
      console.log(`Default role '${defaultRoleName}' created.`);
    }
  }

  async createRole(name: string, permissionActions: string[]) {
    // 1. Get permission IDs
    const permissions = await this.prisma.permission.findMany({
      where: { action: { in: permissionActions } },
    });

    // 2. Create role with relations
    return this.prisma.role.create({
      data: {
        name,
        permissions: {
          connect: permissions.map((p) => ({ id: p.id })),
        },
      },
      include: { permissions: true },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }

  async updateRole(id: string, dto: { name?: string; permissions?: string[] }) {
    const data: any = {};
    if (dto.name) data.name = dto.name;

    if (dto.permissions) {
      const permissions = await this.prisma.permission.findMany({
        where: { action: { in: dto.permissions } },
      });
      data.permissions = {
        set: permissions.map((p) => ({ id: p.id })),
      };
    }

    return this.prisma.role.update({
      where: { id },
      data,
      include: { permissions: true },
    });
  }

  async deleteRole(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }

  async getPermissions() {
    return this.prisma.permission.findMany();
  }
}
