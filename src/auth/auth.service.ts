import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schemas';
import {
  compareHashPassword,
  generateHashPassword,
} from 'src/utils/password-hash';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({
      username: loginDto.username,
    });

    if (!user) {
      return 'Invalid User Name';
    }

    const isMatch = compareHashPassword(loginDto.password, user.password);

    if (!isMatch) {
      return 'Invalid Password';
    }
    const payload = { sub: user.id, username: user.username };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(loginDto: LoginDto) {
    const { password, username } = loginDto;
    const user = await this.userModel.findOne({
      username: loginDto.username,
    });

    if (user) {
      return 'User already exists';
    }

    const hashedPassword = generateHashPassword(password);

    await this.userModel.create({
      username,
      password: hashedPassword,
    });

    return 'User created';
  }
}
