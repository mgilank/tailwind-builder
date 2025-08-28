import type { TreeNode } from '../state/model';

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderNode(n: TreeNode): string {
  const cls = n.classes ? ` class="${escapeAttribute(n.classes)}"` : '';
  switch (n.type) {
    case 'text':
      return `<div${cls}>${escapeHtml(n.props.text ?? '')}</div>`;
    case 'button':
      return `<button${cls}>${escapeHtml(n.props.text ?? 'Button')}</button>`;
    case 'link': {
      const href = n.props.href ?? '#';
      const target = n.props.target ? ` target="${escapeAttribute(n.props.target)}"` : '';
      return `<a href="${escapeAttribute(href)}"${target}${cls}>${escapeHtml(n.props.text ?? 'Link')}</a>`;
    }
    case 'heading': {
      const level = n.props.level ?? 1;
      const tag = `h${level}`;
      return `<${tag}${cls}>${escapeHtml(n.props.text ?? tag.toUpperCase())}</${tag}>`;
    }
    default: {
      const tag = n.type;
      const children = n.children.map(renderNode).join('');
      return `<${tag}${cls}>${children}</${tag}>`;
    }
  }
}

export function renderHtml(root: TreeNode): string {
  return root.children.map(renderNode).join('\n');
}

export function escapeAttribute(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
