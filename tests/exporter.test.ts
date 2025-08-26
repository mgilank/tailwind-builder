import { renderHtml } from '../src/utils/exporter';
import { minifyHtml } from '../src/utils/minify';

test('renderHtml renders children', () => {
  const root = {
    id: 'root', type: 'div', classes: '', props: {}, children: [
      { id: '1', type: 'h1', classes: 'text-2xl', props: { text: 'Title' }, children: [] },
      { id: '2', type: 'button', classes: 'btn', props: { text: 'Go' }, children: [] },
    ]
  } as any;
  const html = renderHtml(root);
  expect(html).toContain('<h1 class="text-2xl">Title</h1>');
  expect(html).toContain('<button class="btn">Go</button>');
});

test('minifyHtml removes whitespace between tags', () => {
  const input = `<div>\n  <span> A </span>\n</div>`;
  expect(minifyHtml(input)).toBe('<div><span> A </span></div>');
});

