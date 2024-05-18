import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';
import { PartialType } from '@nestjs/mapped-types';

export class CreateLinkDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  host?: string;

  user: ObjectId;
}

export class UpdateLinkDto extends PartialType(CreateLinkDto) {}
