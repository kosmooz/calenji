import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CalendarViewsService } from "./calendar-views.service";
import {
  CreateCalendarViewDto,
  UpdateCalendarViewDto,
} from "./dto/create-calendar-view.dto";

@Controller("calendar-views")
@UseGuards(JwtAuthGuard)
export class CalendarViewsController {
  constructor(private readonly service: CalendarViewsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.sub);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateCalendarViewDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Patch(":id")
  update(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: UpdateCalendarViewDto,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }

  @Delete(":id")
  remove(@Req() req: any, @Param("id") id: string) {
    return this.service.remove(req.user.sub, id);
  }
}
