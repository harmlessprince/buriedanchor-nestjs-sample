import { IsNotEmpty, IsEmail } from 'class-validator';


export class UserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
