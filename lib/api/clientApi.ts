import { api } from "./api";
import type { Note, NewNote } from "@/types/note";
import type { User } from "@/types/user";

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string | null;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export const fetchNotes = async (
  params: FetchNotesParams = {}
): Promise<FetchNotesResponse> => {
  const { page = 1, perPage = 12, search, tag } = params;
  const { data } = await api.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage,
      ...(search ? { search } : {}),
      ...(tag && tag !== "all" ? { tag } : {}),
    },
  });
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
};

export const createNote = async (note: NewNote): Promise<Note> => {
  const { data } = await api.post<Note>("/notes", note);
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await api.delete<Note>(`/notes/${id}`);
  return data;
};

export const register = async (userData: {
  email: string;
  password: string;
}): Promise<User> => {
  const { data } = await api.post<User>("/auth/register", userData);
  return data;
};

export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<User> => {
  const { data } = await api.post<User>("/auth/login", credentials);
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const checkSession = async (): Promise<User | null> => {
  const { data } = await api.get<User | null>("/auth/session");
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>("/users/me");
  return data;
};

export const updateMe = async (
  updateData: Partial<User> & { password?: string }
): Promise<User> => {
  const { data } = await api.patch<User>("/users/me", updateData);
  return data;
};
