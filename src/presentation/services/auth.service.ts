import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto } from "../../domain";
import { UserEntity } from "../../domain/entities/user.entitiy";
import { EmailService } from "./email.service";



export class AuthService {

  //DI
  constructor(
    private readonly emailService: EmailService
  ){}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({email: registerUserDto.email});

    if (existUser) throw CustomError.badRequest('Email already exists');

    try {
      const user = new UserModel(registerUserDto);

      //Hash de contraseña
      user.password = bcryptAdapter.hash(registerUserDto.password);
      await user.save();

      //mandar email
      await this.sendEmailValidationLink(user.email);

      const {password, ...rest} = UserEntity.fromObject(user);
      const token = await JwtAdapter.generateToken({id: user.id});

      if (!token) throw CustomError.internalServer('Error creating token');
      
      return {
        user: rest, 
        token:token};
    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  };

  public async login (loginUserDto: LoginUserDto) {
    try {
      const existUser = await UserModel.findOne({email: loginUserDto.email});

      if (!existUser) throw CustomError.notFound('User with that email doesnt exist');
      const passwordCompare = bcryptAdapter.compare(loginUserDto.password, existUser.password);

      if (!passwordCompare) throw CustomError.unauthorized('Password or email dont match');

      const {password, ...userEntity} = UserEntity.fromObject(existUser);
      const token = await JwtAdapter.generateToken({id: existUser.id, email: existUser.email});

      if (!token) throw CustomError.internalServer('Error creating token');
      return {
        user: userEntity,
        token: token
      }
    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  private sendEmailValidationLink = async(email: string) => {
    const token = await JwtAdapter.generateToken({email});
    if (!token) throw CustomError.internalServer('Error creating token');

    const link = `${envs.WEB_SERVICE_URL}/auth/validate-email/${token}`;
    const html = `
      <h1>Validate your email</h1>
      <p>Click on the following link to valudate your email</p>
      <a href="${link}">Validate your email ${email}</a>
    `;

    const options = {
      to: email,
      subject: 'Validate your email',
      htmlBody: html,
    };

    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) throw CustomError.internalServer('Error sending email');
    
    return true;
  };  

  public validateEmail = async (token: string) => {
    const payload = await JwtAdapter.validateToken(token);
    if (!payload) throw CustomError.unauthorized('Invalid token');

    const {email} = payload as {email: string};
    if (!email) throw CustomError.internalServer('Email not in token');

    const user = await UserModel.findOne({email});
    if (!user) throw CustomError.internalServer('Email not exist');

    user.emailValidated = true;
    await user.save();

    return true;
  };
}