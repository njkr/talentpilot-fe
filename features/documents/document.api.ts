import { api } from "@/lib/api/client";
import type { DocumentType, GeneratedDocument } from "./document.types";

export const documentApi = {
  generate: (workspaceId: string, type: DocumentType) => api.post<GeneratedDocument>(`/workspaces/${workspaceId}/documents`, { type }),
  list: (workspaceId: string) => api.get<GeneratedDocument[]>(`/workspaces/${workspaceId}/documents`),
  get: (workspaceId: string, docId: string) => api.get<GeneratedDocument>(`/workspaces/${workspaceId}/documents/${docId}`),
  // 409 DOCUMENT_NOT_READY (details: { status }) if called before status flips to 'ready'.
  download: (workspaceId: string, docId: string) => api.get<{ url: string; filename: string }>(`/workspaces/${workspaceId}/documents/${docId}/download`),
};
