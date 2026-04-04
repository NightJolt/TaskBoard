import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuardian } from '../../auth/guards/roles.guardian';

export const ROLES_KEY = 'roles';
export const Authenticated = (...roles: string[]) =>
  applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuardian));
