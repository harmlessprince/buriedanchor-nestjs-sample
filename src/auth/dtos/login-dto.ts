import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}


export class SignInWithGoogleDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
