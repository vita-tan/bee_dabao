import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TraceService } from './trace.service';
import { UploadService } from './upload.service';
import { CreateTraceDto, QueryTraceDto } from './dto/trace.dto';
import { JwtBeekeeperGuard } from '../common/guards/jwt-beekeeper.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('溯源管理（蜂农端）')
@Controller('app/trace')
@UseGuards(JwtBeekeeperGuard)
@ApiBearerAuth()
export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  @Post('generate')
  @ApiOperation({ summary: '生成溯源码' })
  generate(
    @Body() dto: CreateTraceDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.traceService.generateCode(dto, beekeeperId);
  }

  @Get()
  @ApiOperation({ summary: '我的溯源码列表' })
  list(
    @Query() dto: QueryTraceDto,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.traceService.listMyCodes(beekeeperId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '溯源码详情（含二维码URL）' })
  detail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') beekeeperId: number,
  ) {
    return this.traceService.getTraceDetail(id, beekeeperId);
  }
}

@ApiTags('溯源公开查询')
@Controller('trace')
export class TracePublicController {
  constructor(private readonly traceService: TraceService) {}

  @Get(':code')
  @ApiOperation({ summary: '溯源码公开查询（无需登录）' })
  query(@Param('code') code: string) {
    return this.traceService.queryByCode(code);
  }
}

@ApiTags('文件上传')
@Controller('common/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: '上传图片（jpg/png/webp, ≤10MB）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          cb(new BadRequestException('仅支持 jpg/png/webp 格式'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择要上传的文件');
    return this.uploadService.uploadImage(file);
  }

  @Post('file')
  @ApiOperation({ summary: '上传文件（pdf/doc/docx, ≤50MB）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowed.includes(file.mimetype)) {
          cb(new BadRequestException('仅支持 pdf/doc/docx 格式'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择要上传的文件');
    return this.uploadService.uploadFile(file);
  }
}
