import { IsString, IsOptional, IsInt, MaxLength, Matches } from 'class-validator';

export class UpdateUserRequest {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  employee_id?: string;

  @IsInt()
  @IsOptional()
  department_id?: number;

  @IsString()
  @IsOptional()
  @Matches(/^(super_admin|admin|user)$/)
  role?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(active|inactive)$/)
  status?: string;
}
