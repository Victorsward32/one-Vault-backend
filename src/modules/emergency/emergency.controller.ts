import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  CreateEmergencyContactDto,
  CreateEmergencyProfileDto,
} from "./dto/emergency.dto";

@Controller("emergency")
export class EmergencyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post("profile")
  async createProfile(@Body() dto: CreateEmergencyProfileDto, @Req() req: any) {
    return this.prisma.emergencyProfile.upsert({
      where: { userId: req.user.id },
      update: dto,
      create: { ...dto, userId: req.user.id },
    });
  }

  @Get("profile")
  async getProfile(@Req() req: any) {
    return this.prisma.emergencyProfile.findUnique({
      where: { userId: req.user.id },
      include: { contacts: true },
    });
  }

  @Post("contacts")
  async addContact(@Body() dto: CreateEmergencyContactDto, @Req() req: any) {
    let profile = await this.prisma.emergencyProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      profile = await this.prisma.emergencyProfile.create({
        data: { userId: req.user.id },
      });
    }

    const contact = await this.prisma.emergencyContact.create({
      data: { ...dto, emergencyProfileId: profile.id },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    this.eventEmitter.emit("emergency.contactAdded", {
      email: contact.email,
      contactName: contact.name,
      userName:
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.email,
    });

    return contact;
  }

  @Get("contacts")
  async getContacts(@Req() req: any) {
    const profile = await this.prisma.emergencyProfile.findUnique({
      where: { userId: req.user.id },
    });
    return this.prisma.emergencyContact.findMany({
      where: { emergencyProfileId: profile?.id },
    });
  }

  @Post("request-access")
  async requestAccess(@Body() dto: any) {
    // Logic to initiate emergency access request
    return { success: true, message: "Emergency access request initiated" };
  }

  @Delete("contacts/:id")
  async deleteContact(@Param("id") id: string) {
    const contact = await this.prisma.emergencyContact.findUnique({
      where: { id },
    });
    if (!contact) throw new NotFoundException("Contact not found");

    await this.prisma.emergencyContact.delete({ where: { id } });
    return { success: true };
  }
}
