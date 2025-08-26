export function minifyHtml(html: string): string {
  return html
    .replace(/\n+/g, '') // remove newlines
    .replace(/>\s+</g, '><') // remove whitespace between tags
    .replace(/\s{2,}/g, ' ') // collapse spaces
    .trim();
}

