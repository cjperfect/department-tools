import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/login.dto';
import { CreateUserRequest } from './dto/create-user.dto';
import { UpdateUserRequest } from './dto/update-user.dto';
import { ChangePasswordRequest, ResetPasswordRequest } from './dto/change-password.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards/auth.guards';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ------------------------------------------------------------------
  // 公开端点
  // ------------------------------------------------------------------

  @Post('login')
  async login(@Body() body: LoginRequest) {
    return this.authService.login(body.username, body.password);
  }

  // ------------------------------------------------------------------
  // 需要认证的端点
  // ------------------------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return this.authService.getUserById(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @CurrentUser() user: any,
    @Body() body: ChangePasswordRequest,
  ) {
    return this.authService.changePassword(user.id, body.old_password, body.new_password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('menu')
  async getMenu(@CurrentUser() user: any) {
    return this.authService.getMenu(user.role);
  }

  // ------------------------------------------------------------------
  // 管理员端点
  // ------------------------------------------------------------------

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('users')
  async getUsers(
    @CurrentUser() adminUser: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('username') username?: string,
    @Query('role') roleFilter?: string,
  ) {
    return this.authService.getUsers(
      adminUser.role,
      parseInt(page || '1'),
      parseInt(pageSize || '10'),
      username,
      roleFilter,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('users')
  async createUser(
    @CurrentUser() adminUser: any,
    @Body() body: CreateUserRequest,
  ) {
    return this.authService.createUser(adminUser, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('users/:userId')
  async updateUser(
    @CurrentUser() adminUser: any,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: UpdateUserRequest,
  ) {
    return this.authService.updateUser(adminUser, userId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('users/:userId')
  async deleteUser(
    @CurrentUser() adminUser: any,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.authService.deleteUser(adminUser, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('users/:userId/reset-password')
  async resetUserPassword(
    @CurrentUser() adminUser: any,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: ResetPasswordRequest,
  ) {
    return this.authService.resetPassword(adminUser, userId, body.new_password);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('reset-password')
  @HttpCode(200)
  async resetPasswordByAdmin(
    @CurrentUser() adminUser: any,
    @Body() body: { userId: number },
  ) {
    return this.authService.resetPassword(adminUser, body.userId);
  }
}
