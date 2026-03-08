import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { StoryTemplatesService } from "./story-templates.service";
import { CreateStoryTemplateDto, UpdateStoryTemplateDto } from "./dto/create-story-template.dto";

@Controller("story-templates")
@UseGuards(JwtAuthGuard)
export class StoryTemplatesController {
  constructor(private readonly service: StoryTemplatesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.sub);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateStoryTemplateDto) {
    console.log("[StoryTemplates] create dto:", JSON.stringify(dto));
    return this.service.create(req.user.sub, dto);
  }

  @Patch(":id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateStoryTemplateDto) {
    return this.service.update(req.user.sub, id, dto);
  }

  @Delete(":id")
  remove(@Req() req: any, @Param("id") id: string) {
    return this.service.remove(req.user.sub, id);
  }
}
