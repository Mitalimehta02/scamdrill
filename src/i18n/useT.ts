// The current language travels through React context, so any screen can ask for its strings.

import { createContext, useContext } from "react";
import { STRINGS, type Lang, type Strings } from "./strings";

export const LangContext = createContext<Lang>("en");

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useT(): Strings {
  return STRINGS[useContext(LangContext)];
}
