import React from 'react';
import { addNode, BuilderState, findNode } from '../state/model';

interface Props {
  state: BuilderState;
  setState: (updater: (s: BuilderState) => void) => void;
}

export default function Canvas({ state, setState }: Props) {
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/x-node-type');
    if (!type) return;
    setState((s) => addNode(s, type as any));
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    if (e.dataTransfer.types.includes('application/x-node-type')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const select = (id: string) => setState((s) => { s.selectedId = id; });

  const render = (id: string) => {
    const n = findNode(state.root, id)!;
    const selected = state.selectedId === id;
    const base = selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-transparent';
    const cls = `${n.classes} ${base}`.trim();
    const common = {
      'data-id': id,
      className: cls,
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); select(id); },
    } as any;
    switch (n.type) {
      case 'text':
        return <span {...common}>{n.props.text}</span>;
      case 'button':
        return <button {...common}>{n.props.text ?? 'Button'}</button>;
      case 'link':
        return <a href={n.props.href ?? '#'} target={n.props.target} {...common}>{n.props.text ?? 'Link'}</a>;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5': {
        const Tag = n.type as any;
        return <Tag {...common}>{n.props.text ?? n.type.toUpperCase()}</Tag>;
      }
      default: {
        const Tag = n.type as any;
        return <Tag {...common}>{n.children.map((c) => (
          <React.Fragment key={c.id}>{render(c.id)}</React.Fragment>
        ))}</Tag>;
      }
    }
  };

  return (
    <div className="panel p-4 h-full overflow-auto" onDrop={onDrop} onDragOver={onDragOver} onClick={() => select('root')}>
      <div className="text-xs text-gray-500 mb-2">Drop components here</div>
      <div className="min-h-[60vh] bg-white p-4 border border-dashed border-gray-300 rounded">
        {state.root.children.length === 0 ? (
          <div className="text-gray-400 text-sm">Empty canvas</div>
        ) : (
          state.root.children.map((c) => <React.Fragment key={c.id}>{render(c.id)}</React.Fragment>)
        )}
      </div>
    </div>
  );
}

