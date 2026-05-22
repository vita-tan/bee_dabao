import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;

  constructor(private config: ConfigService) {
    // 开发环境使用本地存储，生产环境使用 COS
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private readonly ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly ALLOWED_FILES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  /**
   * 上传图片
   */
  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!this.ALLOWED_IMAGES.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 jpg/png/webp 格式图片');
    }
    if (file.size > this.MAX_IMAGE_SIZE) {
      throw new BadRequestException('图片大小不能超过 10MB');
    }

    return this.saveFile(file, 'images');
  }

  /**
   * 上传文件（PDF/Word）
   */
  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    if (!this.ALLOWED_FILES.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 pdf/doc/docx 格式文件');
    }
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('文件大小不能超过 50MB');
    }

    return this.saveFile(file, 'files');
  }

  /**
   * 保存文件到本地（开发环境）
   * 生产环境替换为 COS 上传
   */
  private async saveFile(
    file: Express.Multer.File,
    subDir: string,
  ): Promise<{ url: string }> {
    const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const dir = path.join(this.uploadDir, subDir, dateDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(dir, filename);

    fs.writeFileSync(filePath, file.buffer);

    // 开发环境返回相对路径
    const cosBucket = this.config.get<string>('COS_BUCKET', '');
    if (cosBucket) {
      // TODO: 生产环境上传至 COS 并返回 COS URL
      return {
        url: `https://${cosBucket}.cos.ap-guangzhou.myqcloud.com/${subDir}/${dateDir}/${filename}`,
      };
    }

    return {
      url: `/uploads/${subDir}/${dateDir}/${filename}`,
    };
  }
}
