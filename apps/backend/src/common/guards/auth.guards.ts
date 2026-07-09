import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { getRoleLevel } from '../constants';

/** JWT 认证守卫 — 使用 Passport JWT strategy 验证 token。 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

/** 角色守卫 — 检查用户角色层级是否满足要求。 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new UnauthorizedException('请先登录');
    }
    const userLevel = getRoleLevel(user.role);
    const requiredLevel = Math.min(...requiredRoles.map(getRoleLevel));
    return userLevel >= requiredLevel;
  }
}
