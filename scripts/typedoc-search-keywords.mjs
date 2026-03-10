import {MarkdownPageEvent} from 'typedoc-plugin-markdown';
import {ReflectionKind} from 'typedoc';

function splitIdentifier(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
}

function toKeywordList(model) {
  const baseName = model.name.trim();
  const displayName = Array.isArray(model.signatures) && model.signatures.length > 0
    ? `${baseName}()`
    : baseName;
  const spacedName = splitIdentifier(baseName);
  const kindName = ReflectionKind.singularString(model.kind);

  return [...new Set([
    baseName,
    displayName,
    spacedName,
    `${kindName} ${baseName}`,
    `${kindName} ${spacedName}`,
  ].filter(Boolean))];
}

function prependKeywordsFrontmatter(contents, keywords) {
  if (keywords.length === 0 || contents.startsWith('---\n')) {
    return contents;
  }

  const frontmatter = [
    '---',
    'keywords:',
    ...keywords.map(keyword => `  - ${JSON.stringify(keyword)}`),
    '---',
    '',
  ].join('\n');

  return `${frontmatter}${contents}`;
}

export function load(app) {
  app.renderer.on(MarkdownPageEvent.END, page => {
    if (!page.isReflectionEvent()) {
      return;
    }

    const {model} = page;
    if ([ReflectionKind.Project, ReflectionKind.Module, ReflectionKind.Namespace].includes(model.kind)) {
      return;
    }

    // Search-local indexes Docusaurus meta keywords, so add symbol aliases here.
    page.contents = prependKeywordsFrontmatter(page.contents, toKeywordList(model));
  });
}
