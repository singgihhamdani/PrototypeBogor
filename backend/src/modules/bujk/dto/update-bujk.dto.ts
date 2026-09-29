import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsInt, Length } from 'class-validator';

export class UpdateBujkDto {
  @ApiPropertyOptional({ example: 'PT Bangun Jaya Konstruksi' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'PT' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ example: '01.234.567.8-403.000' })
  @IsOptional()
  @IsString()
  npwp?: string;

  @ApiPropertyOptional({ example: 'H. Bambang Irawan, SE' })
  @IsOptional()
  @IsString()
  leaderName?: string;

  @ApiPropertyOptional({ example: 'Budi Santoso, ST' })
  @IsOptional()
  @IsString()
  pjtName?: string;

  @ApiPropertyOptional({ example: 'Hendra Gunawan, ST' })
  @IsOptional()
  @IsString()
  pjskName?: string;

  @ApiPropertyOptional({ example: 3201010 })
  @IsOptional()
  @IsInt()
  districtId?: number;

  @ApiPropertyOptional({ example: 'Jl. Raya Tegar Beriman No. 45' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '16914' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: '021-87901234' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'admin@ptbangunjaya.co.id' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://ptbangunjaya.co.id' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'APPROVED', enum: ['DRAFT', 'PENDING_VERIFICATION', 'APPROVED', 'SUSPENDED'] })
  @IsOptional()
  @IsString()
  status?: string;
}
