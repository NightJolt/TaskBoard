import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from './environment';
import { Task } from './tasks.service';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket;
  private currentProjectId: string | null = null;

  readonly taskCreated$ = new Subject<Task>();
  readonly taskUpdated$ = new Subject<Task>();
  readonly taskDeleted$ = new Subject<string>();

  constructor() {
    this.socket = io(environment.apiUrl.replace('/api', ''), {
      autoConnect: true,
    });

    this.socket.on('task.created', (data: { task: Task }) =>
      this.taskCreated$.next(data.task),
    );
    this.socket.on('task.updated', (data: { task: Task }) =>
      this.taskUpdated$.next(data.task),
    );
    this.socket.on('task.deleted', (data: { taskId: string }) =>
      this.taskDeleted$.next(data.taskId),
    );
  }

  joinProject(projectId: string) {
    if (this.currentProjectId) {
      this.socket.emit('leaveProject', this.currentProjectId);
    }
    this.currentProjectId = projectId;
    this.socket.emit('joinProject', projectId);
  }

  leaveProject() {
    if (this.currentProjectId) {
      this.socket.emit('leaveProject', this.currentProjectId);
      this.currentProjectId = null;
    }
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }
}
