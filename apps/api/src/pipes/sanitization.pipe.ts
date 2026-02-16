import { 
  PipeTransform, 
  Injectable, 
  ArgumentMetadata,
  BadRequestException 
} from '@nestjs/common';
import { SecurityService } from '../modules/security/security.service';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  constructor(private securityService: SecurityService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object') {
      return value;
    }

    // Sanitize all string properties in the object
    const sanitizedValue = await this.sanitizeObject(value);
    
    return sanitizedValue;
  }

  private async sanitizeObject(obj: any): Promise<any> {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj !== 'object') {
      if (typeof obj === 'string') {
        return await this.securityService.sanitizeInput(obj);
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return Promise.all(obj.map(item => this.sanitizeObject(item)));
    }

    const sanitizedObj: any = {};
    for (const [key, val] of Object.entries(obj)) {
      sanitizedObj[key] = await this.sanitizeObject(val);
    }

    return sanitizedObj;
  }
}