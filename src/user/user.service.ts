import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hashPassword } from '../core/utils';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await hashPassword(createUserDto.password);
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async createWithGoogle(
    email: string,
    firebase_id: string,
    name: string,
    photo: string,
  ) {
    const newUser = new this.userModel({
      name: name,
      firebase_id: firebase_id,
      email: email,
      photo: photo,
    });
    return await newUser.save();
  }

  async updateWithGoogle(
    email: string,
    firebase_id: string,
    name: string,
    photo: string,
  ) {
    return this.userModel.findOneAndUpdate(
      { email: email },
      {
        name: name,
        firebase_id: firebase_id,
        email: email,
        photo: photo,
      },
    );
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email }).exec();
  }

  async findOneByID(id: string): Promise<User> {
    return await this.userModel.findOne({ _id: id }).exec();
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
