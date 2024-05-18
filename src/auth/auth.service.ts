import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dtos/login-dto';
import { comparePassword, TokenPayload } from '../core/utils';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthenticationService } from './google.authentication.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {
  }

  async registerUser(createUserDto: CreateUserDto): Promise<User> {
    const userExists: User = await this.userService.findOneByEmail(
      createUserDto.email,
    );
    if (userExists) {
      throw new BadRequestException('Email has already been taken');
    }
    return this.userService.create(createUserDto);
  }

  async logUserIn(loginDto: LoginDto) {
    const user: User = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    const match = await comparePassword(loginDto.password, user.password);
    if (!match) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    const payload: TokenPayload = {
      userId: user._id,
      email: user.email,
    };
    return {
      user: { email: user.email, id: user._id },
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async getAuthenticatedUser(payload: TokenPayload) {
    return await this.userService.findOneByEmail(payload.email);
  }
}
