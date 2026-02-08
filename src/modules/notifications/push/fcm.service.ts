import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as admin from "firebase-admin";

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private initialized = false;

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (this.initialized) return;

    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n",
      );

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.warn(
          "Firebase credentials missing. Push notifications disabled.",
        );
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

      this.initialized = true;
      this.logger.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Firebase", error);
    }
  }

  async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!this.initialized) {
      this.logger.warn("Skipping push: Firebase not initialized");
      return null;
    }

    try {
      const response = await admin.messaging().send({
        token,
        notification: { title, body },
        data,
      });
      return response;
    } catch (error) {
      this.logger.error(`Failed to send push to ${token}`, error);
      throw error;
    }
  }

  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!this.initialized) return null;
    try {
      const response = await admin.messaging().send({
        topic,
        notification: { title, body },
        data,
      });
      return response;
    } catch (error) {
      this.logger.error(`Failed to send to topic ${topic}`, error);
      throw error;
    }
  }
}
