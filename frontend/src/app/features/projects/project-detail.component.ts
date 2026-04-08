import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkDropList, CdkDrag, CdkDropListGroup, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/auth.service';
import { ProjectsService, Project } from '../../core/projects.service';
import { TasksService, Task } from '../../core/tasks.service';
import { TaskDialog, TaskDialogData } from './task.dialog';
import { AddMemberDialog } from './add-member.dialog';
import { SocketService } from '../../core/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    DatePipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    MatDialogModule,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private projectsService = inject(ProjectsService);
  private tasksService = inject(TasksService);
  private socketService = inject(SocketService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private subscriptions: Subscription[] = [];

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  loading = signal(true);

  userName = computed(() => this.authService.user()?.name ?? '');
  projectName = computed(() => this.project()?.name ?? 'Loading...');
  isOwner = computed(
    () => this.project()?.owner.id === this.authService.user()?.id,
  );

  private readonly priorityOrder: Record<string, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  todoTasks = this.tasksByStatus('todo');
  inProgressTasks = this.tasksByStatus('in_progress');
  doneTasks = this.tasksByStatus('done');

  private projectId = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }
    this.projectId = id;
    this.loadData();

    this.socketService.joinProject(id);
    this.subscriptions.push(
      this.socketService.taskCreated$.subscribe((task) =>
        this.tasks.update((tasks) => [task, ...tasks]),
      ),
      this.socketService.taskUpdated$.subscribe((task) =>
        this.tasks.update((tasks) =>
          tasks.map((t) => (t.id === task.id ? task : t)),
        ),
      ),
      this.socketService.taskDeleted$.subscribe((taskId) =>
        this.tasks.update((tasks) => tasks.filter((t) => t.id !== taskId)),
      ),
    );
  }

  ngOnDestroy() {
    this.socketService.leaveProject();
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  goBack() {
    this.router.navigate(['/']);
  }

  onLogout() {
    this.authService.logout();
  }

  onDrop(event: CdkDragDrop<Task[]>, newStatus: string) {
    const task: Task = event.item.data;
    if (task.status === newStatus) return;

    // Optimistic update
    this.tasks.update((tasks) =>
      tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
    );

    this.tasksService
      .update(this.projectId, task.id, { status: newStatus })
      .subscribe({
        error: () => {
          // Revert on failure
          this.tasks.update((tasks) =>
            tasks.map((t) =>
              t.id === task.id ? { ...t, status: task.status } : t,
            ),
          );
        },
      });
  }

  openCreateTask() {
    this.openTaskDialog();
  }

  onTaskClick(task: Task) {
    this.openTaskDialog(task);
  }

  onAddMember() {
    this.dialog
      .open(AddMemberDialog, { data: this.projectId })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadData();
      });
  }

  onRemoveMember(memberId: string) {
    this.projectsService.removeMember(this.projectId, memberId).subscribe({
      next: () => this.loadData(),
    });
  }


  private openTaskDialog(task?: Task) {
    const data: TaskDialogData = {
      projectId: this.projectId,
      members: this.project()?.members ?? [],
      task,
    };

    this.dialog
      .open(TaskDialog, { data })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadTasks();
      });
  }

  private loadData() {
    this.loading.set(true);

    this.projectsService.get(this.projectId).subscribe({
      next: (project) => {
        this.project.set(project);
        this.loadTasks();
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
    });
  }

  private tasksByStatus(status: string) {
    return computed(() => this.sortByPriority(
      this.tasks().filter((t) => t.status === status),
    ));
  }

  private sortByPriority(tasks: Task[]): Task[] {
    return [...tasks].sort(
      (a, b) => (this.priorityOrder[a.priority] ?? 1) - (this.priorityOrder[b.priority] ?? 1),
    );
  }

  private loadTasks() {
    this.tasksService.list(this.projectId).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
