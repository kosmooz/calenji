import {
  IsString,
  IsArray,
  IsOptional,
  IsInt,
  ArrayMinSize,
} from "class-validator";

export class CreateCalendarViewDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  socialAccountIds: string[];

  @IsInt()
  @IsOptional()
  position?: number;
}

export class UpdateCalendarViewDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  socialAccountIds?: string[];

  @IsInt()
  @IsOptional()
  position?: number;
}
