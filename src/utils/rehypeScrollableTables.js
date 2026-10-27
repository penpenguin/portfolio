/**
 * @typedef {{ type: string, tagName?: string, properties?: Record<string, unknown>, children?: HtmlNode[] }} HtmlNode
 */

export const rehypeScrollableTables = () => {
  /** @param {HtmlNode} node */
  const visit = (node) => {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      visit(child);
      if (child.type !== 'element' || child.tagName !== 'table') return child;
      return {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['table-scroll'],
          role: 'region',
          ariaLabel: '表（横スクロール可能）',
          tabIndex: 0,
        },
        children: [child],
      };
    });
  };
  return visit;
};
