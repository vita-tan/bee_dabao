import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { AdminLoginDto, ChangePasswordDto } from '../dto/auth.dto';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('管理员认证')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登录' })
  async login(@Body() dto: AdminLoginDto, @Req() req: any) {
    const ip = req.ip ?? req.connection?.remoteAddress ?? '';
    return this.authService.adminLogin(dto, ip);
  }

  @Post('logout')
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员退出登录' })
  async logout() {
    // TODO: 将 token 加入 Redis 黑名单
    return { message: '退出成功' };
  }

  @Get('me')
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前管理员信息' })
  async getMe(@CurrentUser('id') adminId: number) {
    return this.authService.getAdminInfo(adminId);
  }

  @Put('password')
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @CurrentUser('id') adminId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(adminId, dto);
  }
}
