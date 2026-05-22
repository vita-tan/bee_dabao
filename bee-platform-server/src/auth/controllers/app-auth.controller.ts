import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import {
  WechatLoginDto,
  BindPhoneDto,
  BeekeeperRegisterDto,
  UpdateBeekeeperProfileDto,
  DevLoginDto,
} from '../dto/auth.dto';
import { JwtBeekeeperGuard } from '../../common/guards/jwt-beekeeper.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('蜂农认证')
@Controller('app/auth')
export class AppAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('wechat-login')
  @ApiOperation({ summary: '微信小程序登录' })
  async wechatLogin(@Body() dto: WechatLoginDto) {
    return this.authService.wechatLogin(dto);
  }

  @Post('bind-phone')
  @ApiOperation({ summary: '绑定手机号' })
  async bindPhone(@Body() dto: BindPhoneDto) {
    return this.authService.bindPhone(dto);
  }

  @Post('register')
  @UseGuards(JwtBeekeeperGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '注册/补充蜂农信息' })
  async register(
    @Body() dto: BeekeeperRegisterDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.authService.register(dto, beekeeperId);
  }

  @Post('dev-login')
  @ApiOperation({ summary: 'H5调试登录（仅开发环境）' })
  async devLogin(@Body() dto: DevLoginDto, @Req() req: any) {
    const env = this.config.get<string>('NODE_ENV');
    if (env === 'production') {
      throw new Error('该接口仅开发环境可用');
    }
    return this.authService.devLogin(dto.phone);
  }

  @Get('profile')
  @UseGuards(JwtBeekeeperGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前蜂农信息' })
  async getProfile(@CurrentUser('id') beekeeperId: number) {
    return this.authService.getBeekeeperProfile(beekeeperId);
  }

  @Put('profile')
  @UseGuards(JwtBeekeeperGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新蜂农非实名信息' })
  async updateProfile(
    @Body() dto: UpdateBeekeeperProfileDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.authService.updateBeekeeperProfile(beekeeperId, dto);
  }
}
