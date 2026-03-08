import { Module } from "@nestjs/common";
import { CalendarViewsController } from "./calendar-views.controller";
import { CalendarViewsService } from "./calendar-views.service";

@Module({
  controllers: [CalendarViewsController],
  providers: [CalendarViewsService],
})
export class CalendarViewsModule {}
