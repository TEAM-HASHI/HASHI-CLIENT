const HTML_ESCAPE_BY_CHARACTER: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export const escapeHtmlText = (value: string) =>
  value.replace(/[&<>]/g, (character) => HTML_ESCAPE_BY_CHARACTER[character])

export const escapeHtmlAttribute = (value: string) =>
  value.replace(/[&<>"']/g, (character) => HTML_ESCAPE_BY_CHARACTER[character])

export const escapeXml = escapeHtmlAttribute

export const serializeJsonLd = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
