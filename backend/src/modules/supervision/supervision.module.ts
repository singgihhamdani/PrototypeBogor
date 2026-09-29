import { Module } from '@nestjs/common';
import { SupervisionService } from './supervision.service';
import { SupervisionController } from './supervision.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SupervisionService],
  controllers: [SupervisionController],
  exports: [SupervisionService],
})
export class SupervisionModule {}
