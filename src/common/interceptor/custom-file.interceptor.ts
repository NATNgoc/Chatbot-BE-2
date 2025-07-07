import { FileTypeValidator, FileValidator } from '@nestjs/common';
import { ALLOWED_MIME_TYPES } from '../constant';
import { IFile } from '@nestjs/common/pipes/file/interfaces';

export class CustomFileTypeValidator extends FileValidator {
  isValid(file?: IFile): Promise<boolean> {
    if (file) {
      return Promise.resolve(ALLOWED_MIME_TYPES.includes(file.mimetype));
    }
    return Promise.resolve(false);
  }

  buildErrorMessage(): string {
    return `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`;
  }
}
