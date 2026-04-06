import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
export class ProjectDetailComponent implements OnInit {
  private authService = inject(AuthService);
  private projectsService = inject(ProjectsService);
  private tasksService = inject(TasksService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  loading = signal(true);

  userName = computed(() => this.authService.user()?.name ?? '');
  projectName = computed(() => this.project()?.name ?? 'Loading...');
  isOwner = computed(
    () => this.project()?.owner.id === this.authService.user()?.id,
  );

  todoTasks = computed(() =>
    this.tasks().filter((t) => t.status === 'todo'),
  );
  inProgressTasks = computed(() =>
    this.tasks().filter((t) => t.status === 'in_progress'),
  );
  doneTasks = computed(() =>
    this.tasks().filter((t) => t.status === 'done'),
  );

  private projectId = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }
    this.projectId = id;
    this.loadData();
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
