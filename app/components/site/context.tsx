import { createContext, useContext } from "react";
import type { SiteSettings } from "~/lib/types";
import { DEFAULT_SETTINGS } from "~/lib/types";

export interface SiteContextValue {
  settings: SiteSettings;
  cloudName: string;
  siteUrl: string;
}

export const SiteContext = createContext<SiteContextValue>({ settings: DEFAULT_SETTINGS, cloudName: "", siteUrl: "" });

export function useSite() {
  return useContext(SiteContext);
}
