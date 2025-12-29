import type { AxiosResponse } from "axios";
import { cookies } from "next/headers";
import { api } from "@/lib/api/api";
import type { Note } from "@/types/note";
import type { User } from "@/types/user";

const withServerCookies = async () => {
  const cookieStore = await cookies();
  const allCookies = cookieStore.toString();

  return {
    headers: {
      Cookie: allCookies,
    },
  };
};

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string;
}

export const fetchNotes = async ({
  page = 1,
  perPage = 12,
  search = "",
  tag = "",
}: FetchNotesParams = {}): Promise<Note[]> => {
  const config = await withServerCookies();
  const { data } = await api.get<Note[]>("/notes", {
    ...config,
    params: { page, perPage, search, tag },
  });
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const config = await withServerCookies();
  const { data } = await api.get<Note>(`/notes/${id}`, config);
  return data;
};

export const getMe = async (): Promise<User> => {
  const config = await withServerCookies();
  const { data } = await api.get<User>("/users/me", config);
  return data;
};

export const checkSession = async (): Promise<AxiosResponse<User | null>> => {
  const config = await withServerCookies();
  return api.get<User | null>("/auth/session", config);
};
