import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; username: string; role: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: parseInt(payload.sub),
        is_delete: false,
      },
      include: { role: true, department: true },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    if (user.status !== 'active') {
      throw new UnauthorizedException('账号已被禁用');
    }
    // 将 role 关系映射为 role 名字符串，保持与 JWT payload 一致
    const { password_hash, role: roleObj, ...rest } = user;
    return { ...rest, role: roleObj.name };
  }
}
