import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAuditDto } from './dto/submit-audit.dto';
import { AuthUser } from '../../common/types/auth.types';

@Injectable()
export class SupervisionService {
  constructor(private prisma: PrismaService) {}

  getChecklistTemplates(pilar?: string) {
    const templates = [
      {
        pilar: 'TERTIB_USAHA',
        name: 'Kesesuaian Izin Berusaha, NIB & SBU',
        items: [
          { code: 'TU-01', description: 'Keabsahan dan masa berlaku NIB OSS-RBA' },
          { code: 'TU-02', description: 'Kesesuaian Sertifikat Badan Usaha (SBU) dengan paket pekerjaan' },
          { code: 'TU-03', description: 'Ketersediaan Penanggung Jawab Teknis Badan Usaha (PJTBU)' },
        ],
      },
      {
        pilar: 'TERTIB_PENYELENGGARAAN',
        name: 'Kontrak Konstruksi & Penerapan SMKK (K3)',
        items: [
          { code: 'TP-01', description: 'Standar dokumen kontrak kerja konstruksi' },
          { code: 'TP-02', description: 'Penerapan Sistem Manajemen Keselamatan Konstruksi (SMKK)' },
          { code: 'TP-03', description: 'Ketersediaan Petugas K3 Konstruksi bersertifikat' },
          { code: 'TP-04', description: 'Pencatatan jam kerja selamat & Zero Fatal Accident' },
        ],
      },
      {
        pilar: 'TERTIB_PEMANFAATAN',
        name: 'Fungsi Bangunan & Pemeliharaan Konstruksi',
        items: [
          { code: 'TM-01', description: 'Kesesuaian peruntukan fungsi bangunan gedung' },
          { code: 'TM-02', description: 'Ketersediaan dokumen As-Built Drawing' },
          { code: 'TM-03', description: 'Rencana pemeliharaan berkala pasca-konstruksi' },
        ],
      },
    ];

    if (pilar) {
      return templates.filter((t) => t.pilar === pilar.toUpperCase());
    }
    return templates;
  }

  async submitAudit(dto: SubmitAuditDto, user: AuthUser) {
    // 1. Verifikasi BUJK ada
    const bujk = await this.prisma.bujkMaster.findUnique({
      where: { id: dto.bujkId },
    });

    if (!bujk) {
      throw new NotFoundException(`BUJK dengan ID ${dto.bujkId} tidak ditemukan`);
    }

    // 2. Hitung Rata-rata Skor
    const totalScore = dto.items.reduce((sum, item) => sum + item.score, 0);
    const averageScore = dto.items.length > 0 ? Number((totalScore / dto.items.length).toFixed(1)) : 0;

    let predicate = 'Tertib Kurang';
    if (averageScore >= 80) {
      predicate = 'Tertib Baik';
    } else if (averageScore >= 60) {
      predicate = 'Tertib Cukup';
    }

    const inspectionRecord = {
      id: `insp_${Date.now()}`,
      bujkId: dto.bujkId,
      bujkName: bujk.name,
      projectId: dto.projectId,
      pilar: dto.pilar,
      averageScore,
      predicate,
      auditorId: user.id,
      auditorName: user.fullName,
      evaluatedAt: new Date().toISOString(),
      items: dto.items,
      generalNotes: dto.generalNotes || 'Pemeriksaan lapangan selesai dilaksanakan.',
    };

    // 3. Catat di Audit Trail
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AUDIT',
        module: 'SUPERVISION',
        recordId: dto.bujkId,
        newValues: inspectionRecord as any,
      },
    });

    return {
      success: true,
      message: 'Penilaian audit SIMAK 3 Tertib berhasil disimpan',
      data: inspectionRecord,
    };
  }

  async getSummary() {
    return {
      overallCompliance: 74.8,
      totalAuditedBujk: 480,
      scheduledInspections: 38,
      zeroFatalAccidentRate: '100%',
      pilarSummary: [
        { pilar: 'Tertib Usaha', score: 72, status: 'Baik' },
        { pilar: 'Tertib Penyelenggaraan', score: 65, status: 'Cukup' },
        { pilar: 'Tertib Pemanfaatan', score: 58, status: 'Cukup' },
      ],
    };
  }
}
