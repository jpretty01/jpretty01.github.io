import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
/** @typedef {{source: string, title: string, description: string, active: string, outputs: string[]}} Page */
/** @type {Page[]} */
const pages = [
  { source:'home.html', title:'Jeremy Pretty | Leader, Builder & Educator', description:'Jeremy Pretty builds intelligent systems, leads technical organizations, teaches, and creates original games. Explore selected projects and experience.', active:'Work', outputs:['index.html', 'Home.html'] },
  { source:'about.html', title:'About | Jeremy Pretty', description:'Meet Jeremy Pretty, a technical leader and educator working across applied AI, enterprise software, game development, and higher education.', active:'About', outputs:['About.html'] },
  { source:'resume.html', title:'Resume & CV | Jeremy Pretty', description:'Explore Jeremy Pretty’s leadership, AI, teaching, and research experience. View or download executive, faculty, gaming, and research resumes.', active:'Resume', outputs:['Resume.html'] },
  { source:'writing.html', title:'Writing | Jeremy Pretty', description:'Writing and commentary on applied AI, technical leadership, education, and the systems that help teams deliver.', active:'Writing', outputs:['Blog.html'] },
  { source:'code.html', title:'Code & Technical Work | Jeremy Pretty', description:'Explore Jeremy Pretty’s code, experiments, and engineering work across software systems, applied AI, and intelligent automation.', active:'Code', outputs:['Github.html'] },
  { source:'contact.html', title:'Contact | Jeremy Pretty', description:'Connect with Jeremy Pretty about collaboration, technical leadership, applied AI, teaching, and original projects.', active:'Contact', outputs:['Contact.html'] },
];
const navigation = [
  { label:'Work', href:'./#work' },
  { label:'About', href:'About.html' },
  { label:'Resume', href:'Resume.html' },
  { label:'Writing', href:'Blog.html' },
  { label:'Gaming', href:'https://gaming.tmfpretty.com/' },
  { label:'Contact', href:'Contact.html' },
];
/** Escape text and attribute values, never source HTML. @param {string} value */
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const layout = await readFile(resolve(root, 'src/layout.html'), 'utf8');
const assets = await Promise.all(['site.css', 'site.js'].map(path => readFile(resolve(root, path))));
const version = createHash('sha256').update(Buffer.concat(assets)).digest('hex').slice(0, 12);

/** @param {string} path @param {string} output */
async function emit(path, output) {
  if (check) {
    const current = await readFile(resolve(root, path), 'utf8').catch(() => '');
    if (current !== output) throw new Error(`${path} is out of date. Run npm run build.`);
  } else {
    await writeFile(resolve(root, path), output);
  }
}
/** @param {Record<string, string>} values */
function render(values) {
  return layout.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Unknown template key: ${key}`);
    return values[key];
  });
}
for (const page of pages) {
  const content = await readFile(resolve(root, 'src/pages', page.source), 'utf8');
  const nav = navigation.map(item => `<a href="${item.href}"${item.label === page.active ? ' aria-current="page"' : ''}${item.label === 'Contact' ? ' class="nav-contact"' : ''}>${item.label}</a>`).join('\n        ');
  const output = render({ source:page.source, title:escapeHtml(page.title), description:escapeHtml(page.description), canonical:`https://jpretty01.github.io/${page.outputs[0] === 'index.html' ? '' : page.outputs[0]}`, prefix:'', version, extraHead:'', navigation:nav, content });
  for (const path of page.outputs) await emit(path, output);
}
// Keep old template URLs useful without presenting sample articles as real writing.
for (const path of ['blog/blog.html', 'blog/post.html', ...Array.from({ length:5 }, (_, i) => `blog/post-${i + 1}.html`)]) {
  const output = render({ source:'writing.html', title:'Writing | Jeremy Pretty', description:'Read Jeremy Pretty’s writing on Medium.', canonical:'https://jpretty01.github.io/Blog.html', prefix:'../', version, extraHead:'<meta name="robots" content="noindex">\n  <meta http-equiv="refresh" content="0; url=../Blog.html">', navigation:navigation.map(item => `<a href="${item.href.startsWith('https:') ? item.href : '../' + item.href}">${item.label}</a>`).join('\n        '), content:'<section class="container page-intro"><p class="eyebrow">Writing</p><h1>Find my writing here.</h1><p class="lead">The writing page has a new home.</p><a class="button primary" href="../Blog.html">Continue to writing <span aria-hidden="true">→</span></a></section>' });
  await emit(path, output);
}
console.log(`${check ? 'Verified' : 'Built'} 14 pages with shared layout and asset version ${version}.`);
