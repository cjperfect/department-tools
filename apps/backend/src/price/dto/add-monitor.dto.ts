import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  MinLength,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MonitorItemIn {
  @IsString()
  platform: string;

  @IsString()
  @MinLength(1)
  url: string;

  @IsNumber()
  @Min(0)
  targetPrice: number;
}

export class AddMonitorRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MonitorItemIn)
  items: MonitorItemIn[];
}
