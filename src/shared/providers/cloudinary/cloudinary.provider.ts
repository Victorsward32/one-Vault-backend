import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { CloudinaryUploadResult } from "./cloudinary.interface";
import { Readable } from "stream";

@Injectable()
export class CloudinaryProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    const cloudName = this.configService.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.configService.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.configService.get<string>("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn("Cloudinary credentials missing. File upload disabled.");
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    this.logger.log("Cloudinary Provider initialized successfully");
  }

  async uploadFile(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder:
            this.configService.get<string>("CLOUDINARY_FOLDER") || "onevault",
          resource_type: "auto",
          access_mode: "public",
        },
        (error, result) => {
          if (error || !result)
            return reject(error || new Error("Upload failed"));

          resolve({
            ...result,
            publicUrl: result.secure_url,
          } as CloudinaryUploadResult);
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
}
