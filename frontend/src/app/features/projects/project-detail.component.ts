import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';
import { ProjectsService, Project } from '../../core/projects.service';
import { TasksService, Task } from '../../core/tasks.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    DatePipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
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

  onInviteMember() {
    // TODO: open invite dialog
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
