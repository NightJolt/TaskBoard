import { Injectable, OnDestroy, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from './environment';
import { Task } from './tasks.service';
import { Project } from './projects.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private authService = inject(AuthService);
  private socket: Socket;
  private currentProjectId: string | null = null;


  readonly taskCreated$ = new Subject<Task>();
  readonly taskUpdated$ = new Subject<Task>();
  readonly taskDeleted$ = new Subject<string>();
  readonly memberAdded$ = new Subject<Project>();
  readonly memberRemoved$ = new Subject<string>();

  constructor() {
    this.socket = io(environment.apiUrl.replace('/api', ''), {
      autoConnect: true,
      auth: { token: this.authService.token() },
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
    this.socket.on('member.added', (data: { project: Project }) =>
      this.memberAdded$.next(data.project),
    );
    this.socket.on('member.removed', (data: { userId: string }) =>
      this.memberRemoved$.next(data.userId),
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
