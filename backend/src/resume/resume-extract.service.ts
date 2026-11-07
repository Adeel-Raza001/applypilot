import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export type UploadedResume = {
  originalname: string;
  buffer: Buffer;
  size: number;
};

@Injectable()
export class ResumeExtractService {
  async extract(file: UploadedResume | undefined) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    const name = file.originalname.toLowerCase();
    const head = file.buffer.subarray(0, 4).toString('latin1');
    let text = '';

    if (name.endsWith('.pdf')) {
      // Asli PDF "%PDF" se shuru hoti hai
      if (!head.startsWith('%PDF')) {
        throw new BadRequestException('This file is not a valid PDF');
      }
      text = await this.readPdf(file.buffer);
    } else if (name.endsWith('.docx')) {
      // DOCX asal mein zip hai, "PK" se shuru hota hai
      if (!head.startsWith('PK')) {
        throw new BadRequestException('This file is not a valid DOCX');
      }
      text = await this.readDocx(file.buffer);
    } else {
      throw new BadRequestException('Only PDF and DOCX files are supported');
    }

    text = this.clean(text);

    if (text.length < 20) {
      throw new UnprocessableEntityException(
        'No readable text found. Scanned or image-only files are not supported, please paste the text instead.',
      );
    }

    return {
      content: text.slice(0, 20000),
      truncated: text.length > 20000,
    };
  }

  private async readPdf(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return result.text;
    } catch (err) {
      console.error('PDF read error:', err);
      throw new BadRequestException('Could not read this PDF');
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  private async readDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (err) {
      console.error('DOCX read error:', err);
      throw new BadRequestException('Could not read this DOCX file');
    }
  }

  private clean(text: string): string {
    return text
      .replace(/\0/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}