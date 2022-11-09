import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class LocalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return this.validate(request);
  }

  validate(req: Request): boolean {
    return req.socket.remoteAddress === '::1';
  }
}
