import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TasksService, Task } from '../../core/tasks.service';
import { ProjectMember } from '../../core/projects.service';

export interface TaskDialogData {
  projectId: string;
  members: ProjectMember[];
  task?: Task;
}

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './task.dialog.html',
  styleUrl: './task.dialog.css',
})
export class TaskDialog {
  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private dialogRef = inject(MatDialogRef<TaskDialog>);
  private snackBar = inject(MatSnackBar);
  private data: TaskDialogData = inject(MAT_DIALOG_DATA);

  members = this.data.members;
  isEdit = signal(!!this.data.task);
  loading = signal(false);

  form = this.fb.nonNullable.group({
    title: [this.data.task?.title ?? '', Validators.required],
    status: [this.data.task?.status ?? 'todo'],
    priority: [this.data.task?.priority ?? 'medium'],
    deadline: [this.data.task?.deadline ? new Date(this.data.task.deadline) : null],
    assignee: [this.data.task?.assignee?.id ?? null],
  });

  clearDeadline(event: Event) {
    event.stopPropagation();
    this.form.controls.deadline.setValue(null);
  }

  onSave() {
    if (this.form.invalid) return;
    this.loading.set(true);

    const raw = this.form.getRawValue();

    const req = this.isEdit()
      ? this.tasksService.update(this.data.projectId, this.data.task!.id, {
          title: raw.title,
          status: raw.status,
          priority: raw.priority,
          deadline: raw.deadline ? raw.deadline.toISOString() : null,
          assignee: raw.assignee,
        })
      : this.tasksService.create(this.data.projectId, {
          title: raw.title,
          status: raw.status,
          priority: raw.priority,
          deadline: raw.deadline ? raw.deadline.toISOString() : undefined,
          assignee: raw.assignee ?? undefined,
        });

    req.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(
          err.error?.message || 'Failed to save task',
          'Close',
          { duration: 5000 },
        );
      },
    });
  }

  onDelete() {
    if (!this.data.task) return;
    this.loading.set(true);

    this.tasksService
      .delete(this.data.projectId, this.data.task.id)
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.loading.set(false);
          this.snackBar.open(
            err.error?.message || 'Failed to delete task',
            'Close',
            { duration: 5000 },
          );
        },
      });
  }
}
