import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'Home.html', 'About.html', 'Resume.html', 'Blog.html', 'Github.html', 'Contact.html'];
/** @param {string} input */
const decode = input => input.replaceAll('&amp;', '&').replaceAll('&quot;', '"');
for (const path of pages) {
  const html = await readFile(resolve(root, path), 'utf8');
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${path}: one primary heading`);
  assert.match(html, /<html lang="en"/);
  assert.match(html, /<main id="main"/);
  assert.match(html, /class="skip-link"/);
  assert.doesNotMatch(html, /nicepage|jquery|Post \d Headline|Sample small text|—/i);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${path}: unique identifiers`);
  let previousHeading = 0;
  for (const heading of html.matchAll(/<h([1-6])\b/g)) {
    const level = Number(heading[1]);
    assert.ok(level <= previousHeading + 1, `${path}: no skipped heading levels`);
    previousHeading = level;
  }
  for (const tag of html.matchAll(/<a\b[^>]*>/g)) {
    if (/target="_blank"/.test(tag[0])) assert.match(tag[0], /rel="[^"]*noopener/);
  }
  for (const tag of html.matchAll(/<img\b[^>]*>/g)) assert.match(tag[0], /\balt="[^"]+"/);
  for (const reference of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = decode(reference[1]);
    if (/^(https:|mailto:)/.test(url)) continue;
    assert.ok(!/^(javascript:|data:|http:)/i.test(url), `${path}: safe link scheme`);
    const [file, hash] = url.split('#');
    const local = decodeURIComponent(file.split('?')[0]);
    const target = resolve(root, local || path);
    assert.ok(target === root || target.startsWith(root + sep), `${path}: local link stays inside site`);
    await access(target === root ? resolve(root, 'index.html') : target);
    if (hash) {
      const destination = !file ? html : await readFile(target === root ? resolve(root, 'index.html') : target, 'utf8');
      assert.ok(destination.includes(`id="${hash}"`), `${path}: anchor ${url} exists`);
    }
  }
}
console.log('Verified headings, accessibility structure, external link protection, and local assets on seven primary pages.');
