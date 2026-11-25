import assert from 'node:assert/strict';
import { renderMarkdown, stripMarkdown } from './markdown.ts';

function runMarkdownTests() {
  // 1. Bold & Italic
  const boldHtml = renderMarkdown('Hello **yosr** and *world*');
  assert.match(boldHtml, /<strong>yosr<\/strong>/);
  assert.match(boldHtml, /<em>world<\/em>/);

  // 2. Headings
  const headingHtml = renderMarkdown('# Title\n\n## 02 — Subtitle\n\n### Section');
  assert.match(headingHtml, /<h1>Title<\/h1>/);
  assert.match(headingHtml, /<h2>02 — Subtitle<\/h2>/);
  assert.match(headingHtml, /<h3>Section<\/h3>/);

  // 3. Bullet lists & Numbered lists
  const ulHtml = renderMarkdown('- First\n- Second');
  assert.match(ulHtml, /<ul>[\s\S]*<li>First<\/li>[\s\S]*<li>Second<\/li>[\s\S]*<\/ul>/);

  const olHtml = renderMarkdown('1. **Step one**\n2. Step two');
  assert.match(olHtml, /<ol>[\s\S]*<li><strong>Step one<\/strong><\/li>[\s\S]*<li>Step two<\/li>[\s\S]*<\/ol>/);

  // 4. Links (external get target="_blank" rel="noopener noreferrer", unsafe blocked)
  const linkHtml = renderMarkdown('[Portfolio](https://example.com)');
  assert.match(linkHtml, /<a target="_blank" rel="noopener noreferrer" href="https:\/\/example\.com">Portfolio<\/a>/);

  const unsafeLinkHtml = renderMarkdown('[Click](javascript:alert(1))');
  assert.doesNotMatch(unsafeLinkHtml, /javascript:/i);

  // 5. Blockquotes
  const quoteHtml = renderMarkdown('> Grounded reasoning matters.');
  assert.match(quoteHtml, /<blockquote>[\s\S]*<p>Grounded reasoning matters\.<\/p>[\s\S]*<\/blockquote>/);

  // 6. Inline code & Code blocks
  const inlineCodeHtml = renderMarkdown('Use `renderMarkdown()` here.');
  assert.match(inlineCodeHtml, /<code>renderMarkdown\(\)<\/code>/);

  const codeBlockHtml = renderMarkdown('```ts\nconst name = "yosr";\n```');
  assert.match(codeBlockHtml, /<pre><code class="language-ts">const name = &quot;yosr&quot;;\n<\/code><\/pre>/);

  // 7. Multilingual (FR & AR)
  const frHtml = renderMarkdown('**Expérience** : évaluation des modèles.');
  assert.match(frHtml, /<strong>Expérience<\/strong>/);

  const arHtml = renderMarkdown('## نظرة عامة\n\nنص باللغة **العربية** مع `كود`.');
  assert.match(arHtml, /<h2>نظرة عامة<\/h2>/);
  assert.match(arHtml, /<strong>العربية<\/strong>/);
  assert.match(arHtml, /<code>كود<\/code>/);

  // 8. Sanitization
  const xssHtml = renderMarkdown('Safe **text** <script>alert(1)</script>');
  assert.doesNotMatch(xssHtml, /<script>/i);
  assert.match(xssHtml, /<strong>text<\/strong>/);

  // 9. Strip markdown for summaries
  const stripped = stripMarkdown('## 02 — **Cairn** `v1` [link](https://example.com)');
  assert.equal(stripped, '02 — Cairn v1 link');

  console.log('✓ All Markdown rendering & sanitization tests passed.');
}

runMarkdownTests();
