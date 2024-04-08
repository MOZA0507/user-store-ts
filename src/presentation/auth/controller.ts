import { Request, Response } from "express";
import { CustomError, RegisterUserDto } from "../../domain";
import { AuthService } from "../services/auth.service";



export class AuthController {
  
  //DI
  constructor(
    public readonly authService: AuthService
  ){}

  private handleError = (error: unknown, res: Response) =>{
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({error: error.message});
    } 
    return res.status(500).json({error: 'Internal Server Error'});
  }

  registerUser = (req: Request, res: Response) => {

    const [error, registerDto] = RegisterUserDto.create(req.body);
    if(error) return res.status(400).json({error});
    this.authService.registerUser(registerDto!)
      .then((data) => res.json(data))
      .catch(err => this.handleError(err, res));

  };

  loginUser = (req: Request, res: Response) => {
    res.json('loginUser');
  };

  validateEmail = (req: Request, res: Response) => {
    res.json('validateEmail');
  };
}