import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { ProjectMembershipGuard } from '../../projects/guards/project-membership.guard';

export enum ProjectAccess {
  Member = 'member',
  Owner = 'owner',
}

export const PROJECT_ACCESS_KEY = 'projectAccess';
export const ProjectMembership = (access?: ProjectAccess) =>
  applyDecorators(
    SetMetadata(PROJECT_ACCESS_KEY, access ?? ProjectAccess.Member),
    UseGuards(ProjectMembershipGuard),
    ApiParam({ name: 'id', description: 'Project ID' }),
  );
