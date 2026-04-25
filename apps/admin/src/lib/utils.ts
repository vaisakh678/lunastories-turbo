import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function serialNumber(page: number, perPage: number, index: number): number {
  return (page - 1) * perPage + index + 1;
}
