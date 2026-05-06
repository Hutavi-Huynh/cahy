import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsNumber, IsOptional, IsString,
  Max, Min, ValidateNested,
} from 'class-validator';

export class AttachmentDto {
  @IsString()
  url: string;

  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  size?: number;
}

export class CreateTaskResultDto {
  @ApiPropertyOptional({ example: 'Đã hoàn thành báo cáo, đính kèm file.' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 75.5, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionRate?: number;

  @ApiPropertyOptional({ type: [AttachmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];

  @ApiPropertyOptional({ description: 'Đánh dấu là bản giải trình chậm muộn' })
  @IsOptional()
  isExplanation?: boolean;
}
