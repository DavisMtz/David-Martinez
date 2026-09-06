import { createContext, useContext } from "react";
import type { MediaItem } from "~/lib/types";

export interface AdminContextValue {
  cloudName: string;
  media: MediaItem[];
}

export const AdminContext = createContext<AdminContextValue>({ cloudName: "", media: [] });

export function useAdmin() {
  return useContext(AdminContext);
}
