import { Injectable } from "@nestjs/common";

export interface IStorage {
  upload(file: any): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

@Injectable()
export abstract class StorageService {
  abstract upload(file: any): Promise<string>;
  abstract download(key: string): Promise<Buffer>;
  abstract delete(key: string): Promise<void>;
}

@Injectable()
export class LocalStorageService extends StorageService {
  async upload(file: any): Promise<string> {
    // Placeholder implementation
    return `local/${file.originalname}`;
  }

  async download(key: string): Promise<Buffer> {
    return Buffer.from("");
  }

  async delete(key: string): Promise<void> {
    // Placeholder
  }
}
