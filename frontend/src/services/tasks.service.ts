import { apiGet, apiPost, apiPatch } from "./api";
import type { Task, TaskResult, TaskStats } from "@/types";
import type { TaskStatus } from "@/types";

export const tasksService = {
  getAll: (params?: {
    status?: TaskStatus;
    departmentId?: number;
    deadlineFrom?: string;
    deadlineTo?: string;
  }) => apiGet<Task[]>("/tasks", params as Record<string, unknown>),

  getOne: (id: number) => apiGet<Task>(`/tasks/${id}`),

  create: (data: {
    title: string;
    content?: string;
    linhVuc?: string;
    leadDepartmentId?: number;
    cooperatingDepartmentIds?: number[];
    frequency?: string;
    deadline?: string;
    reminderBefore?: number;
  }) => apiPost<Task>("/tasks", data),

  update: (
    id: number,
    data: Partial<Omit<Task, "cooperatingDepartments">> & {
      cooperatingDepartmentIds?: number[];
    },
  ) => apiPatch<Task>(`/tasks/${id}`, data),

  getStats: () => apiGet<TaskStats[]>("/tasks/stats"),

  addResult: (
    taskId: number,
    data: {
      content?: string;
      completionRate?: number;
      attachments?: Array<{ url: string; name: string; size?: number }>;
      isExplanation?: boolean;
    },
  ) => apiPost<TaskResult>(`/tasks/${taskId}/results`, data),

  getResults: (taskId: number) =>
    apiGet<TaskResult[]>(`/tasks/${taskId}/results`),

  uploadFile: async (
    taskId: number,
    file: File,
  ): Promise<{ url: string; originalName: string }> => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/v1/tasks/${taskId}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Upload thất bại");
    const json = await res.json();
    return json.data;
  },
};
