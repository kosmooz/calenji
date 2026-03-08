import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SocialAuthService } from "./social-auth.service";
import { ConnectAccountDto } from "./dto/connect-account.dto";

@Controller("social-auth")
@UseGuards(JwtAuthGuard)
export class SocialAuthController {
  constructor(private readonly socialAuthService: SocialAuthService) {}

  @Get("connect-url")
  getConnectUrl() {
    return this.socialAuthService.getConnectUrl();
  }

  @Post("connect")
  connect(@Req() req: any, @Body() dto: ConnectAccountDto) {
    return this.socialAuthService.connectAccounts(req.user.sub, dto.code);
  }

  @Get("accounts")
  getAccounts(@Req() req: any) {
    return this.socialAuthService.getAccounts(req.user.sub);
  }

  @Delete("accounts/:id")
  disconnect(@Req() req: any, @Param("id") id: string) {
    return this.socialAuthService.disconnectAccount(req.user.sub, id);
  }

  @Post("accounts/:id/reconnect")
  reconnect(@Req() req: any, @Param("id") id: string) {
    return this.socialAuthService.reconnectAccount(req.user.sub, id);
  }

  @Get("accounts/:id/status")
  getStatus(@Req() req: any, @Param("id") id: string) {
    return this.socialAuthService.getAccountStatus(req.user.sub, id);
  }
}
