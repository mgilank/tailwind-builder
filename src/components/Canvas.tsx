import React, { useState } from 'react';
import { addNode, addNodeToParent, BuilderState, canHaveChildren, findNode, findParentAndIndex, insertNodeRelative, moveNodeAsChild, moveNodeRelative, removeNode, updateSelected } from '../state/model';
import { currentBgArbitrary, currentTextArbitrary, currentFlexDirection, currentItemsAlign, currentJustifyContent } from '../utils/classes';

interface Props {
  state: BuilderState;
  setState: (updater: (s: BuilderState) => void) => void;
}

export default function Canvas({ state, setState }: Props) {
  const [dropHint, setDropHint] = useState<null | { id: string; kind: 'inside' | 'before' | 'after' }>(null);
  const [dragMeta, setDragMeta] = useState<null | { mode: 'move' | 'add'; type?: string; id?: string }>(null);
  // Track which section is hovered on empty space only (not when hovering a child)
  const [sectionHoverEmpty, setSectionHoverEmpty] = useState<string | null>(null);
  // Inline editor state for text/heading
  const [editing, setEditing] = useState<null | { id: string; value: string }>(null);
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/x-node-type');
    const movingId = e.dataTransfer.getData('application/x-move-node') || e.dataTransfer.getData('text/plain');
    const hint = dropHint;
    // Helper: find nearest section DOM ancestor from the event target
    const nearestSectionFromEvent = (): string | null => {
      let el = e.target as HTMLElement | null;
      while (el) {
        const idAttr = el.getAttribute && el.getAttribute('data-id');
        if (idAttr) {
          const node = findNode(state.root, idAttr);
          if (node?.type === 'section') return idAttr;
        }
        el = el.parentElement;
      }
      return null;
    };
    if (type) {
      // Enforce: new sections always go after the section under cursor
      if (type === 'section') {
        const sec = nearestSectionFromEvent();
        if (sec) {
          setState((s) => insertNodeRelative(s, sec, 'section', 'after'));
          setDropHint(null);
          setDragMeta(null);
          return;
        }
      }
      if (hint) {
        if (type === 'section') {
          // Sections: only allow before/after another section; never inside
          const target = findNode(state.root, hint.id);
          if (target?.type === 'section' && (hint.kind === 'before' || hint.kind === 'after')) {
            setState((s) => insertNodeRelative(s, hint.id, 'section', hint.kind));
          } else {
            // Fallback: append to root
            setState((s) => addNode(s, 'section'));
          }
        } else {
          if (hint.kind === 'inside') {
            setState((s) => addNodeToParent(s, hint.id, type as any));
          } else {
            setState((s) => insertNodeRelative(s, hint.id, type as any, hint.kind));
          }
        }
      } else {
        // No hint: append to root
        setState((s) => addNode(s, type as any));
      }
      setDropHint(null);
      setDragMeta(null);
      return;
    }
    if (movingId) {
      const moving = findNode(state.root, movingId);
      if (moving) {
        // Enforce: moving sections always go after the section under cursor
        if (moving.type === 'section') {
          const sec = nearestSectionFromEvent();
          if (sec && sec !== movingId) {
            setState((s) => moveNodeRelative(s, movingId, sec, 'after'));
            setDropHint(null);
            setDragMeta(null);
            return;
          }
        }
        if (hint) {
          if (moving.type === 'section') {
            const target = findNode(state.root, hint.id);
            if (target?.type === 'section' && (hint.kind === 'before' || hint.kind === 'after')) {
              setState((s) => moveNodeRelative(s, movingId, hint.id, hint.kind));
            }
          } else {
            if (hint.kind === 'inside') {
              setState((s) => moveNodeAsChild(s, movingId, hint.id));
            } else {
              setState((s) => moveNodeRelative(s, movingId, hint.id, hint.kind));
            }
          }
          setDropHint(null);
          setDragMeta(null);
          return;
        }
        // No hint fallbacks
        if (moving.type !== 'section') {
          setState((s) => moveNodeAsChild(s, movingId, 'root'));
        }
      }
    }
    setDragMeta(null);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    const types = e.dataTransfer.types;
    if (types.includes('application/x-node-type')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setDropHint({ id: 'root', kind: 'inside' });
      return;
    }
    if (types.includes('text/plain') || types.includes('application/x-move-node')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropHint({ id: 'root', kind: 'inside' });
    }
  };

  const select = (id: string) => setState((s) => { s.selectedId = id; });

  const render = (id: string) => {
    const n = findNode(state.root, id)!;
    const selected = state.selectedId === id;
    const base = selected ? 'border-amber-500' : 'ring-1 ring-transparent';
    // Builder-only visual helpers
    // - Non-text/heading: subtle dashed border, emerald on hover
    // - Text/heading: no border; emerald ring on hover (no layout shift)
    const builderVisual = ((): string => {
      if (n.type === 'text') {
        // Text: no min-height per spec; show emerald border on hover only
        return 'relative group rounded-sm text-left box-border max-w-full border border-transparent hover:border-emerald-300';
      }
      if (n.type === 'heading') {
        // Heading: keep small min-height to make it grabbable
        return 'relative group rounded-sm min-h-[48px] text-left box-border max-w-full border border-transparent hover:border-emerald-300';
      }
      if (n.type === 'section') {
        // Section: baseline dashed, but hover color is controlled via empty-space logic
        return 'relative group border border-dashed border-gray-300 rounded-sm min-h-[48px] text-left box-border max-w-full';
      }
      if (n.type === 'div') {
        // Div: larger default min height per spec
        return 'relative group border border-dashed border-gray-300 hover:border-emerald-300 rounded-sm min-h-[80px] text-left box-border max-w-full';
      }
      // Other components: dashed baseline with emerald hover
      return 'relative group border border-dashed border-gray-200 hover:border-emerald-300 rounded-sm min-h-[48px] text-left box-border max-w-full';
    })();
    const extraColor = ((): string => {
      if (n.type === 'section') {
        return sectionHoverEmpty === id ? 'border-emerald-300' : 'border-gray-200';
      }
      return '';
    })();
    const cls = `${n.classes} ${builderVisual} ${extraColor} ${base}`.trim();
    const arbText = currentTextArbitrary(n.classes);
    const arbBg = currentBgArbitrary(n.classes);
    const inlineStyle: React.CSSProperties = {};
    if (arbText) inlineStyle.color = arbText;
    if (arbBg) inlineStyle.backgroundColor = arbBg;
    const isEditing = editing?.id === id;
    const common = {
      'data-id': id,
      className: cls,
      style: inlineStyle,
      draggable: !isEditing,
      onDragStart: (e: React.DragEvent) => {
        // Prevent parent draggable handlers from overriding the payload
        e.stopPropagation();
        if (isEditing) return;
        e.dataTransfer.setData('application/x-move-node', id);
        // Also set text/plain for better browser compatibility (e.g., Safari)
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
        setDragMeta({ mode: 'move', id, type: n.type });
      },
      onDragEnd: () => { setDropHint(null); setDragMeta(null); },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); select(id); },
    } as any;
    const canDropHere = canHaveChildren(n.type);
    const parentInfo = findParentAndIndex(state.root, id);
    const parent = parentInfo?.parent;
    const nearestContainerId = (() => {
      let curParent = parent;
      while (curParent && !canHaveChildren(curParent.type)) {
        const up = findParentAndIndex(state.root, curParent.id)?.parent;
        curParent = up;
      }
      return curParent && canHaveChildren(curParent.type) ? curParent.id : 'root';
    })();
    // Find the closest ancestor section for this node (including self)
    const nearestSectionId = (() => {
      let cur: any = findNode(state.root, id);
      while (cur) {
        if (cur.type === 'section') return cur.id as string;
        const up = findParentAndIndex(state.root, cur.id)?.parent;
        cur = up;
      }
      return null as string | null;
    })();
    const droppable: any = {
      onDragOver: (e: React.DragEvent) => {
        const types = e.dataTransfer.types;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const threshold = Math.min(16, rect.height / 4);
        // Adding new component
        if (types.includes('application/x-node-type')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          const t = e.dataTransfer.getData('application/x-node-type');
          if (t === 'section') {
            // New sections should always be added below the nearest section ancestor
            if (nearestSectionId) {
              setDropHint({ id: nearestSectionId, kind: 'after' });
              e.stopPropagation();
              return;
            }
            // If no section ancestor, let root handle (append to root)
            return;
          }
          if (canDropHere) {
            if (e.clientY < rect.top + threshold) { setDropHint({ id, kind: 'before' }); e.stopPropagation(); return; }
            if (e.clientY > rect.bottom - threshold) { setDropHint({ id, kind: 'after' }); e.stopPropagation(); return; }
            setDropHint({ id, kind: 'inside' });
            e.stopPropagation();
            return;
          }
          // Not a container: suggest before/after relative to this node,
          // but allow event to bubble so parent containers can set their own hints
          const before = e.clientY < rect.top + rect.height / 2;
          setDropHint({ id, kind: before ? 'before' : 'after' });
          return;
        }
        // Moving existing node — don't rely on reading payload contents
        if (types.includes('text/plain') || types.includes('application/x-move-node')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (dragMeta?.type === 'section') {
            // Sections can only be moved before/after other sections
            if (n.type === 'section') {
              const before = e.clientY < rect.top + rect.height / 2;
              setDropHint({ id, kind: before ? 'before' : 'after' });
              e.stopPropagation();
            }
            return;
          }
          if (canDropHere) {
            if (e.clientY < rect.top + threshold) { setDropHint({ id, kind: 'before' }); e.stopPropagation(); return; }
            if (e.clientY > rect.bottom - threshold) { setDropHint({ id, kind: 'after' }); e.stopPropagation(); return; }
            setDropHint({ id, kind: 'inside' });
            e.stopPropagation();
            return;
          }
          const before = e.clientY < rect.top + rect.height / 2;
          setDropHint({ id, kind: before ? 'before' : 'after' });
          return;
        }
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const type = e.dataTransfer.getData('application/x-node-type');
        const movingId = e.dataTransfer.getData('application/x-move-node') || e.dataTransfer.getData('text/plain');
        const hint = dropHint;
        const nearestSectionFromEvent = (): string | null => {
          let el = e.target as HTMLElement | null;
          while (el) {
            const idAttr = el.getAttribute && el.getAttribute('data-id');
            if (idAttr) {
              const node = findNode(state.root, idAttr);
              if (node?.type === 'section') return idAttr;
            }
            el = el.parentElement;
          }
          return null;
        };
        if (type) {
          if (type === 'section') {
            const sec = nearestSectionFromEvent();
            if (sec) {
              setState((s) => insertNodeRelative(s, sec, 'section', 'after'));
              setDropHint(null);
              return;
            }
          }
          if (hint) {
            if (type === 'section') {
              // Only allow inserting sections relative to sections
              const target = findNode(state.root, hint.id);
              if (target?.type === 'section' && (hint.kind === 'before' || hint.kind === 'after')) {
                setState((s) => insertNodeRelative(s, hint.id, 'section', hint.kind));
              }
            } else {
              if (hint.kind === 'inside') {
                setState((s) => addNodeToParent(s, hint.id, type as any));
              } else {
                // Insert as sibling relative to target
                setState((s) => insertNodeRelative(s, hint.id, type as any, hint.kind));
              }
            }
            setDropHint(null);
            return;
          }
          // Fallback to legacy behavior
          if (canDropHere && type !== 'section') {
            setState((s) => addNodeToParent(s, id, type as any));
          } else if (!canDropHere && type !== 'section') {
            setState((s) => addNodeToParent(s, nearestContainerId, type as any));
          }
          setDropHint(null);
          return;
        }
        if (movingId) {
          const moving = findNode(state.root, movingId);
          if (!moving) return;
          if (moving.type === 'section') {
            const sec = nearestSectionFromEvent();
            if (sec && sec !== movingId) {
              setState((s) => moveNodeRelative(s, movingId, sec, 'after'));
              setDropHint(null);
              return;
            }
          }
          if (hint) {
            if (moving.type === 'section') {
              // Only move sections relative to sections
              const target = findNode(state.root, hint.id);
              if (target?.type === 'section' && (hint.kind === 'before' || hint.kind === 'after')) {
                setState((s) => moveNodeRelative(s, movingId, hint.id, hint.kind));
              }
            } else {
              if (hint.kind === 'inside') {
                setState((s) => moveNodeAsChild(s, movingId, hint.id));
              } else {
                setState((s) => moveNodeRelative(s, movingId, hint.id, hint.kind));
              }
            }
            setDropHint(null);
            return;
          }
          // Fallbacks if no hint
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
          if (!canDropHere && moving.type !== 'section') {
            setState((s) => moveNodeAsChild(s, movingId, nearestContainerId));
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
    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      setState((s) => removeNode(s, id));
    };

    const renderHandle = (
      <div
        className={
          `absolute top-1 right-1 flex gap-1 transition-opacity ` +
          (selected
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto')
        }
      >
        <span
          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-grab bg-white/70 rounded"
          draggable
          onMouseDown={(e) => { e.stopPropagation(); select(id); }}
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.setData('application/x-move-node', id);
            e.dataTransfer.setData('text/plain', id);
            e.dataTransfer.effectAllowed = 'move';
            setDragMeta({ mode: 'move', id, type: n.type });
          }}
          onDragEnd={() => { setDropHint(null); setDragMeta(null); }}
          title="Drag to move" id='dragToMove'
        >
          ⠿
        </span>
        {id !== 'root' && (
          <button
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-600 bg-white/70 rounded"
            onClick={handleDelete}
            title="Delete component"
          >
            ×
          </button>
        )}
      </div>
    );
    switch (n.type) {
      case 'text': {
        const startEdit = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          select(id);
          setEditing({ id, value: n.props.text ?? '' });
        };
        const commit = (val: string) => {
          setState((s) => updateSelected(s, (node) => { if ((node as any).id === id) node.props.text = val; }));
          setEditing(null);
        };
        const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(editing?.value ?? '');
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setEditing(null);
          }
        };
        const isEditing = editing?.id === id;
        return <div {...common} {...droppable}>
          {isEditing ? (
            <input
              className="w-full bg-transparent outline-none"
              autoFocus
              value={editing!.value}
              onChange={(e) => setEditing({ id, value: e.target.value })}
              onBlur={() => commit(editing!.value)}
              onKeyDown={onKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div onDoubleClick={startEdit}>{n.props.text ?? 'this is a text, edit at properties'}</div>
          )}
          {renderHandle}
        </div>;
      }
      case 'button':
        return <button {...common} {...droppable}>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-wide text-gray-500">{n.type}</span>
          {renderHandle}
        </button>;
      case 'link':
        return <a href={n.props.href ?? '#'} target={n.props.target} {...common} {...droppable}>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-wide text-gray-500">{n.type}</span>
          {renderHandle}
        </a>;
      case 'heading': {
        const level = n.props.level ?? 1;
        const Tag = (`h${level}`) as any;
        const sectionHoverHandlers = {
          onMouseMove: (e: React.MouseEvent) => {
            // Only consider empty hover if the event target is the section itself
            if (e.currentTarget === e.target) {
              setSectionHoverEmpty(id);
            } else if (sectionHoverEmpty === id) {
              setSectionHoverEmpty(null);
            }
          },
          onMouseLeave: () => {
            if (sectionHoverEmpty === id) setSectionHoverEmpty(null);
          },
        } as any;
        const startEdit = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          select(id);
          setEditing({ id, value: n.props.text ?? `H${level}` });
        };
        const commit = (val: string) => {
          setState((s) => updateSelected(s, (node) => { if ((node as any).id === id) node.props.text = val; }));
          setEditing(null);
        };
        const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(editing?.value ?? '');
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setEditing(null);
          }
        };
        const isEditing = editing?.id === id;
        return <Tag {...common} {...droppable} {...(n.type === 'section' ? sectionHoverHandlers : {})}>
          {isEditing ? (
            <input
              className="w-full bg-transparent outline-none"
              autoFocus
              value={editing!.value}
              onChange={(e) => setEditing({ id, value: e.target.value })}
              onBlur={() => commit(editing!.value)}
              onKeyDown={onKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <span onDoubleClick={startEdit}>{n.props.text ?? `H${level}`}</span>
          )}
          {renderHandle}
        </Tag>;
      }
      default: {
        const Tag = n.type as any;
        // For section nodes, wrap content with a default inner div
        if (n.type === 'section') {
          const dir = currentFlexDirection(n.classes);
          const dirCls = dir === 'row' ? 'flex-row' : dir === 'row-reverse' ? 'flex-row-reverse' : dir === 'col-reverse' ? 'flex-col-reverse' : 'flex-col';
          const align = currentItemsAlign(n.classes);
          const itemsCls = align === 'end' ? 'items-end' : align === 'center' ? 'items-center' : align === 'stretch' ? 'items-stretch' : 'items-start';
          const justify = currentJustifyContent(n.classes);
          const justifyCls = dir === 'row' || dir === 'row-reverse'
            ? (justify === 'end' ? 'justify-end' : justify === 'center' ? 'justify-center' : justify === 'between' ? 'justify-between' : justify === 'around' ? 'justify-around' : justify === 'evenly' ? 'justify-evenly' : justify === 'stretch' ? 'justify-stretch' : 'justify-start')
            : '';
          return <Tag {...common} {...droppable}>
            <div className={`section-inner flex ${dirCls} ${itemsCls} ${justifyCls}`}>
              {n.children.map((c) => (
                <React.Fragment key={c.id}>{render(c.id)}</React.Fragment>
              ))}
            </div>
            {n.children.length === 0 && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-wide text-gray-400">{n.type}</span>
            )}
            {renderHandle}
            {dropHint && dropHint.id === id && dropHint.kind !== 'inside' && (
              <div className={`pointer-events-none absolute left-0 right-0 h-[2px] bg-blue-500 ${dropHint.kind === 'before' ? 'top-0' : 'bottom-0'}`}></div>
            )}
            {dropHint && dropHint.id === id && dropHint.kind === 'inside' && (
              <div className="pointer-events-none absolute inset-0 ring-2 ring-blue-400/60 rounded-sm"></div>
            )}
          </Tag>;
        }
        return <Tag {...common} {...droppable}>
          {n.children.length === 0 ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-wide text-gray-400">{n.type}</span>
          ) : (
            n.children.map((c) => (
              <React.Fragment key={c.id}>{render(c.id)}</React.Fragment>
            ))
          )}
          {renderHandle}
          {dropHint && dropHint.id === id && dropHint.kind !== 'inside' && (
            <div className={`pointer-events-none absolute left-0 right-0 h-[2px] bg-blue-500 ${dropHint.kind === 'before' ? 'top-0' : 'bottom-0'}`}></div>
          )}
          {dropHint && dropHint.id === id && dropHint.kind === 'inside' && (
            <div className="pointer-events-none absolute inset-0 ring-2 ring-blue-400/60 rounded-sm"></div>
          )}
        </Tag>;
      }
    }
  };

  const clearRootHintOnLeave: React.DragEventHandler<HTMLDivElement> = () => {
    setDropHint((cur) => (cur && cur.id === 'root' ? null : cur));
  };

  return (
    <div className="panel p-4 h-full overflow-auto min-w-0" onDrop={onDrop} onDragOver={onDragOver} onClick={() => select('root')}>
      <div className="text-xs text-gray-500 mb-2">Drop components here</div>
      <div
        data-testid="canvas-root"
        className="relative w-full min-w-0 max-w-full overflow-x-hidden box-border min-h-[60vh] bg-white "
        onDragLeave={clearRootHintOnLeave}
      >
        {state.root.children.length === 0 ? (
          <div className="text-gray-400 text-sm">Empty canvas</div>
        ) : (
          state.root.children.map((c) => <React.Fragment key={c.id}>{render(c.id)}</React.Fragment>)
        )}
        {dropHint && dropHint.id === 'root' && dropHint.kind === 'inside' && (
          <div className="pointer-events-none absolute inset-0 ring-2 ring-blue-400/60 rounded-sm"></div>
        )}
      </div>
    </div>
  );
}
