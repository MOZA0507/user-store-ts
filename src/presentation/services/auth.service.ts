import { UserModel } from "../../data";
import { CustomError, RegisterUserDto } from "../../domain";
import { UserEntity } from "../../domain/entities/user.entitiy";



export class AuthService {

  //DI
  constructor(){}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({email: registerUserDto.email});

    if (existUser) throw CustomError.badRequest('Email already exists');

    try {
      const user = new UserModel(registerUserDto);
      await user.save();

      const {password, ...rest} = UserEntity.fromObject(user);

      return {...rest, token:'ABC'};
    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }

    return 'Todo bien chaval, poned a Quevedo';
  }
}