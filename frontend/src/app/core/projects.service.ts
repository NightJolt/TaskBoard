import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';

export interface ProjectMember {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: { id: string; email: string; name: string };
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  list() {
    return this.http.get<Project[]>(this.apiUrl);
  }

  get(id: string) {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  create(data: { name: string; description?: string }) {
    return this.http.post<Project>(this.apiUrl, data);
  }

  update(id: string, data: { name?: string; description?: string }) {
    return this.http.patch<Project>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addMember(projectId: string, email: string) {
    return this.http.post<Project>(`${this.apiUrl}/${projectId}/members`, {
      email,
    });
  }

  removeMember(projectId: string, userId: string) {
    return this.http.delete<Project>(
      `${this.apiUrl}/${projectId}/members/${userId}`,
    );
  }
}
