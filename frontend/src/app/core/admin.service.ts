import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';

export interface InviteCode {
  id: string;
  code: string;
  expiresAt: string;
  isUsed: boolean;
  usedBy: { id: string; email: string; name: string } | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  generateInviteCode() {
    return this.http.post<InviteCode>(`${this.apiUrl}/invite-codes`, {});
  }

  listInviteCodes() {
    return this.http.get<InviteCode[]>(`${this.apiUrl}/invite-codes`);
  }

  listUsers() {
    return this.http.get<{ id: string; email: string; name: string; role: string }[]>(
      `${this.apiUrl}/users`,
    );
  }

  listAllProjects() {
    return this.http.get<AdminProject[]>(`${this.apiUrl}/projects`);
  }

  joinProject(projectId: string) {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/join`, {});
  }

  leaveProject(projectId: string) {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/leave`, {});
  }

  deleteProject(projectId: string) {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}`);
  }
}

export interface AdminProject {
  id: string;
  name: string;
  description: string;
  owner: { id: string; email: string; name: string };
  memberCount: number;
  isMember: boolean;
  createdAt: string;
}
