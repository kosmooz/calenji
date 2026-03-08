import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDateString,
  IsUrl,
  MaxLength,
  ArrayMinSize,
} from "class-validator";
import { ContentType } from "@prisma/client";

export class CreatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(63206)
  caption?: string;

  @IsEnum(ContentType)
  @IsOptional()
  contentType?: ContentType;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  socialAccountIds: string[];

  @IsString()
  @IsOptional()
  reelCoverUrl?: string;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(63206)
  caption?: string;

  @IsEnum(ContentType)
  @IsOptional()
  contentType?: ContentType;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  socialAccountIds?: string[];

  @IsString()
  @IsOptional()
  reelCoverUrl?: string;
}
