import { Marked, Renderer } from 'marked';

const UNSAFE_PROTOCOLS = /^(javascript|vbscript|data):/i;

function createSafeRenderer(): Renderer {
  const renderer = new Renderer();
  const originalLink = Renderer.prototype.link;

  renderer.link = function (token) {
    const href = typeof token.href === 'string' ? token.href.trim() : '';
    if (UNSAFE_PROTOCOLS.test(href)) {
      return token.text || '';
    }
    const html = originalLink.call(this, token);
    if (/^https?:\/\//i.test(href)) {
      return html.replace('<a ', '<a target="_blank" rel="noopener noreferrer" ');
    }
    return html;
  };

  return renderer;
}

const md = new Marked({
  gfm: true,
  breaks: true,
  renderer: createSafeRenderer(),
});

/**
 * Strips potentially dangerous tags and attributes from rendered HTML
 * while preserving safe formatting tags.
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|iframe|object|embed)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data):[\s\S]*?\2/gi, '$1=$2#$2');
}

/**
 * Renders Markdown (or existing HTML/plain text) to sanitized HTML.
 */
export function renderMarkdown(source: string): string {
  if (!source || !source.trim()) return '';
  const rendered = md.parse(source);
  if (typeof rendered !== 'string') return '';
  return sanitizeHtml(rendered).trim();
}

/**
 * Converts Markdown to plain text for card summaries and meta descriptions.
 */
export function stripMarkdown(source: string): string {
  if (!source || !source.trim()) return '';
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
