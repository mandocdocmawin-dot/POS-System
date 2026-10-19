import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const root = process.cwd();
const dictionaryFile = ts.createSourceFile('filipino.ts', fs.readFileSync(path.join(root, 'src/i18n/filipino.ts'), 'utf8'), ts.ScriptTarget.Latest, true);
let dictionaryText = '';
function findDictionary(node) { if (ts.isNoSubstitutionTemplateLiteral(node)) dictionaryText = node.text; ts.forEachChild(node, findDictionary); }
findDictionary(dictionaryFile);
const known = new Set(dictionaryText.trim().split('\n').map(line => line.slice(0, line.indexOf('|')).toLowerCase()));
const decode = text => text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
let fileCount = 0, labelCount = 0;
function visitDirectory(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, item.name);
    if (item.isDirectory()) { if (item.name !== 'i18n') visitDirectory(filename); continue; }
    if (!filename.endsWith('.tsx') || filename.includes('.test.')) continue;
    const source = fs.readFileSync(filename, 'utf8'), edits = [], optionValues = new Set();
    const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isJsxText(node)) {
        const parent = node.parent;
        const tag = ts.isJsxElement(parent) ? parent.openingElement.tagName.getText(tree) : '';
        const allowed = ts.isJsxFragment(parent) || /^[a-z]/.test(tag) && !['script', 'style', 'code', 'pre', 'textarea'].includes(tag) || ['Link', 'NavLink'].includes(tag);
        const raw = decode(node.text), normalized = raw.replace(/\s+/g, ' ').trim();
        if (allowed && normalized && known.has(normalized.toLowerCase())) {
          const text = raw.includes('\n') ? normalized : raw;
          edits.push({ start: node.pos, end: node.end, text: '<T text={' + JSON.stringify(text) + '}/>' });
          labelCount++;
          if (tag === 'option' && !parent.openingElement.attributes.properties.some(a => ts.isJsxAttribute(a) && a.name.getText(tree) === 'value') && !optionValues.has(parent.pos)) {
            // Translating an option label must not change its submitted value.
            if (parent.children.length !== 1) throw new Error('Complex option without value in ' + filename);
            edits.push({ start: parent.openingElement.end - 1, end: parent.openingElement.end - 1, text: ' value={' + JSON.stringify(normalized) + '}' });
            optionValues.add(parent.pos);
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
    if (!edits.length) continue;
    let result = source;
    for (const edit of edits.sort((a, b) => b.start - a.start)) result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
    if (!/import\s*\{[^}]*\bT\b[^}]*\}\s*from/.test(source)) {
      let relative = path.relative(path.dirname(filename), path.join(root, 'src/i18n/T')).split(path.sep).join('/');
      if (!relative.startsWith('.')) relative = './' + relative;
      const firstImport = Math.max(0, result.indexOf('import '));
      result = result.slice(0, firstImport) + "import { T } from " + JSON.stringify(relative) + ";\n" + result.slice(firstImport);
    }
    fs.writeFileSync(filename, result);
    fileCount++;
  }
}
visitDirectory(path.join(root, 'src'));
console.log('Localized ' + labelCount + ' static UI labels across ' + fileCount + ' files.');
