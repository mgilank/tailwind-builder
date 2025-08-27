import React from 'react';
import { BuilderState, findNode, updateSelected } from '../state/model';
import {
  applyBgColor,
  applyMarginClass,
  applyPaddingClass,
  applyTextColor,
  COLOR_NAMES_UI,
  currentBgColor,
  currentMarginValue,
  currentPaddingValue,
  currentTextColor,
  SHADE_VALUES_UI,
  SPACING_VALUES_UI,
} from '../utils/classes';

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

  const canText = ['button', 'text', 'link', 'heading'].includes(node.type as any);
  const isHeading = node.type === 'heading';
  const isLink = node.type === 'link';

  return (
    <div className="panel p-3 h-full overflow-auto">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Inspector</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Type</label>
          <div className="text-sm font-medium">{node.type === 'heading' ? 'Heading' : node.type}</div>
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
              value={node.props.level ?? 1}
              onChange={(e) => setState((s) => updateSelected(s, (n) => { (n as any).props.level = Number(e.target.value) as any; }))}
            >
              {[1,2,3,4,5].map((h) => <option key={h} value={h}>{`H${h}`}</option>)}
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

        {/* Styles */}
        <div className="pt-2 border-t">
          <div className="text-xs font-semibold text-gray-700 mb-2">Styles</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Margin</label>
              <select
                className="w-full border rounded px-2 py-1 text-sm"
                value={currentMarginValue(node.classes)}
                onChange={(e) => setState((s) => updateSelected(s, (n) => { n.classes = applyMarginClass(n.classes, e.target.value); }))}
              >
                {SPACING_VALUES_UI.map((v) => <option key={v} value={v}>{v === '' ? '-' : v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Padding</label>
              <select
                className="w-full border rounded px-2 py-1 text-sm"
                value={currentPaddingValue(node.classes)}
                onChange={(e) => setState((s) => updateSelected(s, (n) => { n.classes = applyPaddingClass(n.classes, e.target.value); }))}
              >
                {SPACING_VALUES_UI.map((v) => <option key={v} value={v}>{v === '' ? '-' : v}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Text Color</label>
              <div className="flex gap-1">
                <select
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  value={currentTextColor(node.classes).color}
                  onChange={(e) => setState((s) => updateSelected(s, (n) => {
                    const cur = currentTextColor(n.classes);
                    n.classes = applyTextColor(n.classes, e.target.value || undefined, cur.shade || undefined);
                  }))}
                >
                  {COLOR_NAMES_UI.map((c) => <option key={c} value={c}>{c === '' ? '-' : c}</option>)}
                </select>
                <select
                  className="w-24 border rounded px-2 py-1 text-sm"
                  value={currentTextColor(node.classes).shade}
                  onChange={(e) => setState((s) => updateSelected(s, (n) => {
                    const cur = currentTextColor(n.classes);
                    n.classes = applyTextColor(n.classes, cur.color || undefined, e.target.value || undefined);
                  }))}
                >
                  {SHADE_VALUES_UI.map((sVal) => <option key={sVal} value={sVal}>{sVal === '' ? '-' : sVal}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Background</label>
              <div className="flex gap-1">
                <select
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  value={currentBgColor(node.classes).color}
                  onChange={(e) => setState((s) => updateSelected(s, (n) => {
                    const cur = currentBgColor(n.classes);
                    n.classes = applyBgColor(n.classes, e.target.value || undefined, cur.shade || undefined);
                  }))}
                >
                  {COLOR_NAMES_UI.map((c) => <option key={c} value={c}>{c === '' ? '-' : c}</option>)}
                </select>
                <select
                  className="w-24 border rounded px-2 py-1 text-sm"
                  value={currentBgColor(node.classes).shade}
                  onChange={(e) => setState((s) => updateSelected(s, (n) => {
                    const cur = currentBgColor(n.classes);
                    n.classes = applyBgColor(n.classes, cur.color || undefined, e.target.value || undefined);
                  }))}
                >
                  {SHADE_VALUES_UI.map((sVal) => <option key={sVal} value={sVal}>{sVal === '' ? '-' : sVal}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

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
