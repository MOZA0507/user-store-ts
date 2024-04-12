import { Request, Response } from "express";
import { CreateCategoryDto, CustomError, PaginationDto } from "../../domain";
import { CategoryService } from "../services/category.service";
import { FileUploadService } from "../services";
import { UploadedFile } from "express-fileupload";



export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
  ){};

  private handleError = (error: unknown, res: Response) =>{
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({error: error.message});
    } 
    return res.status(500).json({error: 'Internal Server Error'});
  };

  uploadFile = (req: Request, res: Response) => {
    const type = req.params.type;

    const file = req.body.files.at(0) as UploadedFile;

    this.fileUploadService.uploadSingleFile(file,`uploads/${type}`)
      .then(uploadFile => res.json(uploadFile))
      .catch(error => this.handleError(error, res));
  };

  uploadMultipleFiles = (req: Request, res: Response) => {
    const type = req.params.type;
    const files = req.body.files as UploadedFile[];

    this.fileUploadService.uploadMultiple(files, `uploads/${type}`)
      .then(uploaded => res.json(uploaded))
      .catch(error => this.handleError(error, res));
  };
}