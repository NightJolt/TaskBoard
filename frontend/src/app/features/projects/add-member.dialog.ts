import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectsService } from '../../core/projects.service';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './add-member.dialog.html',
  styleUrl: './add-member.dialog.css',
})
export class AddMemberDialog {
  private projectsService = inject(ProjectsService);
  private dialogRef = inject(MatDialogRef<AddMemberDialog>);
  private snackBar = inject(MatSnackBar);
  private projectId: string = inject(MAT_DIALOG_DATA);

  loading = signal(false);
  emailControl = new FormControl('', [Validators.required, Validators.email]);

  onAdd() {
    if (this.emailControl.invalid) return;

    this.loading.set(true);
    this.projectsService.addMember(this.projectId, this.emailControl.value!).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(
          err.error?.message || 'Failed to add member',
          'Close',
          { duration: 5000 },
        );
      },
    });
  }
}
