import { addNode, createEmptyState, findNode, updateSelected } from '../src/state/model';

describe('state transforms', () => {
  test('addNode adds a node and selects it', () => {
    const s = createEmptyState();
    addNode(s, 'button');
    expect(s.root.children.length).toBe(1);
    const id = s.root.children[0].id;
    expect(s.selectedId).toBe(id);
  });

  test('updateSelected updates selected node text', () => {
    const s = createEmptyState();
    addNode(s, 'text');
    const id = s.selectedId!;
    updateSelected(s, (n) => { n.props.text = 'Hello'; });
    expect(findNode(s.root, id)!.props.text).toBe('Hello');
  });
});

