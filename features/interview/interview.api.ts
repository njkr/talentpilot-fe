import { api } from "@/lib/api/client";
import type { InterviewQuestion } from "./interview.types";

export const interviewApi = {
  list: (workspaceId: string) => api.get<InterviewQuestion[]>(`/workspaces/${workspaceId}/interview-questions`),
  // ⚠️ UNCONFIRMED LIVE: every real attempt in this account hit INSUFFICIENT_CREDITS (balance
  // exhausted by prior sprints' testing) before a successful submission could be observed. Typed
  // as returning the updated question per the sprint doc's reasonable guess — confirm the first
  // time a real successful answer submission is actually seen.
  submitAnswer: (questionId: string, answer: string) => api.post<InterviewQuestion>(`/interview-questions/${questionId}/answer`, { answer }),
};
