import { IsString, IsOptional, IsInt, IsArray, MinLength, MaxLength } from 'class-validator';

export class CreateMenuDto {
  @IsString() @MinLength(1) @MaxLength(100)
  title: string;

  @IsString() @MinLength(1) @MaxLength(255)
  url: string;

  @IsString() @MinLength(1) @MaxLength(50)
  icon: string;

  @IsInt()
  group_id: number;

  @IsArray() @IsString({ each: true }) @IsOptional()
  roles?: string[];

  @IsInt() @IsOptional()
  sort_order?: number;
}

export class UpdateMenuDto {
  @IsString() @IsOptional() @MinLength(1) @MaxLength(100)
  title?: string;

  @IsString() @IsOptional() @MinLength(1) @MaxLength(255)
  url?: string;

  @IsString() @IsOptional() @MinLength(1) @MaxLength(50)
  icon?: string;

  @IsInt() @IsOptional()
  group_id?: number;

  @IsArray() @IsString({ each: true }) @IsOptional()
  roles?: string[];

  @IsInt() @IsOptional()
  sort_order?: number;
}

export class CreateMenuGroupDto {
  @IsString() @MinLength(1) @MaxLength(50)
  name: string;

  @IsInt() @IsOptional()
  sort_order?: number;
}
