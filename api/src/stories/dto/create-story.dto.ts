import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  ArrayMinSize,
} from "class-validator";

export class CreateStoryDto {
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  mediaUrl: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  socialAccountIds: string[];
}

export class UpdateStoryDto {
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  socialAccountIds?: string[];
}
