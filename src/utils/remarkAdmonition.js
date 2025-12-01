const DIRECTIVE_CONFIG = {
  note: { className: 'admonition-note', label: 'note', labelTitle: 'Note' },
  tip: { className: 'admonition-tip', label: 'tip', labelTitle: 'Tip' },
  warning: { className: 'admonition-warning', label: 'warning', labelTitle: 'Warning' },
  caution: { className: 'admonition-caution', label: 'caution', labelTitle: 'Caution' },
  important: { className: 'admonition-important', label: 'important', labelTitle: 'Important' },
};

const GITHUB_LABEL_REGEX = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;

const applyAdmonition = (node, config) => {
  const data = node.data || (node.data = {});
  const properties = data.hProperties || {};
  const classSource = properties.className || properties.class;
  const classList = Array.isArray(classSource)
    ? classSource
    : classSource
      ? [classSource]
      : [];

  data.hName = 'aside';
  data.hProperties = {
    ...properties,
    role: 'note',
    className: [...classList, 'admonition', config.className],
    'aria-label': config.label,
    'data-label': config.labelTitle,
  };
  node.data = data;
};

const walk = (node, visitor) => {
  visitor(node);
  if (Array.isArray(node?.children)) {
    node.children.forEach((child) => walk(child, visitor));
  }
};

export const remarkAdmonition = () => {
  return (tree) => {
    walk(tree, (node) => {
      if (node?.type === 'blockquote') {
        const firstChild = node.children?.[0];
        if (firstChild?.type === 'paragraph' && Array.isArray(firstChild.children)) {
          const firstText = firstChild.children.find(
            (child) => child.type === 'text' && typeof child.value === 'string',
          );

          const match = firstText?.value.match(GITHUB_LABEL_REGEX);
          if (match) {
            const normalized = match[1].toLowerCase();
            const config = DIRECTIVE_CONFIG[normalized];
            if (config) {
              firstText.value = firstText.value.slice(match[0].length).replace(/^\s*/, '');
              if (!firstText.value) {
                firstChild.children = firstChild.children.filter((child) => child !== firstText);
              }

              applyAdmonition(node, config);
              return;
            }
          }
        }
      }
    });
  };
};
