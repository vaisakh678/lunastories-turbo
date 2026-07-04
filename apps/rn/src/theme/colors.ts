// Brand palette ported 1:1 from the iOS app.
// Sources: Assets.xcassets/AccentColor (dark variant) and
// ModeSheet/SharedComponents.swift (miloCream/miloPaper/miloInk + twilight gradient).
export const colors = {
  /// Warm coral accent (#F06A4A) — the dark-appearance AccentColor the app
  /// always renders against the twilight background.
  accent: '#F06A4A',
  cream: '#FFF7ED', // miloCream  (1.0, 0.97, 0.93)
  paper: '#FAF2E3', // miloPaper  (0.98, 0.95, 0.89)
  ink: '#291F38', // miloInk    (0.16, 0.12, 0.22)

  // MoodyTwilightBackground linear gradient stops, top → bottom.
  twilightTop: '#1A1240', // (0.10, 0.07, 0.25)
  twilightMid: '#291A5C', // (0.16, 0.10, 0.36)
  twilightBottom: '#0F0A29', // (0.06, 0.04, 0.16)

  // Radial glow tints (opacities applied at the gradient stops).
  glowGold: '#F5BA42', // (0.96, 0.73, 0.26)
  glowCoral: '#E8593D', // (0.91, 0.35, 0.24)
  glowViolet: '#6B4AA3', // (0.42, 0.29, 0.64)

  // Toast style tints (ToastCenter.swift).
  toastError: '#F27D57', // (0.95, 0.49, 0.34)
  toastWarning: '#F5BA42', // (0.96, 0.73, 0.26)
  toastSuccess: '#66C78C', // (0.40, 0.78, 0.55)
} as const;

/** cream at an opacity, e.g. creamAlpha(0.6) — mirrors Color.miloCream.opacity(x) */
export function creamAlpha(alpha: number): string {
  return `rgba(255, 247, 237, ${alpha})`;
}

export function accentAlpha(alpha: number): string {
  return `rgba(240, 106, 74, ${alpha})`;
}
