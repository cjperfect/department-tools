import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MonitorItemIn {
  @IsString()
  platform: string;

  @IsNumber()
  @Min(0)
  targetPrice: number;
}

export class AddMonitorRequest {
  @IsString()
  keyword: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MonitorItemIn)
  items: MonitorItemIn[];
}
