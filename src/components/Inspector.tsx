import React from 'react';
import { BuilderState, findNode, updateSelected } from '../state/model';
import {
  applyMarginClass,
  applyPaddingClass,
  SPACING_VALUES_UI,
  currentMarginValue,
  currentPaddingValue,
  applyTextColorArbitrary,
  applyBgColorArbitrary,
  currentTextArbitrary,
  currentBgArbitrary,
  applyTextColor,
  applyBgColor,
} from '../utils/classes';
import ColorPicker from './ColorPicker';

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

          <div className="space-y-4 mt-3">
            {/* Text color group side-by-side */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Text Color</label>
              <div className="flex items-start gap-3">
                <ColorPicker
                  hideLabel
                  mode="text"
                  classes={node.classes}
                  onApply={(newClasses) => setState((s) => updateSelected(s, (n) => { n.classes = newClasses; }))}
                />
                <div className="flex items-center gap-2">
                  <input
                    id="text-general-colorpicker"
                    type="color"
                    className="h-8 w-10 p-0 border rounded cursor-pointer"
                    value={(currentTextArbitrary(node.classes) || '#000000').replace(/^(?!#)/, '#')}
                    onChange={(e) => setState((s) => updateSelected(s, (n) => { n.classes = applyTextColorArbitrary(n.classes, e.target.value); }))}
                    title="Pick any color"
                  />
                  
                </div>
              </div>
              <button
                    type="button"
                    className="px-2 py-1 text-xs border rounded"
                    onClick={() => setState((s) => updateSelected(s, (n) => { n.classes = applyTextColor(n.classes, undefined, undefined); }))}
                  >reset color</button>
            </div>
            {/* Background color group side-by-side */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Background</label>
              <div className="flex items-start gap-3">
                <ColorPicker
                  hideLabel
                  mode="bg"
                  classes={node.classes}
                  onApply={(newClasses) => setState((s) => updateSelected(s, (n) => { n.classes = newClasses; }))}
                />
                <div className="flex items-center gap-2">
                  <input
                    id="bg-general-colorpicker"
                    type="color"
                    className="h-8 w-10 p-0 border rounded cursor-pointer"
                    value={(currentBgArbitrary(node.classes) || '#000000').replace(/^(?!#)/, '#')}
                    onChange={(e) => setState((s) => updateSelected(s, (n) => { n.classes = applyBgColorArbitrary(n.classes, e.target.value); }))}
                    title="Pick any color"
                  />
                  
                </div>
              </div>
              <button
                    type="button"
                    className="px-2 py-1 text-xs border rounded"
                    onClick={() => setState((s) => updateSelected(s, (n) => { n.classes = applyBgColor(n.classes, undefined, undefined); }))}
                  >reset color</button>
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
