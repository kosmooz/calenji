import { IsString, IsOptional, IsArray } from "class-validator";

export class CreateStoryTemplateDto {
  @IsString()
  @IsOptional()
  storyId?: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  socialAccountIds?: string[];

  @IsString()
  @IsOptional()
  scheduledTime?: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class UpdateStoryTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;
}
