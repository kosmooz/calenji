import { Global, Module } from "@nestjs/common";
import { MediaHostService } from "./media-host.service";

@Global()
@Module({
  providers: [MediaHostService],
  exports: [MediaHostService],
})
export class MediaHostModule {}
