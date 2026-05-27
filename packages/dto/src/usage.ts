/** Usage/quota for one kind of generation in the current window. */
export interface GenerationUsageDTO {
  /** Friendly summary, e.g. "97 of 100 stories left this week". */
  message: string;
  /** Count used in the current window. */
  used: number;
  /** The cap for the window. */
  total: number;
  /** Remaining in the window — max(0, total - used). */
  remaining: number;
  /** ISO timestamp when the window resets (next Saturday 00:00). */
  resetsAt: string;
}

/** Both quotas at once — returned by GET /usage. */
export interface UsageSummaryDTO {
  stories: GenerationUsageDTO;
  audio: GenerationUsageDTO;
}

/** Typed shape for the API envelope's `meta` field. Extend as more
 *  out-of-band metadata is added. */
export interface ResponseMeta {
  usage?: GenerationUsageDTO;
}
