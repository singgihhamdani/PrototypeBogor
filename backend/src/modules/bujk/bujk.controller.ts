import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BujkService } from './bujk.service';
import { CreateBujkDto } from './dto/create-bujk.dto';
import { UpdateBujkDto } from './dto/update-bujk.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermission } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleCode, AuthUser } from '../../common/types/auth.types';

@ApiTags('Master BUJK (Badan Usaha)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('bujk')
export class BujkController {
  constructor(private bujkService: BujkService) {}

  @Get()
  @Roles(
    RoleCode.SUPER_ADMIN,
    RoleCode.ADMIN_BIDANG,
    RoleCode.EKSEKUTIF,
    RoleCode.OPERATOR_BUJK,
  )
  @ApiOperation({
    summary: 'Daftar Badan Usaha Jasa Konstruksi (BUJK)',
    description:
      'Menampilkan daftar BUJK dengan filter pencarian, status, dan wilayah kecamatan. Untuk OPERATOR_BUJK data terisolasi otomatis.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'Bangun Jaya' })
  @ApiQuery({ name: 'districtId', required: false, example: 3201010 })
  @ApiQuery({ name: 'status', required: false, example: 'APPROVED' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('districtId') districtId?: number,
    @Query('status') status?: string,
  ) {
    return this.bujkService.findAll(user, {
      page,
      limit,
      search,
      districtId,
      status,
    });
  }

  @Get(':id')
  @Roles(
    RoleCode.SUPER_ADMIN,
    RoleCode.ADMIN_BIDANG,
    RoleCode.EKSEKUTIF,
    RoleCode.OPERATOR_BUJK,
  )
  @ApiOperation({
    summary: 'Detail Badan Usaha Jasa Konstruksi',
    description: 'Mengambil data lengkap satu BUJK berdasarkan ID unik.',
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bujkService.findOne(id, user);
  }

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN_BIDANG)
  @RequirePermission('BUJK', 'CREATE')
  @ApiOperation({
    summary: 'Registrasi BUJK Baru (Petugas Dinas)',
    description:
      'Menambahkan entri profil BUJK baru ke dalam database dan menerbitkan status APPROVED.',
  })
  @ApiResponse({ status: 201, description: 'BUJK berhasil ditambahkan.' })
  async create(
    @Body() createBujkDto: CreateBujkDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.bujkService.create(createBujkDto, user);
  }

  @Patch(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN_BIDANG, RoleCode.OPERATOR_BUJK)
  @UseGuards(TenantGuard)
  @RequirePermission('BUJK', 'UPDATE')
  @ApiOperation({
    summary: 'Pembaruan Data Profil BUJK',
    description:
      'Memperbarui data alamat, kontak, penanggung jawab teknis, atau status BUJK. Dilindungi isolasi tenant.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBujkDto: UpdateBujkDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.bujkService.update(id, updateBujkDto, user);
  }
}
