import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Beekeeper } from '../entities/beekeeper.entity';
import { Admin } from '../entities/admin.entity';
import {
  BeekeeperJwtPayload,
} from './strategies/jwt-beekeeper.strategy';
import { AdminJwtPayload } from './strategies/jwt-admin.strategy';
import {
  WechatLoginDto,
  BindPhoneDto,
  BeekeeperRegisterDto,
  UpdateBeekeeperProfileDto,
  AdminLoginDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Beekeeper)
    private beekeeperRepo: Repository<Beekeeper>,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ==================== 蜂农端 ====================

  /**
   * 微信小程序登录
   */
  async wechatLogin(dto: WechatLoginDto) {
    // 调用微信 jscode2session 接口获取 openid
    const wxResult = await this.getWxOpenid(dto.code);

    if (!wxResult.openid) {
      return { isNew: true, tempToken: null, message: '微信登录失败' };
    }

    const beekeeper = await this.beekeeperRepo.findOne({
      where: { openid: wxResult.openid },
    });

    // 不存在 → 新用户
    if (!beekeeper) {
      // 生成临时 token（30分钟有效），用于绑定手机号
      const tempToken = this.jwtService.sign(
        { sub: 0, type: 'temp', openid: wxResult.openid },
        { expiresIn: '30m' },
      );
      return { isNew: true, tempToken };
    }

    // 已冻结
    if (beekeeper.status === 2) {
      throw new Error('账号已冻结');
    }

    // 待审核
    if (beekeeper.status === 0) {
      const token = this.generateBeekeeperToken(beekeeper);
      return { isNew: false, status: 0, token, message: '账号审核中' };
    }

    // 正常
    const token = this.generateBeekeeperToken(beekeeper);
    return {
      isNew: false,
      status: 1,
      token,
      beekeeper: this.sanitizeBeekeeper(beekeeper),
    };
  }

  /**
   * 绑定手机号
   */
  async bindPhone(dto: BindPhoneDto) {
    // 验证 tempToken
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.tempToken);
    } catch {
      throw new Error('临时token已过期，请重新登录');
    }

    if (payload.type !== 'temp') {
      throw new Error('无效的token类型');
    }

    // 通过微信接口获取手机号（模拟，实际需要调用微信API）
    const phone = await this.getWxPhoneNumber(dto.phoneCode);
    if (!phone) {
      throw new Error('获取手机号失败');
    }

    // 检查手机号是否已被绑定
    const existing = await this.beekeeperRepo.findOne({ where: { phone } });
    if (existing) {
      throw new Error('该手机号已被其他账号绑定');
    }

    // 创建蜂农记录
    const beekeeper = this.beekeeperRepo.create({
      openid: payload.openid,
      phone,
      status: 0, // 待审核
    });
    await this.beekeeperRepo.save(beekeeper);

    const token = this.generateBeekeeperToken(beekeeper);
    return { token, beekeeper: this.sanitizeBeekeeper(beekeeper), status: 0 };
  }

  /**
   * 蜂农注册/补充信息
   */
  async register(dto: BeekeeperRegisterDto, beekeeperId: number) {
    const beekeeper = await this.beekeeperRepo.findOne({
      where: { id: beekeeperId },
    });
    if (!beekeeper) {
      throw new Error('蜂农不存在');
    }

    Object.assign(beekeeper, {
      name: dto.name,
      idCard: dto.idCard,
      province: dto.province,
      city: dto.city,
      district: dto.district,
      town: dto.town,
      regionCode: dto.regionCode,
      address: dto.address,
      expYears: dto.expYears,
      beeBreed: dto.beeBreed,
      certNo: dto.certNo,
      certImage: dto.certImage,
      status: 0, // 提交后变为待审核
    });

    await this.beekeeperRepo.save(beekeeper);
    return { message: '注册信息已提交，请等待审核' };
  }

  /**
   * 获取蜂农信息
   */
  async getBeekeeperProfile(beekeeperId: number) {
    const beekeeper = await this.beekeeperRepo.findOne({
      where: { id: beekeeperId },
    });
    if (!beekeeper) {
      throw new Error('蜂农不存在');
    }
    return this.sanitizeBeekeeper(beekeeper);
  }

  /**
   * 更新蜂农非实名信息
   */
  async updateBeekeeperProfile(
    beekeeperId: number,
    dto: UpdateBeekeeperProfileDto,
  ) {
    const beekeeper = await this.beekeeperRepo.findOne({
      where: { id: beekeeperId },
    });
    if (!beekeeper) {
      throw new Error('蜂农不存在');
    }

    if (dto.avatar !== undefined) beekeeper.avatar = dto.avatar;
    if (dto.beeBreed !== undefined) beekeeper.beeBreed = dto.beeBreed;

    await this.beekeeperRepo.save(beekeeper);
    return this.sanitizeBeekeeper(beekeeper);
  }

  // ==================== 管理员端 ====================

  /**
   * H5 调试登录（仅开发环境）
   */
  async devLogin(phone: string) {
    const beekeeper = await this.beekeeperRepo.findOne({
      where: { phone },
    });
    if (!beekeeper) {
      throw new Error('该手机号未注册');
    }
    const token = this.generateBeekeeperToken(beekeeper);
    return {
      isNew: false,
      status: beekeeper.status,
      token,
      beekeeper: this.sanitizeBeekeeper(beekeeper),
    };
  }

  /**
   * 管理员登录
   */
  async adminLogin(dto: AdminLoginDto, ip: string) {
    // 确定登录方式
    let admin: Admin | null = null;

    if (dto.username) {
      admin = await this.adminRepo.findOne({ where: { username: dto.username } });
    } else if (dto.phone) {
      admin = await this.adminRepo.findOne({ where: { phone: dto.phone } });
    }

    if (!admin) {
      throw new Error('账号不存在');
    }
    if (admin.status !== 1) {
      throw new Error('账号已停用');
    }

    // 验证密码
    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) {
      throw new Error('密码错误');
    }

    // 更新最后登录信息
    await this.adminRepo.update(admin.id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });

    const token = this.generateAdminToken(admin);
    return {
      token,
      adminInfo: {
        id: admin.id,
        username: admin.username,
        realName: admin.realName,
        roleId: admin.roleId,
        regionCode: admin.regionCode,
      },
    };
  }

  /**
   * 获取管理员信息
   */
  async getAdminInfo(adminId: number) {
    const admin = await this.adminRepo.findOne({
      where: { id: adminId },
      select: [
        'id',
        'username',
        'realName',
        'phone',
        'roleId',
        'regionCode',
        'status',
        'lastLoginAt',
      ],
    });
    if (!admin) {
      throw new Error('管理员不存在');
    }
    return admin;
  }

  /**
   * 修改密码
   */
  async changePassword(adminId: number, dto: ChangePasswordDto) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new Error('管理员不存在');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, admin.password);
    if (!isMatch) {
      throw new Error('旧密码错误');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.adminRepo.update(adminId, { password: hashedPassword });
    return { message: '密码修改成功' };
  }

  // ==================== 私有方法 ====================

  private generateBeekeeperToken(beekeeper: Beekeeper): string {
    const payload: BeekeeperJwtPayload = {
      sub: beekeeper.id,
      type: 'beekeeper',
      openid: beekeeper.openid,
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '2h') as any,
    });
  }

  private generateAdminToken(admin: Admin): string {
    const payload: AdminJwtPayload = {
      sub: admin.id,
      type: 'admin',
      role: String(admin.roleId ?? ''),
      regionCode: admin.regionCode ?? '',
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '2h') as any,
    });
  }

  private sanitizeBeekeeper(b: Beekeeper) {
    return {
      id: b.id,
      openid: b.openid,
      phone: b.phone,
      name: b.name,
      avatar: b.avatar,
      regionCode: b.regionCode,
      province: b.province,
      city: b.city,
      district: b.district,
      town: b.town,
      address: b.address,
      expYears: b.expYears,
      beeBreed: b.beeBreed,
      certNo: b.certNo,
      certImage: b.certImage,
      level: b.level,
      creditScore: b.creditScore,
      status: b.status,
      createdAt: b.createdAt,
    };
  }

  /**
   * 调用微信 jscode2session 接口
   */
  private async getWxOpenid(code: string) {
    const appId = this.config.get<string>('WECHAT_APP_ID');
    const secret = this.config.get<string>('WECHAT_APP_SECRET');

    if (!appId || !secret) {
      // 开发环境：如果没有配置微信参数，用模拟数据
      console.warn('[DEV] 未配置微信参数，使用模拟openid');
      return { openid: `dev_openid_${code}`, session_key: 'mock_session' };
    }

    try {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('微信登录失败:', error);
      return { openid: null };
    }
  }

  /**
   * 获取微信手机号（需要 access_token）
   */
  private async getWxPhoneNumber(phoneCode: string): Promise<string | null> {
    const appId = this.config.get<string>('WECHAT_APP_ID');
    const secret = this.config.get<string>('WECHAT_APP_SECRET');

    if (!appId || !secret) {
      // 开发环境模拟
      console.warn('[DEV] 未配置微信参数，使用模拟手机号');
      return `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
    }

    try {
      // 先获取 access_token
      const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`;
      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (!tokenData.access_token) {
        console.error('获取access_token失败:', tokenData);
        return null;
      }

      // 用 phoneCode 换取手机号
      const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${tokenData.access_token}`;
      const phoneRes = await fetch(phoneUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: phoneCode }),
      });
      const phoneData = await phoneRes.json();

      if (phoneData.errcode === 0) {
        return phoneData.phone_info.phoneNumber;
      }
      console.error('获取手机号失败:', phoneData);
      return null;
    } catch (error) {
      console.error('获取手机号异常:', error);
      return null;
    }
  }
}
