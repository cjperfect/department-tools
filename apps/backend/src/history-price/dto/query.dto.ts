import { IsString, IsOptional } from 'class-validator'

export class QueryHistoryPriceDto {
  @IsString()
  productUrl: string

  @IsString()
  cookie?: string
}
