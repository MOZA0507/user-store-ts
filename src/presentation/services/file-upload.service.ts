import path from 'path';
import fs from 'fs';
import { UploadedFile } from "express-fileupload";
import { UuidAdapter } from '../../config';
import { CustomError } from '../../domain';



export class FileUploadService {
  constructor(
    private readonly uuid = UuidAdapter.v4,
  ){};

  private checkFolder(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }

  async uploadSingleFile(
    file: UploadedFile,
    folder: string = 'uploads',
    validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif'],
  ){

    try {
      const fileExtension = file.mimetype.split('/').at(1) ?? '';
      if(!validExtensions.includes(fileExtension)){
        throw CustomError.badRequest(`Invalid extension: ${fileExtension}`);
      }
      const destination = path.resolve(__dirname, '../../../',folder);
      this.checkFolder(destination);

      const fileName = `${this.uuid()}.${fileExtension}`;
      file.mv(`${destination}/${fileName}`);

      return {fileName};
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async uploadMultiple(
    files: UploadedFile[],
    folder: string = 'uploads',
    validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif'],
  ) {
    const fileNames = Promise.all(
      files.map(file => this.uploadSingleFile(file, folder, validExtensions)),
    );
    return fileNames;
  }
}