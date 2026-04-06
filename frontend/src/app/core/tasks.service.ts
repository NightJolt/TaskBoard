import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';

export interface Task {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  priority: string;
  assignee: { id: string; email: string; name: string } | null;
  createdBy: { id: string; email: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  status?: string;
  deadline?: string;
  priority?: string;
  assignee?: string;
}

export interface UpdateTaskData {
  title?: string;
  status?: string;
  deadline?: string | null;
  priority?: string;
  assignee?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);

  private apiUrl(projectId: string) {
    return `${environment.apiUrl}/projects/${projectId}/tasks`;
  }

  list(projectId: string) {
    return this.http.get<Task[]>(this.apiUrl(projectId));
  }

  get(projectId: string, taskId: string) {
    return this.http.get<Task>(`${this.apiUrl(projectId)}/${taskId}`);
  }

  create(projectId: string, data: CreateTaskData) {
    return this.http.post<Task>(this.apiUrl(projectId), data);
  }

  update(projectId: string, taskId: string, data: UpdateTaskData) {
    return this.http.patch<Task>(`${this.apiUrl(projectId)}/${taskId}`, data);
  }

  delete(projectId: string, taskId: string) {
    return this.http.delete(`${this.apiUrl(projectId)}/${taskId}`);
  }
}
