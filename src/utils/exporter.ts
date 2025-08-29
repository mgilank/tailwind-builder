import type { TreeNode } from '../state/model';
import { currentFlexDirection } from './classes';

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
    case 'section': {
      const children = n.children.map(renderNode).join('');
      const dir = currentFlexDirection(n.classes);
      const dirCls = dir === 'row' ? 'flex-row' : dir === 'row-reverse' ? 'flex-row-reverse' : dir === 'col-reverse' ? 'flex-col-reverse' : 'flex-col';
      const inner = `<div class="section-inner flex ${dirCls} items-start">${children}</div>`;
      return `<section${cls}>${inner}</section>`;
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
