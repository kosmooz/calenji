import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { StoriesService } from "./stories.service";
import { CreateStoryDto, UpdateStoryDto } from "./dto/create-story.dto";

@Controller("stories")
@UseGuards(JwtAuthGuard)
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query("status") status?: string,
    @Query("socialAccountId") socialAccountId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.storiesService.findAll(req.user.sub, { status, socialAccountId, from, to });
  }

  @Get(":id")
  findOne(@Req() req: any, @Param("id") id: string) {
    return this.storiesService.findOne(req.user.sub, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateStoryDto) {
    return this.storiesService.create(req.user.sub, dto);
  }

  @Patch(":id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateStoryDto) {
    return this.storiesService.update(req.user.sub, id, dto);
  }

  @Delete(":id")
  remove(@Req() req: any, @Param("id") id: string) {
    return this.storiesService.remove(req.user.sub, id);
  }

  @Post(":id/duplicate")
  duplicate(
    @Req() req: any,
    @Param("id") id: string,
    @Body("scheduledAt") scheduledAt?: string,
  ) {
    return this.storiesService.duplicate(req.user.sub, id, scheduledAt);
  }

  @Post(":id/publish-now")
  publishNow(@Req() req: any, @Param("id") id: string) {
    return this.storiesService.publishNow(req.user.sub, id);
  }
}
