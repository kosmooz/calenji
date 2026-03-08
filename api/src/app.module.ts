import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { MailModule } from "./mail/mail.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { AdminModule } from "./admin/admin.module";
import { UploadModule } from "./upload/upload.module";
import { CryptoModule } from "./crypto/crypto.module";
import { SocialAuthModule } from "./social-auth/social-auth.module";
import { PostsModule } from "./posts/posts.module";
import { StoriesModule } from "./stories/stories.module";
import { CalendarModule } from "./calendar/calendar.module";
import { PublisherModule } from "./publisher/publisher.module";
import { MediaHostModule } from "./media-host/media-host.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    PrismaModule,
    MailModule,
    CryptoModule,
    MediaHostModule,
    AuthModule,
    UsersModule,
    AdminModule,
    UploadModule,
    SocialAuthModule,
    PostsModule,
    StoriesModule,
    CalendarModule,
    PublisherModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
