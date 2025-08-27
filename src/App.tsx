import React, { useEffect, useMemo, useState } from 'react';
import Palette from './components/Palette';
import Canvas from './components/Canvas';
import Inspector from './components/Inspector';
import { BuilderState, createEmptyState, convertLegacyHeadings, redo, undo, removeNode } from './state/model';
import { renderHtml } from './utils/exporter';
import { minifyHtml } from './utils/minify';

export default function App() {
  const [state, setStateRaw] = useState<BuilderState>(() => createEmptyState());
  const [minify, setMinify] = useState(true);

  useEffect(() => {
    setState((s) => {
      convertLegacyHeadings(s.root);
    });
  }, []);

  // undo/redo and delete keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in an editable field
      const target = e.target as HTMLElement | null;
      const active = (document.activeElement as HTMLElement | null) || null;
      const isEditable = (el: HTMLElement | null) => !!el && (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT' ||
        el.isContentEditable ||
        !!el.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')
      );

      if (isEditable(target) || isEditable(active)) {
        return; // let the element handle Backspace/Delete/Cmd+Z, etc.
      }

      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setState((s) => e.shiftKey ? redo(s) : undo(s));
      }
      // Delete key to remove selected component
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedId && state.selectedId !== 'root') {
          e.preventDefault();
          setState((s) => removeNode(s, state.selectedId!));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.selectedId]);

  const setState = (updater: (s: BuilderState) => void) => {
    setStateRaw((prev) => {
      const next = {
        root: JSON.parse(JSON.stringify(prev.root)),
        selectedId: prev.selectedId,
        past: [...prev.past],
        future: [...prev.future],
      } as BuilderState;
      updater(next);
      return next;
    });
  };

  const html = useMemo(() => renderHtml(state.root), [state.root]);
  const finalHtml = minify ? minifyHtml(html) : html;

  const copyHtml = async () => {
    try { await navigator.clipboard.writeText(finalHtml); } catch {}
  };

  const downloadHtml = () => {
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'export.html'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen grid grid-rows-[auto,1fr,auto]">
      <header className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="font-semibold">Tailwind Builder</div>
        <div className="flex items-center gap-3">
          <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={minify} onChange={(e) => setMinify(e.target.checked)} /> Minify</label>
          <button onClick={copyHtml} className="px-3 py-1 text-sm bg-gray-800 text-white rounded">Copy HTML</button>
          <button onClick={downloadHtml} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">Download</button>
        </div>
      </header>

      <main className="grid grid-cols-[260px,1fr,300px] gap-3 p-3 overflow-hidden">
        <Palette />
        <Canvas state={state} setState={setState} />
        <Inspector state={state} setState={setState} />
      </main>

      <footer className="bg-white border-t px-4 py-2">
        <div className="text-xs text-gray-500 truncate">{finalHtml}</div>
      </footer>
    </div>
  );
}
