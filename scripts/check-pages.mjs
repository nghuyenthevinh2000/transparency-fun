import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';

const site = resolve(process.argv[2] || '');
if (!process.argv[2] || !existsSync(site)) {
  console.error('Usage: node scripts/check-pages.mjs <built-site-directory>');
  process.exit(2);
}

const errors = [];
let references = 0;

function checkReference(file, target, moduleSpecifier = false) {
  if (/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(target)) return;
  if (target.startsWith('/')) {
    errors.push(`${relative(site, file)}: root-relative URL ${target} breaks GitHub Pages project paths`);
    return;
  }

  const pathname = target.split(/[?#]/, 1)[0];
  if (!pathname || (moduleSpecifier && !pathname.startsWith('.'))) return;

  const destination = resolve(dirname(file), decodeURIComponent(pathname));
  references++;
  if (!(destination === site || destination.startsWith(`${site}${sep}`)) || !existsSync(destination)) {
    errors.push(`${relative(site, file)}: missing published asset ${target}`);
  }
}

function inspect(file) {
  const content = readFileSync(file, 'utf8');
  const extension = extname(file);
  const patterns = extension === '.js'
    ? [
        [/^\s*(?:import|export)\s+(?:[^'"`;]*?\s+from\s*)?['"]([^'"]+)['"]/gm, true],
        [/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, true],
        [/\bfetch\s*\(\s*['"]([^'"]+)['"]/g, false],
      ]
    : extension === '.html'
      ? [[/\b(?:src|href)\s*=\s*['"]([^'"]+)['"]/g, false]]
      : extension === '.css'
        ? [[/\burl\(\s*['"]?([^'"\s)]+)/g, false]]
        : [];

  for (const [pattern, moduleSpecifier] of patterns) {
    for (const match of content.matchAll(pattern)) checkReference(file, match[1], moduleSpecifier);
  }
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile() && ['.html', '.css', '.js'].includes(extname(path))) inspect(path);
  }
}

walk(site);
if (errors.length) {
  console.error(`Pages artifact has ${errors.length} broken local reference(s):\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`Pages artifact: ${references} local references resolved.`);
