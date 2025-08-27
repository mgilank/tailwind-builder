import React, { useState } from 'react';
import { addNode, addNodeToParent, BuilderState, canHaveChildren, findNode, moveNodeAsChild, moveNodeRelative } from '../state/model';

interface Props {
  state: BuilderState;
  setState: (updater: (s: BuilderState) => void) => void;
}

export default function Canvas({ state, setState }: Props) {
  const [dropHint, setDropHint] = useState<null | { id: string; kind: 'inside' | 'before' | 'after' }>(null);
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/x-node-type');
    const movingId = e.dataTransfer.getData('application/x-move-node') || e.dataTransfer.getData('text/plain');
    if (type) {
      setState((s) => addNode(s, type as any));
      setDropHint(null);
      return;
    }
    if (movingId) {
      const moving = findNode(state.root, movingId);
      if (moving && moving.type !== 'section') {
        setState((s) => moveNodeAsChild(s, movingId, 'root'));
      }
    }
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    const types = e.dataTransfer.types;
    if (types.includes('application/x-node-type')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      return;
    }
    if (types.includes('text/plain') || types.includes('application/x-move-node')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const select = (id: string) => setState((s) => { s.selectedId = id; });

  const render = (id: string) => {
    const n = findNode(state.root, id)!;
    const selected = state.selectedId === id;
    const base = selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-transparent';
    // Builder-only visual helpers: subtle border, rounded, centered placeholder label
    const builderVisual = 'relative border border-gray-200 rounded-sm hover:border-gray-300 min-h-[48px] flex items-center justify-center';
    const cls = `${n.classes} ${builderVisual} ${base}`.trim();
    const common = {
      'data-id': id,
      className: cls,
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        e.dataTransfer.setData('application/x-move-node', id);
        // Also set text/plain for better browser compatibility (e.g., Safari)
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
      },
      onDragEnd: () => setDropHint(null),
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); select(id); },
    } as any;
    const canDropHere = canHaveChildren(n.type);
    const droppable: any = {
      onDragOver: (e: React.DragEvent) => {
        const types = e.dataTransfer.types;
        // Adding new component
        if (types.includes('application/x-node-type')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          const t = e.dataTransfer.getData('application/x-node-type');
          if (canDropHere && t !== 'section') {
            setDropHint({ id, kind: 'inside' });
          } else if (n.type === 'section' && t === 'section') {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;
            setDropHint({ id, kind: before ? 'before' : 'after' });
          } else {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;
            setDropHint({ id, kind: before ? 'before' : 'after' });
          }
          return;
        }
        // Moving existing node — don't rely on reading payload here; Chrome may hide it
        if (types.includes('text/plain') || types.includes('application/x-move-node')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (n.type === 'section') {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;
            setDropHint({ id, kind: before ? 'before' : 'after' });
          } else if (canDropHere) {
            setDropHint({ id, kind: 'inside' });
          } else {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;
            setDropHint({ id, kind: before ? 'before' : 'after' });
          }
          return;
        }
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const type = e.dataTransfer.getData('application/x-node-type');
        const movingId = e.dataTransfer.getData('application/x-move-node') || e.dataTransfer.getData('text/plain');
        if (type) {
          setState((s) => addNodeToParent(s, id, type as any));
          setDropHint(null);
          return;
        }
        if (movingId) {
          const moving = findNode(state.root, movingId);
          if (!moving) return;
          if (n.type === 'section' && moving.type === 'section') {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;
            setState((s) => moveNodeRelative(s, movingId, id, before ? 'before' : 'after'));
            setDropHint(null);
            return;
          }
          if (canDropHere && moving.type !== 'section') {
            setState((s) => moveNodeAsChild(s, movingId, id));
            setDropHint(null);
            return;
          }
          if (moving.type !== 'section') {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;
            setState((s) => moveNodeRelative(s, movingId, id, before ? 'before' : 'after'));
            setDropHint(null);
            return;
          }
        }
      },
      onDragLeave: () => {
        setDropHint((cur) => (cur && cur.id === id ? null : cur));
      },
    };
    const renderHandle = (
      <span
        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-grab bg-white/70 rounded"
        draggable
        onMouseDown={(e) => { e.stopPropagation(); select(id); }}
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('application/x-move-node', id);
          e.dataTransfer.setData('text/plain', id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={() => setDropHint(null)}
        title="Drag to move"
      >
        ⠿
      </span>
    );
    switch (n.type) {
      case 'text':
        return <span {...common} {...droppable}>
          <span className="pointer-events-none text-[10px] uppercase tracking-wide text-gray-500">{n.type}</span>
          {renderHandle}
        </span>;
      case 'button':
        return <button {...common} {...droppable}>
          <span className="pointer-events-none text-[10px] uppercase tracking-wide text-gray-500">{n.type}</span>
          {renderHandle}
        </button>;
      case 'link':
        return <a href={n.props.href ?? '#'} target={n.props.target} {...common} {...droppable}>
          <span className="pointer-events-none text-[10px] uppercase tracking-wide text-gray-500">{n.type}</span>
          {renderHandle}
        </a>;
      case 'heading': {
        const level = n.props.level ?? 1;
        const Tag = (`h${level}`) as any;
        return <Tag {...common} {...droppable}>
          <span className="pointer-events-none text-[10px] uppercase tracking-wide text-gray-500">Heading</span>
          {renderHandle}
        </Tag>;
      }
      default: {
        const Tag = n.type as any;
        return <Tag {...common} {...droppable}>
          {n.children.length === 0 ? (
            <span className="pointer-events-none text-[10px] uppercase tracking-wide text-gray-400">{n.type}</span>
          ) : (
            n.children.map((c) => (
              <React.Fragment key={c.id}>{render(c.id)}</React.Fragment>
            ))
          )}
          {renderHandle}
          {dropHint && dropHint.id === id && dropHint.kind !== 'inside' && (
            <div className={`pointer-events-none absolute left-[-4px] right-[-4px] h-[2px] bg-blue-500 ${dropHint.kind === 'before' ? 'top-0' : 'bottom-0'}`}></div>
          )}
          {dropHint && dropHint.id === id && dropHint.kind === 'inside' && (
            <div className="pointer-events-none absolute inset-0 ring-2 ring-blue-400/60 rounded-sm"></div>
          )}
        </Tag>;
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
