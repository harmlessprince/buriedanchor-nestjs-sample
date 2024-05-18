import { ObjectId } from 'mongoose';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLinkEventDto {
  @IsString()
  @IsNotEmpty()
  link: ObjectId;

  @IsString()
  @IsOptional()
  operating_system?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  referrer?: string;
}