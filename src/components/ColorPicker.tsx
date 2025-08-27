import React from 'react';
import { COLOR_NAMES_UI, SHADE_VALUES_UI, applyBgColor, applyTextColor, currentBgColor, currentTextColor } from '../utils/classes';

type Mode = 'text' | 'bg';

interface Props {
  mode: Mode;
  classes: string;
  onApply: (newClasses: string) => void;
}

function isSelectedNamed(mode: Mode, classes: string, color: string, shade: string) {
  const cur = mode === 'text' ? currentTextColor(classes) : currentBgColor(classes);
  return cur.color === color && (cur.shade || (color === 'white' || color === 'black' ? '' : '')) === shade;
}

export default function ColorPicker({ mode, classes, onApply }: Props) {
  const curNamed = mode === 'text' ? currentTextColor(classes) : currentBgColor(classes);

  const applyNamed = (color: string, shade: string) => {
    const applier = mode === 'text' ? applyTextColor : applyBgColor;
    onApply(applier(classes, color || undefined, shade || undefined));
  };
  // General color picker moved outside this component

  const label = mode === 'text' ? 'Text Color' : 'Background';
  return (
    <div id={`${mode}-tailwind-colorpicker`}>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className="space-y-2">
        {/* Preset palette from Tailwind docs */}
        <div className="max-h-44 overflow-auto border rounded p-2 bg-white">
          <div className="grid grid-cols-1 gap-2">
            {COLOR_NAMES_UI.filter((c) => c !== '' && c !== 'white' && c !== 'black').map((color) => (
              <div key={color}>
                <div className="text-[11px] text-gray-500 mb-1 capitalize">{color}</div>
                <div className="grid grid-cols-11 gap-1">
                  {SHADE_VALUES_UI.filter((s) => s !== '').map((shade) => {
                    const previewBg = `bg-${color}-${shade}`;
                    const selected = isSelectedNamed(mode, classes, color, shade);
                    return (
                      <button
                        key={`${color}-${shade}`}
                        type="button"
                        className={`h-6 w-6 shrink-0 rounded border border-gray-200 ${selected ? 'ring-2 ring-blue-500' : ''} ${previewBg}`}
                        onClick={() => applyNamed(color, shade)}
                        title={`${mode === 'bg' ? 'bg' : 'text'}-${color}-${shade}`}
                      />
                    );
                  })}
                  {/* No inline white/black swatches inside each family */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dedicated white/black swatches */}
        <div className="flex items-center gap-2 mt-2">
          <div className="text-[11px] text-gray-500">White/Black</div>
          <button
            type="button"
            className={`h-6 w-6 shrink-0 rounded border border-gray-200 ${curNamed.color === 'white' ? 'ring-2 ring-blue-500' : ''} bg-white`}
            onClick={() => applyNamed('white', '')}
            title={`${mode === 'bg' ? 'bg' : 'text'}-white`}
          />
          <button
            type="button"
            className={`h-6 w-6 shrink-0 rounded border border-gray-200 ${curNamed.color === 'black' ? 'ring-2 ring-blue-500' : ''} bg-black`}
            onClick={() => applyNamed('black', '')}
            title={`${mode === 'bg' ? 'bg' : 'text'}-black`}
          />
        </div>

        {/* Clear action moved to Inspector to unify with custom clear */}
      </div>
    </div>
  );
}
