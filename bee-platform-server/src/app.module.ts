import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ApiaryModule } from './apiary/apiary.module';
import { ProductionModule } from './production/production.module';
import { TraceModule } from './trace/trace.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // 全局配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASS', ''),
        database: config.get<string>('DB_NAME', 'bee_platform'),
        entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        charset: 'utf8mb4',
        timezone: '+08:00',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    // 限流模块
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // 认证模块
    AuthModule,

    // 蜂场管理模块
    ApiaryModule,

    // 生产记录模块
    ProductionModule,

    // 溯源 & 文件上传模块
    TraceModule,

    // 政府后台管理模块（蜂农管理、补贴、通知、系统、统计）
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
