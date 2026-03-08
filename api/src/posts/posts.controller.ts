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
import { PostsService } from "./posts.service";
import { CreatePostDto, UpdatePostDto } from "./dto/create-post.dto";

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query("status") status?: string,
    @Query("socialAccountId") socialAccountId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.postsService.findAll(req.user.sub, {
      status,
      socialAccountId,
      from,
      to,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(":id")
  findOne(@Req() req: any, @Param("id") id: string) {
    return this.postsService.findOne(req.user.sub, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(req.user.sub, dto);
  }

  @Patch(":id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(req.user.sub, id, dto);
  }

  @Delete(":id")
  remove(@Req() req: any, @Param("id") id: string) {
    return this.postsService.remove(req.user.sub, id);
  }

  @Post("validate")
  validate(@Req() req: any, @Body() body: any) {
    return this.postsService.validateForFrontend(req.user.sub, body);
  }

  @Post(":id/publish-now")
  publishNow(@Req() req: any, @Param("id") id: string) {
    return this.postsService.publishNow(req.user.sub, id);
  }

  @Post(":id/duplicate")
  duplicate(
    @Req() req: any,
    @Param("id") id: string,
    @Body("scheduledAt") scheduledAt?: string,
  ) {
    return this.postsService.duplicate(req.user.sub, id, scheduledAt);
  }
}
