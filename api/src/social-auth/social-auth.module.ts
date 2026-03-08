import { Module } from "@nestjs/common";
import { SocialAuthController } from "./social-auth.controller";
import { SocialAuthService } from "./social-auth.service";
import { MetaApiService } from "./meta-api.service";

@Module({
  controllers: [SocialAuthController],
  providers: [SocialAuthService, MetaApiService],
  exports: [SocialAuthService, MetaApiService],
})
export class SocialAuthModule {}
