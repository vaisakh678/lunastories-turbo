// Fair-use generation caps, enforced in usage-service. Both reset weekly on
// Saturday 00:00. Text generation is ~free (the cap is abuse prevention);
// audio narration is the real cost driver (TTS), so it's capped tighter.
export const MAX_STORIES_PER_WEEK = 100;
export const MAX_AUDIO_PER_WEEK = 10;
