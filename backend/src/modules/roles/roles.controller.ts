import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleCode } from '../../common/types/auth.types';

@ApiTags('Manajemen Role & RBAC')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.SUPER_ADMIN)
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiOperation({
    summary: 'Daftar Semua Peran (Roles)',
    description: 'Menampilkan seluruh role sistem beserta jumlah pengguna dan izin aktif.',
  })
  @ApiResponse({ status: 200, description: 'Daftar peran berhasil diambil.' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail Peran & Izin',
    description: 'Mengambil informasi lengkap satu peran tertentu beserta seluruh permission-nya.',
  })
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Get(':id/permissions')
  @ApiOperation({
    summary: 'Ambil Matriks Hak Akses Peran',
    description: 'Mendapatkan daftar 105 kombinasi Resource × Action untuk peran target.',
  })
  async getPermissions(@Param('id') id: string) {
    return this.rolesService.getPermissions(id);
  }

  @Put(':id/permissions')
  @ApiOperation({
    summary: 'Perbarui Matriks Hak Akses Peran (Bulk Update)',
    description:
      'Memperbarui status granted/revoked dari izin-izin yang ditentukan untuk peran target.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              resource: { type: 'string', example: 'SUPERVISION' },
              action: { type: 'string', example: 'CREATE' },
              isGranted: { type: 'boolean', example: true },
            },
          },
        },
      },
      required: ['permissions'],
    },
  })
  async updatePermissions(
    @Param('id') id: string,
    @Body('permissions')
    permissions: Array<{ resource: string; action: string; isGranted: boolean }>,
  ) {
    return this.rolesService.updatePermissions(id, permissions);
  }
}
