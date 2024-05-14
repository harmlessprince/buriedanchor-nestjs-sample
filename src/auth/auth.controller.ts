import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login-dto';
import { success } from '../core/utils';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const createdUserDto = await this.authService.registerUser(createUserDto);
    const data = {
      user: { email: createdUserDto.email, id: createdUserDto._id },
    };
    return success(data, 'Registration successful');
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.logUserIn(loginDto);
    return success(data, 'Logged successfully');
  }
}
