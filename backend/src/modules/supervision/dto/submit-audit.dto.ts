import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class SubmitAuditItemDto {
  @ApiProperty({ example: 'K3-01' })
  @IsNotEmpty()
  @IsString()
  itemCode: string;

  @ApiProperty({ example: 'Ketersediaan APD & Rambu Keselamatan Kerja' })
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @ApiProperty({ example: 90, description: 'Skor 0 - 100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ example: 'Sesuai standar Permen PUPR 10/2021', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubmitAuditDto {
  @ApiProperty({ example: 'bujk_demo_001', description: 'ID BUJK yang diaudit' })
  @IsNotEmpty()
  @IsString()
  bujkId: string;

  @ApiProperty({ example: 'P001', description: 'ID Paket Pekerjaan / Proyek' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({
    example: 'TERTIB_PENYELENGGARAAN',
    enum: ['TERTIB_USAHA', 'TERTIB_PENYELENGGARAAN', 'TERTIB_PEMANFAATAN'],
  })
  @IsNotEmpty()
  @IsString()
  pilar: string;

  @ApiProperty({ type: [SubmitAuditItemDto] })
  @IsArray()
  items: SubmitAuditItemDto[];

  @ApiProperty({ example: 'Penerapan SMKK berjalan sangat baik dengan Zero Accident.', required: false })
  @IsOptional()
  @IsString()
  generalNotes?: string;
}
