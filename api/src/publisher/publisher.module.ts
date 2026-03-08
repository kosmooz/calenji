import { Module } from "@nestjs/common";
import { PublisherService } from "./publisher.service";
import { PublisherWorkerService } from "./publisher-worker.service";
import { MediaValidationService } from "./media-validation.service";
import { SocialAuthModule } from "../social-auth/social-auth.module";

@Module({
  imports: [SocialAuthModule],
  providers: [PublisherService, PublisherWorkerService, MediaValidationService],
  exports: [MediaValidationService],
})
export class PublisherModule {}
