import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiaryService } from './apiary.service';
import {
  CreateApiaryDto,
  UpdateApiaryDto,
  CreateHiveDto,
  BatchCreateHiveDto,
  UpdateHiveDto,
} from './dto/apiary.dto';
import { JwtBeekeeperGuard } from '../common/guards/jwt-beekeeper.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('蜂场管理（蜂农端）')
@Controller('app/apiaries')
@UseGuards(JwtBeekeeperGuard)
@ApiBearerAuth()
export class ApiaryController {
  constructor(private readonly apiaryService: ApiaryService) {}

  // ==================== 蜂场 ====================

  @Get()
  @ApiOperation({ summary: '获取我的蜂场列表' })
  listApiaries(@CurrentUser('id') beekeeperId: number) {
    return this.apiaryService.listApiaries(beekeeperId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取蜂场详情（含蜂箱列表）' })
  getApiaryDetail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.apiaryService.getApiaryDetail(id, beekeeperId);
  }

  @Post()
  @ApiOperation({ summary: '创建蜂场' })
  createApiary(
    @Body() dto: CreateApiaryDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.apiaryService.createApiary(dto, beekeeperId);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑蜂场' })
  updateApiary(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApiaryDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.apiaryService.updateApiary(id, dto, beekeeperId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除蜂场（软删除）' })
  deleteApiary(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.apiaryService.deleteApiary(id, beekeeperId);
  }

  // ==================== 蜂箱 ====================

  @Get(':id/hives')
  @ApiOperation({ summary: '获取蜂场下所有蜂箱' })
  listHives(
    @Param('id', ParseIntPipe) apiaryId: number,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.apiaryService.listHives(apiaryId, beekeeperId);
  }

  @Post(':id/hives')
  @ApiOperation({ summary: '创建蜂箱' })
  createHive(
    @Param('id', ParseIntPipe) apiaryId: number,
    @Body() dto: CreateHiveDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.apiaryService.createHive(apiaryId, beekeeperId, dto);
  }

  @Post(':id/hives/batch')
  @ApiOperation({ summary: '批量创建蜂箱' })
  batchCreateHives(
    @Param('id', ParseIntPipe) apiaryId: number,
    @Body() dto: BatchCreateHiveDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.apiaryService.batchCreateHives(apiaryId, beekeeperId, dto);
  }

  @Put('hives/:hiveId')
  @ApiOperation({ summary: '编辑蜂箱' })
  updateHive(
    @Param('hiveId', ParseIntPipe) hiveId: number,
    @Body() dto: UpdateHiveDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.apiaryService.updateHive(hiveId, beekeeperId, dto);
  }
}
