import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFile(resolve(root, path), 'utf8');
test('the homepage URLs render the same shared source', async () => {
  assert.equal(await read('index.html'), await read('Home.html'));
});
test('all four existing resume PDFs remain available to open and download', async () => {
  const html = await read('Resume.html');
  for (const file of [
    'Jeremy Pretty Chief AI Officer Executive Resume 2026-10-03.pdf',
    'Jeremy Pretty Adjunct Faculty CV 2026-10-03.pdf',
    'Jeremy Pretty Gaming Resume 2026-10-03.pdf',
    'Jeremy Pretty Research CV 2026-10.pdf',
  ]) {
    const url = `resume/${encodeURIComponent(file)}`;
    const links = [...html.matchAll(/<a\b[^>]*>/g)].filter(match => match[0].includes(`href="${url}"`));
    assert.equal(links.length, 2, file);
    assert.ok(links.some(match => /\bdownload\b/.test(match[0])), `${file}: download`);
    assert.ok(links.some(match => /target="_blank"/.test(match[0])), `${file}: open`);
    const pdf = await readFile(resolve(root, 'resume', file));
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  }
});
test('former template article URLs lead to the real writing page', async () => {
  for (const path of ['blog/blog.html', 'blog/post.html', ...Array.from({ length:5 }, (_, i) => `blog/post-${i + 1}.html`)]) {
    const html = await read(path);
    assert.match(html, /http-equiv="refresh" content="0; url=\.\.\/Blog.html"/);
    assert.match(html, /<meta name="robots" content="noindex">/);
    assert.doesNotMatch(html, /Post \d Headline|Sample small text|Lorem ipsum/i);
  }
});
test('both palettes meet AA text contrast for primary, secondary, and button text', async () => {
  const css = await read('site.css');
  const parse = block => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/g)].map(match => [match[1], match[2]]));
  const palettes = [parse(css.match(/:root\s*\{([^}]+)/)[1]), parse(css.match(/:root\[data-theme='light'\]\s*\{([^}]+)/)[1])];
  const luminance = hex => {
    const linear = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
    return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
  };
  for (const palette of palettes) {
    for (const [foreground, background] of [['text', 'background'], ['muted', 'background'], ['muted', 'surface'], ['accent', 'background'], ['accent-ink', 'accent']]) {
      const levels = [luminance(palette[foreground]), luminance(palette[background])].sort((a, b) => b - a);
      const ratio = (levels[0] + .05) / (levels[1] + .05);
      assert.ok(ratio >= 4.5, `${foreground} on ${background}: ${ratio.toFixed(2)}`);
    }
  }
});
