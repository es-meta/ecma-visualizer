export function appendURL(str: string, base: string): string {
  if (!base.endsWith("/")) {
    base += "/";
  }
  return new URL(str, base).href;
}

export function isSupportedSpec(url: string): boolean {
  const enabledURL = import.meta.env.VITE_ENABLED_SPEC_URL.split(
    "|",
  ) as string[];
  return enabledURL.some((supportedPrefix) => url.startsWith(supportedPrefix));
}
