import { IsNotEmpty, IsString } from "class-validator";

export class ConnectAccountDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
