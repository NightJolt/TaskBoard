import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { ProjectMember, ProjectMemberSchema } from './schemas/project-member.schema';
import { UsersModule } from '../users/users.module';
import { ProjectsAuthedService } from './services/projects-authed.service';
import { ProjectsOwnerService } from './services/projects-owner.service';
import { ProjectsAuthedController } from './controllers/projects-authed.controller';
import { ProjectsMemberController } from './controllers/projects-member.controller';
import { ProjectsOwnerController } from './controllers/projects-owner.controller';
import { ProjectMembershipGuard } from './guards/project-membership.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectMember.name, schema: ProjectMemberSchema },
    ]),
    UsersModule,
  ],
  providers: [ProjectsAuthedService, ProjectsOwnerService, ProjectMembershipGuard],
  controllers: [ProjectsAuthedController, ProjectsMemberController, ProjectsOwnerController],
  exports: [MongooseModule],
})
export class ProjectsModule {}
