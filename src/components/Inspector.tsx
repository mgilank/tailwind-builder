import React from 'react';
import { BuilderState, findNode, updateSelected } from '../state/model';

interface Props {
  state: BuilderState;
  setState: (updater: (s: BuilderState) => void) => void;
}

export default function Inspector({ state, setState }: Props) {
  const node = findNode(state.root, state.selectedId);

  if (!node || node.id === 'root') {
    return (
      <div className="panel p-3 h-full">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Inspector</h2>
        <div className="text-sm text-gray-500">Select an element to edit</div>
      </div>
    );
  }

  const canText = ['button', 'text', 'link', 'h1', 'h2', 'h3', 'h4', 'h5'].includes(node.type);
  const isHeading = ['h1','h2','h3','h4','h5'].includes(node.type);
  const isLink = node.type === 'link';

  return (
    <div className="panel p-3 h-full overflow-auto">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Inspector</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Type</label>
          <div className="text-sm font-medium">{node.type}</div>
        </div>

        {canText && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Text</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              value={node.props.text ?? ''}
              onChange={(e) => setState((s) => updateSelected(s, (n) => { n.props.text = e.target.value; }))}
            />
          </div>
        )}

        {isHeading && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Heading Level</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={node.type}
              onChange={(e) => setState((s) => updateSelected(s, (n) => { (n as any).type = e.target.value as any; }))}
            >
              {['h1','h2','h3','h4','h5'].map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        )}

        {isLink && (
          <>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Href</label>
              <input
                className="w-full border rounded px-2 py-1 text-sm"
                value={node.props.href ?? ''}
                onChange={(e) => setState((s) => updateSelected(s, (n) => { n.props.href = e.target.value; }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Target</label>
              <select
                className="w-full border rounded px-2 py-1 text-sm"
                value={node.props.target ?? '_self'}
                onChange={(e) => setState((s) => updateSelected(s, (n) => { n.props.target = e.target.value; }))}
              >
                <option value="_self">_self</option>
                <option value="_blank">_blank</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs text-gray-600 mb-1">Tailwind Classes</label>
          <input
            className="w-full border rounded px-2 py-1 text-sm font-mono"
            value={node.classes}
            onChange={(e) => setState((s) => updateSelected(s, (n) => { n.classes = e.target.value; }))}
            placeholder="px-4 py-2 text-blue-600"
          />
        </div>
      </div>
    </div>
  );
}

