import { Injectable } from "@nestjs/common";

export interface IStorageProvider {
  uploadFile(file: any): Promise<string>;
  getFileUrl(key: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
}

@Injectable()
export class StorageService {
  private provider: IStorageProvider;

  // ABSTRACTION ONLY - No S3 implementation yet
  async upload(file: any): Promise<string> {
    return "temp-file-key";
  }

  async getUrl(key: string): Promise<string> {
    return `https://storage.provider.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    return;
  }
}
