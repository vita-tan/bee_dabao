import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import {
  CreateInspectionDto,
  QueryInspectionDto,
  CreateHarvestDto,
  QueryHarvestDto,
  CreateMedicationDto,
  QueryMedicationDto,
  CreateAccountDto,
  QueryAccountDto,
} from './dto/production.dto';
import { JwtBeekeeperGuard } from '../common/guards/jwt-beekeeper.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('巡查记录（蜂农端）')
@Controller('app/inspections')
@UseGuards(JwtBeekeeperGuard)
@ApiBearerAuth()
export class InspectionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @ApiOperation({ summary: '创建巡查记录' })
  create(@Body() dto: CreateInspectionDto, @CurrentUser('id') beekeeperId: number) {
    return this.productionService.createInspection(dto, beekeeperId);
  }

  @Get()
  @ApiOperation({ summary: '巡查记录列表' })
  list(
    @Query() dto: QueryInspectionDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.productionService.listInspections(beekeeperId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '巡查记录详情' })
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.productionService.getInspection(id, beekeeperId);
  }
}

@ApiTags('采蜜记录（蜂农端）')
@Controller('app/harvests')
@UseGuards(JwtBeekeeperGuard)
@ApiBearerAuth()
export class HarvestController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @ApiOperation({ summary: '创建采蜜记录' })
  create(@Body() dto: CreateHarvestDto, @CurrentUser('id') beekeeperId: number) {
    return this.productionService.createHarvest(dto, beekeeperId);
  }

  @Get()
  @ApiOperation({ summary: '采蜜记录列表' })
  list(
    @Query() dto: QueryHarvestDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.productionService.listHarvests(beekeeperId, dto);
  }

  @Get('inventory')
  @ApiOperation({ summary: '库存汇总' })
  inventory(@CurrentUser('id') beekeeperId: number) {
    return this.productionService.getInventory(beekeeperId);
  }

  @Get(':id')
  @ApiOperation({ summary: '采蜜记录详情' })
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.productionService.getHarvest(id, beekeeperId);
  }
}

@ApiTags('用药记录（蜂农端）')
@Controller('app/medications')
@UseGuards(JwtBeekeeperGuard)
@ApiBearerAuth()
export class MedicationController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @ApiOperation({ summary: '创建用药记录' })
  create(@Body() dto: CreateMedicationDto, @CurrentUser('id') beekeeperId: number) {
    return this.productionService.createMedication(dto, beekeeperId);
  }

  @Get()
  @ApiOperation({ summary: '用药记录列表' })
  list(
    @Query() dto: QueryMedicationDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.productionService.listMedications(beekeeperId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '用药记录详情' })
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.productionService.getMedication(id, beekeeperId);
  }
}

@ApiTags('收支记录（蜂农端）')
@Controller('app/accounts')
@UseGuards(JwtBeekeeperGuard)
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @ApiOperation({ summary: '创建收支记录' })
  create(@Body() dto: CreateAccountDto, @CurrentUser('id') beekeeperId: number) {
    return this.productionService.createAccount(dto, beekeeperId);
  }

  @Get()
  @ApiOperation({ summary: '收支记录列表' })
  list(
    @Query() dto: QueryAccountDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.productionService.listAccounts(beekeeperId, dto);
  }

  @Get('summary')
  @ApiOperation({ summary: '收支统计摘要' })
  summary(@CurrentUser('id') beekeeperId: number) {
    return this.productionService.getAccountSummary(beekeeperId);
  }
}
