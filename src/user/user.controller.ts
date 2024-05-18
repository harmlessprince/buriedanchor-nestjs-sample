import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get('/generate/users')
  async generateUsers() {
    const users = [
      'tao@yopmail.com',
      'daniel@yopmail.com',
      'random@yopmail.com',
    ];
    for (const user of users) {
      const createUserDto = new CreateUserDto();
      createUserDto.email = user;
      createUserDto.password = 'password';
      if (!(await this.userService.findOneByEmail(user))) {
        await this.userService.create(createUserDto);
      }
    }
    return 'users generated';
  }
}
