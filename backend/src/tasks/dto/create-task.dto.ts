import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TaskFrequency } from '../../common/enums/task-frequency.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'Báo cáo tháng 5' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  leadDepartmentId?: number;

  @ApiPropertyOptional({ example: [2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  cooperatingDepartmentIds?: number[];

  @ApiPropertyOptional({ enum: TaskFrequency, default: TaskFrequency.ONCE })
  @IsEnum(TaskFrequency)
  @IsOptional()
  frequency?: TaskFrequency;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ description: 'Số ngày/giờ trước hạn để nhắc việc', example: 3 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reminderBefore?: number;

  @ApiPropertyOptional({ example: 'An ninh trật tự' })
  @IsString()
  @IsOptional()
  linhVuc?: string;
}
