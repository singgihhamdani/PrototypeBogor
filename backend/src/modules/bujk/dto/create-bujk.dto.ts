import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Length,
} from 'class-validator';

export class CreateBujkDto {
  @ApiProperty({ example: 'PT Bangun Jaya Konstruksi' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'PT', enum: ['PT', 'CV', 'PO', 'KOPERASI'] })
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @ApiProperty({ example: '0220208192301', description: 'NIB 13 digit OSS-RBA' })
  @IsNotEmpty()
  @Length(13, 13, { message: 'NIB harus tepat 13 digit' })
  nib: string;

  @ApiProperty({ example: '01.234.567.8-403.000' })
  @IsNotEmpty()
  @IsString()
  npwp: string;

  @ApiProperty({ example: 'H. Bambang Irawan, SE' })
  @IsNotEmpty()
  @IsString()
  leaderName: string;

  @ApiProperty({ example: 'Budi Santoso, ST' })
  @IsNotEmpty()
  @IsString()
  pjtName: string;

  @ApiProperty({ example: 'Hendra Gunawan, ST', required: false })
  @IsOptional()
  @IsString()
  pjskName?: string;

  @ApiProperty({ example: 3201010, description: 'Kode Kecamatan BPS Cibinong' })
  @IsOptional()
  @IsInt()
  districtId?: number;

  @ApiProperty({ example: 'Jl. Raya Tegar Beriman No. 45, Cibinong' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: '16914', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: '021-87901234' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'admin@ptbangunjaya.co.id' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'https://ptbangunjaya.co.id', required: false })
  @IsOptional()
  @IsString()
  website?: string;
}
