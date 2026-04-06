import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { Task } from '../schemas/task.schema';
import type { TaskModel } from '../schemas/task.schema';
import { ProjectMember } from '../../projects/schemas/project-member.schema';
import type { ProjectMemberModel } from '../../projects/schemas/project-member.schema';
import type { ProjectDocument } from '../../projects/schemas/project.schema';
import { UserDocument } from '../../users/schemas/user.schema';
import { CreateTaskReq, UpdateTaskReq } from '../dto/tasks.requests';
import { TaskRes } from '../dto/tasks.responses';

@Injectable()
export class TasksMemberService {
  constructor(
    @InjectModel(Task.name) private taskModel: TaskModel,
    @InjectModel(ProjectMember.name) private projectMemberModel: ProjectMemberModel,
  ) {}

  async create(
    project: ProjectDocument,
    user: UserDocument,
    dto: CreateTaskReq,
  ): Promise<TaskRes> {
    if (dto.assignee) {
      await this.validateAssignee(project._id, dto.assignee);
    }

    const task = await this.taskModel.create({
      title: dto.title,
      status: dto.status,
      deadline: dto.deadline ?? null,
      priority: dto.priority,
      assignee: dto.assignee ? new Types.ObjectId(dto.assignee) : null,
      project: project._id,
      createdBy: user._id,
    });

    return this.toResponse(task);
  }

  async list(project: ProjectDocument): Promise<TaskRes[]> {
    const tasks = await this.taskModel
      .find({ project: project._id })
      .populate('assignee', 'email name')
      .populate('createdBy', 'email name')
      .sort({ createdAt: -1 })
      .lean();

    return tasks.map((t) => plainToInstance(TaskRes, t));
  }

  async getById(
    project: ProjectDocument,
    taskId: string,
  ): Promise<TaskRes> {
    const task = await this.findTask(project._id, taskId);

    const populated = await task.populate([
      { path: 'assignee', select: 'email name' },
      { path: 'createdBy', select: 'email name' },
    ]);

    return plainToInstance(TaskRes, populated.toObject());
  }

  async update(
    project: ProjectDocument,
    taskId: string,
    dto: UpdateTaskReq,
  ): Promise<TaskRes> {
    const task = await this.findTask(project._id, taskId);

    if (dto.assignee !== undefined) {
      if (dto.assignee !== null) {
        await this.validateAssignee(project._id, dto.assignee);
      }
      task.assignee = dto.assignee ? new Types.ObjectId(dto.assignee) : null;
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.deadline !== undefined) task.deadline = dto.deadline ? new Date(dto.deadline) : null;
    if (dto.priority !== undefined) task.priority = dto.priority;

    await task.save();

    const populated = await task.populate([
      { path: 'assignee', select: 'email name' },
      { path: 'createdBy', select: 'email name' },
    ]);

    return plainToInstance(TaskRes, populated.toObject());
  }

  async delete(project: ProjectDocument, taskId: string): Promise<void> {
    const task = await this.findTask(project._id, taskId);
    await task.deleteOne();
  }

  private async findTask(projectId: Types.ObjectId, taskId: string) {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.taskModel.findOne({
      _id: taskId,
      project: projectId,
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  private async validateAssignee(projectId: Types.ObjectId, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid assignee ID');
    }

    const membership = await this.projectMemberModel.findOne({
      project: projectId,
      user: new Types.ObjectId(userId),
    });

    if (!membership) {
      throw new BadRequestException('Assignee must be a project member');
    }
  }

  private toResponse(task: TaskRes | { toObject: () => Record<string, unknown> }): TaskRes {
    const obj = 'toObject' in task ? task.toObject() : task;
    return plainToInstance(TaskRes, obj);
  }
}
