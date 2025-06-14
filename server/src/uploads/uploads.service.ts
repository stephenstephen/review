import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  getFileUrl(filename: string): string {
    return `${process.env.SERVER_URL || 'http://localhost:3000'}/uploads/${filename}`;
  }
}
