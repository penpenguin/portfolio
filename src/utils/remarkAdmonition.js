const DIRECTIVE_CONFIG = {
  note: { icon: '📝', className: 'admonition-note', label: 'note' },
  info: { icon: 'ℹ️', className: 'admonition-info', label: 'info' },
  tip: { icon: '💡', className: 'admonition-tip', label: 'tip' },
  warn: { icon: '⚠️', className: 'admonition-warning', label: 'warning' },
  warning: { icon: '⚠️', className: 'admonition-warning', label: 'warning' },
  caution: { icon: '⚠️', className: 'admonition-warning', label: 'warning' },
  important: { icon: '❗️', className: 'admonition-important', label: 'important' },
};

const SUPPORTED = new Set(Object.keys(DIRECTIVE_CONFIG));

const walk = (node, visitor) => {
  visitor(node);
  if (Array.isArray(node?.children)) {
    node.children.forEach((child) => walk(child, visitor));
  }
};

export const remarkAdmonition = () => {
  return (tree) => {
    walk(tree, (node) => {
      const isContainer = node?.type === 'containerDirective';
      const isLeaf = node?.type === 'leafDirective';
      if (!(isContainer || isLeaf) || !SUPPORTED.has(node.name)) {
        return;
      }

      const config = DIRECTIVE_CONFIG[node.name];
      const data = node.data || (node.data = {});
      const properties = data.hProperties || {};
      const classSource = properties.className || properties.class;
      const classList = Array.isArray(classSource)
        ? classSource
        : classSource
          ? [classSource]
          : [];

      data.hName = isLeaf ? 'span' : 'aside';
      data.hProperties = {
        ...properties,
        role: 'note',
        className: [...classList, 'admonition', config.className],
        'aria-label': config.label,
        'data-icon': config.icon,
      };
      // children are kept as-is; layout handled by CSS
      node.data = data;
    });
  };
};
