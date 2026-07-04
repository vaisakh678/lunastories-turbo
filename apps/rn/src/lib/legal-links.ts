import * as WebBrowser from 'expo-web-browser';

// LegalLinks.swift ported.
export const LegalLinks = {
  termsURL: 'https://lunastories.cortexlumora.com/terms',
  privacyURL: 'https://lunastories.cortexlumora.com/privacy',
} as const;

export const legalLinks = {
  terms: LegalLinks.termsURL,
  privacy: LegalLinks.privacyURL,
} as const;

export function openLegalLink(url: string): void {
  WebBrowser.openBrowserAsync(url).catch(() => {});
}
