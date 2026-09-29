import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { BujkModule } from './modules/bujk/bujk.module';
import { SupervisionModule } from './modules/supervision/supervision.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    RolesModule,
    BujkModule,
    SupervisionModule,
  ],
})
export class AppModule {}
