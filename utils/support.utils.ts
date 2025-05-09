export function isUrlSupported(url: string): boolean {
  const enabledURL = import.meta.env.VITE_ENABLED_SPEC_URL.split(
    "|",
  ) as string[];
  return enabledURL.some((supportedPrefix) => url.startsWith(supportedPrefix));
}
