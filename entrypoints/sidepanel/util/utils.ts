import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEBUG_FLAG = true; // import.meta.env.VITE_DEBUG === "ON";
export function visualizerDebug(predicate: boolean, msg: string) {
  if (DEBUG_FLAG && predicate) console.log(`[DEBUG] ${msg}`);
}
