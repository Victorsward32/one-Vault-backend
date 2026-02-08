import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as path from "path";
import * as fs from "fs";
import * as handlebars from "handlebars";

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransport();
  }

  private initializeTransport() {
    try {
      const port = parseInt(process.env.SMTP_PORT || "587");
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465, // Use true for 465, false for 587 (STARTTLS)
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      this.logger.log("SMTP Transporter initialized");
    } catch (error) {
      this.logger.error("Failed to initialize SMTP", error);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, any>,
  ) {
    try {
      const html = this.renderTemplate(templateName, context);

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"OneVault" <noreply@onevault.com>',
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return info.messageId;
    } catch (error) {
      this.logger.error(`Failed to email ${to}`, error);
      throw error;
    }
  }

  private renderTemplate(templateName: string, context: any): string {
    try {
      // Adjusted path to look in shared provider templates
      const templatePath = path.join(
        process.cwd(),
        "src/shared/providers/email/templates",
        `${templateName}.hbs`,
      );

      if (!fs.existsSync(templatePath)) {
        this.logger.warn(
          `Template ${templateName} not found at ${templatePath}. Using default fallback.`,
        );
        return `<p>${JSON.stringify(context)}</p>`;
      }

      const source = fs.readFileSync(templatePath, "utf8");
      const template = handlebars.compile(source);
      return template(context);
    } catch (error) {
      this.logger.error("Template rendering failed", error);
      throw error;
    }
  }
}
