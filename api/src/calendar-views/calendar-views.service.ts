import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateCalendarViewDto,
  UpdateCalendarViewDto,
} from "./dto/create-calendar-view.dto";

@Injectable()
export class CalendarViewsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.calendarView.findMany({
      where: { userId },
      orderBy: { position: "asc" },
    });
  }

  async create(userId: string, dto: CreateCalendarViewDto) {
    if (dto.position === undefined) {
      const last = await this.prisma.calendarView.findFirst({
        where: { userId },
        orderBy: { position: "desc" },
      });
      dto.position = last ? last.position + 1 : 0;
    }

    return this.prisma.calendarView.create({
      data: {
        userId,
        name: dto.name,
        socialAccountIds: dto.socialAccountIds,
        position: dto.position,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateCalendarViewDto) {
    const view = await this.prisma.calendarView.findFirst({
      where: { id, userId },
    });
    if (!view) throw new NotFoundException("Vue non trouvée");

    return this.prisma.calendarView.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    const view = await this.prisma.calendarView.findFirst({
      where: { id, userId },
    });
    if (!view) throw new NotFoundException("Vue non trouvée");

    return this.prisma.calendarView.delete({ where: { id } });
  }
}
