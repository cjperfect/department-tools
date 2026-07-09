import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateDepartmentRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
