import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  old_password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  new_password: string;
}

export class ResetPasswordRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  new_password: string;
}
