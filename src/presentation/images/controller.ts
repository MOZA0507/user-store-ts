import { Request, Response } from "express";
import fs from 'fs';
import path from 'path';



export class ImageController {
  cosntructor() {};

  getImage = (req: Request, res: Response) => {
    const {type = '', image = ''} = req.params;

    console.log(type);
    console.log(image);
    const imgPath = path.resolve(__dirname, `../../../uploads/${type}/${image}`);

    if(!fs.existsSync(imgPath)){
      return res.status(404).send('Image not found');
    }

    res.sendFile(imgPath);
  }
}