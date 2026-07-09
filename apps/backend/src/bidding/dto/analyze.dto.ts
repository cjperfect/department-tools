import { IsString, MinLength } from 'class-validator';

export class AnalyzeRequest {
  @IsString()
  @MinLength(1)
  url: string;
}
