import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { ProjectsModule } from '../projects/projects.module';
import { TasksMemberService } from './services/tasks-member.service';
import { TasksMemberController } from './controllers/tasks-member.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    ProjectsModule,
  ],
  providers: [TasksMemberService],
  controllers: [TasksMemberController],
  exports: [MongooseModule],
})
export class TasksModule {}
