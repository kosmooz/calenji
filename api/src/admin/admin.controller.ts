import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { AdminService } from "./admin.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateShopSettingsDto } from "./dto/update-shop-settings.dto";
import { ListUsersQueryDto } from "./dto/list-users-query.dto";
import { CreateAddressDto } from "../auth/dto/create-address.dto";
import { UpdateAddressDto } from "../auth/dto/update-address.dto";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ─── Stats ─────────────────────────────────────────────────────────

  @Get("stats")
  async getStats() {
    return this.adminService.getStats();
  }

  @Get("dashboard")
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  // ─── Users CRUD ────────────────────────────────────────────────────

  @Get("users")
  async listUsers(@Query() query: ListUsersQueryDto) {
    return this.adminService.listUsers(
      query.search,
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 20,
      query.includeDeleted === "true",
      query.includeAddresses === "true",
    );
  }

  @Get("users/:id")
  async getUser(@Param("id") id: string) {
    return this.adminService.getUser(id);
  }

  @Post("users")
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch("users/:id")
  async updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete("users/:id")
  async softDeleteUser(@Param("id") id: string) {
    return this.adminService.softDeleteUser(id);
  }

  @Patch("users/:id/restore")
  async restoreUser(@Param("id") id: string) {
    return this.adminService.restoreUser(id);
  }

  // ─── User Addresses ───────────────────────────────────────────────

  @Post("users/:id/addresses")
  async createUserAddress(
    @Param("id") userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.adminService.createUserAddress(userId, dto);
  }

  @Patch("users/:userId/addresses/:addressId")
  async updateUserAddress(
    @Param("userId") userId: string,
    @Param("addressId") addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.adminService.updateUserAddress(userId, addressId, dto);
  }

  @Delete("users/:userId/addresses/:addressId")
  async deleteUserAddress(
    @Param("userId") userId: string,
    @Param("addressId") addressId: string,
  ) {
    return this.adminService.deleteUserAddress(userId, addressId);
  }

  // ─── Settings ─────────────────────────────────────────────────────

  @Get("shop-settings")
  async getShopSettings() {
    return this.adminService.getShopSettings();
  }

  @Patch("shop-settings")
  async updateShopSettings(@Body() dto: UpdateShopSettingsDto) {
    return this.adminService.updateShopSettings(dto);
  }

  @Post("shop-settings/test-smtp")
  async testSmtp(@Req() req: any) {
    return this.adminService.testSmtp(req.user.email);
  }
}
