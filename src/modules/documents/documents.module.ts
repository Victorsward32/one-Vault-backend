import { Module } from "@nestjs/common";
import { DocumentsController } from "./documents.controller";
import { CloudinaryModule } from "../../shared/providers/cloudinary/cloudinary.module";
import { DocumentsService } from "./documents.service";

@Module({
  imports: [CloudinaryModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
