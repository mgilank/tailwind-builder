import React from 'react';
import type { NodeType } from '../state/model';

const ITEMS: NodeType[] = ['section','div','button','heading','text','link'];

export default function Palette() {
  return (
    <div className="panel p-3 h-full overflow-auto">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Components</h2>
      <div className="grid grid-cols-2 gap-2">
        {ITEMS.map((t) => (
          <button
            key={t}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/x-node-type', t);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            className="text-left px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-200"
            title={`Drag to canvas to add ${t === 'heading' ? 'Heading' : t}`}
          >
            {t === 'heading' ? 'Heading' : t}
          </button>
        ))}
      </div>
    </div>
  );
}
