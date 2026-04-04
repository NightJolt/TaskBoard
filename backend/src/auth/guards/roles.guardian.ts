import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ROLES_KEY } from '../../common/decorators';

@Injectable()
export class RolesGuardian extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getClass());

    // validate JWT and attach user
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) return false;

    // empty array = any authenticated user
    if (roles.length === 0) return true;

    // check specific role
    const { user } = context.switchToHttp().getRequest();
    return roles.includes(user.role);
  }
}
