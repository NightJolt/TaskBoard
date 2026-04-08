import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { Task } from '../../tasks/schemas/task.schema';
import type { TaskModel } from '../../tasks/schemas/task.schema';
import { TaskRes } from '../../tasks/dto/tasks.responses';
import { AppEvent, EventsService } from '../events.service';

@Injectable()
export class MemberListener {
  private readonly logger = new Logger(MemberListener.name);

  constructor(
    @InjectModel(Task.name) private taskModel: TaskModel,
    private eventsService: EventsService,
  ) {}

  async handleMemberRemoved(event: AppEvent) {
    const userId = event.data['userId'] as string;
    const projectId = event.projectId;

    const tasks = await this.taskModel
      .find({
        project: new Types.ObjectId(projectId),
        assignee: new Types.ObjectId(userId),
      })
      .populate('assignee', 'email name')
      .populate('createdBy', 'email name');

    if (tasks.length === 0) return;

    await this.taskModel.updateMany(
      {
        project: new Types.ObjectId(projectId),
        assignee: new Types.ObjectId(userId),
      },
      { $set: { assignee: null } },
    );

    for (const task of tasks) {
      const updated = plainToInstance(TaskRes, {
        ...task.toObject(),
        assignee: null,
      });

      await this.eventsService.publish({
        type: 'task.updated',
        projectId,
        data: { task: updated },
      });
    }

    this.logger.log(
      `Unassigned ${tasks.length} task(s) from user ${userId} in project ${projectId}`,
    );
  }
}
