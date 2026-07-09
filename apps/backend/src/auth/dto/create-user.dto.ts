import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  Matches,
} from 'class-validator';

export class CreateUserRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  username: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  employee_id?: string;

  @IsInt()
  @IsOptional()
  department_id?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;

  @IsString()
  @Matches(/^(super_admin|admin|user)$/)
  role: string;

  @IsString()
  @Matches(/^(active|inactive)$/)
  status: string;
}
