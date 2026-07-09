import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 统一响应格式包装器 — 自动将返回值包装成 { code, message, data }。 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 如果已经是统一格式，直接返回
        if (data && typeof data === 'object' && 'code' in data) {
          return data;
        }
        return { code: 0, message: 'ok', data: data ?? null };
      }),
    );
  }
}
