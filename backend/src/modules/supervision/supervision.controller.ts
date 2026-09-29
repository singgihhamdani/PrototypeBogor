import {
  Controller,
  Get,
  Post,
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
import { SupervisionService } from './supervision.service';
import { SubmitAuditDto } from './dto/submit-audit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermission } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleCode, AuthUser } from '../../common/types/auth.types';

@ApiTags('Pengawasan SIMAK & Audit 3 Tertib')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('supervision')
export class SupervisionController {
  constructor(private supervisionService: SupervisionService) {}

  @Get('checklists')
  @Roles(
    RoleCode.SUPER_ADMIN,
    RoleCode.ADMIN_BIDANG,
    RoleCode.EKSEKUTIF,
    RoleCode.OPERATOR_BUJK,
  )
  @ApiOperation({
    summary: 'Template Checklist Audit 3 Tertib',
    description:
      'Mengambil butir-butir standar audit Tertib Usaha, Tertib Penyelenggaraan (SMKK K3), atau Tertib Pemanfaatan.',
  })
  @ApiQuery({
    name: 'pilar',
    required: false,
    enum: ['TERTIB_USAHA', 'TERTIB_PENYELENGGARAAN', 'TERTIB_PEMANFAATAN'],
  })
  getChecklistTemplates(@Query('pilar') pilar?: string) {
    return this.supervisionService.getChecklistTemplates(pilar);
  }

  @Post('assess')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN_BIDANG)
  @RequirePermission('SUPERVISION', 'AUDIT')
  @ApiOperation({
    summary: 'Submit Penilaian Audit Lapangan (Tim Pengawas / Asesor)',
    description:
      'Menyimpan skor evaluasi lapangan per butir indikator, menghitung rata-rata, dan menetapkan predikat Tertib Baik/Cukup/Kurang.',
  })
  @ApiResponse({ status: 201, description: 'Penilaian audit berhasil disimpan.' })
  async submitAudit(
    @Body() submitAuditDto: SubmitAuditDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.supervisionService.submitAudit(submitAuditDto, user);
  }

  @Get('summary')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN_BIDANG, RoleCode.EKSEKUTIF)
  @ApiOperation({
    summary: 'Ringkasan Capaian Pengawasan Jakon Daerah',
    description:
      'Mendapatkan data statistik agregat indeks kepatuhan, total BUJK diaudit, dan rasio keselamatan K3.',
  })
  async getSummary() {
    return this.supervisionService.getSummary();
  }
}
