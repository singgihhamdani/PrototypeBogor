import { Module } from '@nestjs/common';
import { BujkService } from './bujk.service';
import { BujkController } from './bujk.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BujkService],
  controllers: [BujkController],
  exports: [BujkService],
})
export class BujkModule {}
