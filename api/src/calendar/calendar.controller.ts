import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CalendarService } from "./calendar.service";

@Controller("calendar")
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getItems(
    @Req() req: any,
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("socialAccountId") socialAccountId?: string,
  ) {
    return this.calendarService.getItems(
      req.user.sub,
      from,
      to,
      socialAccountId,
    );
  }

  @Patch(":type/:id/reschedule")
  reschedule(
    @Req() req: any,
    @Param("type") type: string,
    @Param("id") id: string,
    @Body("scheduledAt") scheduledAt: string,
  ) {
    return this.calendarService.reschedule(
      req.user.sub,
      type,
      id,
      scheduledAt,
    );
  }
}
