import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Controller("family")
export class FamilyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post("invite")
  async invite(@Body("email") email: string, @Req() req: any) {
    const invite = await this.prisma.familyInvite.create({
      data: { inviterId: req.user.id, email },
    });

    const inviter = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    this.eventEmitter.emit("family.invite", {
      email,
      inviterName:
        `${inviter?.firstName || ""} ${inviter?.lastName || ""}`.trim() ||
        inviter?.email,
      inviteId: invite.id,
    });

    return invite;
  }

  @Post("accept")
  async accept(@Body("inviteId") inviteId: string, @Req() req: any) {
    const invite = await this.prisma.familyInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException("Invite not found");
    }

    await this.prisma.familyInvite.update({
      where: { id: inviteId },
      data: { status: "ACCEPTED", inviteeId: req.user.id },
    });

    // Look up default role
    const defaultRole = await this.prisma.role.findUnique({
      where: { name: "MEMBER" },
    });

    if (!defaultRole) {
      throw new Error(
        "Default role 'MEMBER' not found. Please contact support.",
      );
    }

    // Create membership
    return this.prisma.familyMember.create({
      data: { userId: req.user.id, roleId: defaultRole.id },
    });
  }

  @Get()
  async getFamily(@Req() req: any) {
    return this.prisma.familyMember.findMany({
      include: { user: true, role: true },
    });
  }

  @Get(":id")
  async getMember(@Param("id") id: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { id },
      include: { user: true, role: true },
    });
    if (!member) throw new NotFoundException("Family member not found");
    return member;
  }

  @Patch(":id")
  async updateMember(@Param("id") id: string, @Body() dto: any) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException("Update data (body) cannot be empty");
    }

    // Explicitly check for record existence
    const exists = await this.prisma.familyMember.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Family member not found");

    try {
      return await this.prisma.familyMember.update({
        where: { id },
        data: dto,
        include: { user: true, role: true },
      });
    } catch (error: any) {
      if (error.code === "P2003") {
        throw new BadRequestException("Invalid roleId or related record");
      }
      throw error;
    }
  }

  @Delete(":id")
  async removeMember(@Param("id") id: string) {
    // Explicitly check for record existence
    const exists = await this.prisma.familyMember.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Family member not found");

    try {
      await this.prisma.familyMember.delete({ where: { id } });
      return { success: true };
    } catch (error: any) {
      throw error;
    }
  }

  @Get(":id/permissions")
  async getPermissions(@Param("id") id: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { id },
      include: { role: { include: { permissions: true } } },
    });
    return member?.role.permissions;
  }

  @Patch(":id/permissions")
  async updatePermissions(
    @Param("id") id: string,
    @Body() permissions: string[],
  ) {
    // Logic to update role/permissions
    return { success: true };
  }
}
