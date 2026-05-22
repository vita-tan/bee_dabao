import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AppAuthController } from './controllers/app-auth.controller';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { JwtBeekeeperStrategy } from './strategies/jwt-beekeeper.strategy';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';
import { Beekeeper } from '../entities/beekeeper.entity';
import { Admin } from '../entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Beekeeper, Admin]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'bee_platform_dev_secret_key'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '2h') as any,
        },
      }),
    }),
  ],
  controllers: [AppAuthController, AdminAuthController],
  providers: [AuthService, JwtBeekeeperStrategy, JwtAdminStrategy],
  exports: [AuthService],
})
export class AuthModule {}
