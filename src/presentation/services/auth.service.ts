import { JwtAdapter, bcryptAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto } from "../../domain";
import { UserEntity } from "../../domain/entities/user.entitiy";



export class AuthService {

  //DI
  constructor(){}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({email: registerUserDto.email});

    if (existUser) throw CustomError.badRequest('Email already exists');

    try {
      const user = new UserModel(registerUserDto);

      //Hash de contraseña
      user.password = bcryptAdapter.hash(registerUserDto.password);
      await user.save();

      const {password, ...rest} = UserEntity.fromObject(user);

      return {
        user: rest, 
        token:'ABC'};
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
      const token = await JwtAdapter.generateToken({id: existUser.id});

      if (!token) throw CustomError.internalServer('Error creating token');
      return {
        user: userEntity,
        token: token
      }
    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }
}