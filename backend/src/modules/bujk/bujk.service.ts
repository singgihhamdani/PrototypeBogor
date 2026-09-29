import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBujkDto } from './dto/create-bujk.dto';
import { UpdateBujkDto } from './dto/update-bujk.dto';
import { AuthUser, RoleCode } from '../../common/types/auth.types';

@Injectable()
export class BujkService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    user: AuthUser,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      districtId?: number;
      status?: string;
    },
  ) {
    const page = Number(options?.page) || 1;
    const limit = Number(options?.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // 1. Tenant Isolation: Jika login sebagai OPERATOR_BUJK, hanya lihat BUJK miliknya
    if (user.role.code === RoleCode.OPERATOR_BUJK) {
      if (!user.bujkId) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
      where.id = user.bujkId;
    }

    if (options?.districtId) {
      where.districtId = Number(options.districtId);
    }

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { nib: { contains: options.search, mode: 'insensitive' } },
        { npwp: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.bujkMaster.findMany({
        where,
        skip,
        take: limit,
        include: {
          district: { select: { id: true, name: true, code: true } },
          _count: { select: { users: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.bujkMaster.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: AuthUser) {
    // Tenant Isolation Check
    if (user.role.code === RoleCode.OPERATOR_BUJK && user.bujkId !== id) {
      throw new ForbiddenException('Akses ditolak: Anda hanya berwenang melihat profil badan usaha milik sendiri');
    }

    const bujk = await this.prisma.bujkMaster.findUnique({
      where: { id },
      include: {
        district: true,
        users: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!bujk) {
      throw new NotFoundException(`Badan Usaha dengan ID ${id} tidak ditemukan`);
    }

    return bujk;
  }

  async create(dto: CreateBujkDto, user: AuthUser) {
    // Cek duplikasi NIB atau NPWP
    const existing = await this.prisma.bujkMaster.findFirst({
      where: {
        OR: [{ nib: dto.nib }, { npwp: dto.npwp }],
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.nib === dto.nib
          ? 'NIB ini sudah terdaftar dalam sistem'
          : 'NPWP ini sudah terdaftar dalam sistem',
      );
    }

    const bujk = await this.prisma.bujkMaster.create({
      data: {
        ...dto,
        status: 'APPROVED',
      },
    });

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        module: 'BUJK',
        recordId: bujk.id,
        newValues: dto as any,
      },
    });

    return bujk;
  }

  async update(id: string, dto: UpdateBujkDto, user: AuthUser) {
    const existing = await this.findOne(id, user);

    // Operator BUJK tidak boleh mengubah status persetujuan badan usaha
    if (user.role.code === RoleCode.OPERATOR_BUJK && dto.status) {
      delete dto.status;
    }

    const updated = await this.prisma.bujkMaster.update({
      where: { id },
      data: dto,
    });

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        module: 'BUJK',
        recordId: id,
        oldValues: existing as any,
        newValues: dto as any,
      },
    });

    return updated;
  }
}
