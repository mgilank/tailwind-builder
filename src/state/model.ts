export type NodeType = 'section' | 'div' | 'button' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'text' | 'link';

export interface NodeProps {
  text?: string;
  href?: string;
  target?: string;
}

export interface TreeNode {
  id: string;
  type: NodeType;
  classes: string;
  props: NodeProps;
  children: TreeNode[];
}

export interface BuilderState {
  root: TreeNode;
  selectedId?: string;
  past: BuilderStateSnapshot[];
  future: BuilderStateSnapshot[];
}

export interface BuilderStateSnapshot {
  root: TreeNode;
  selectedId?: string;
}

export const createEmptyState = (): BuilderState => ({
  root: { id: 'root', type: 'div', classes: 'min-h-screen p-6', props: {}, children: [] },
  selectedId: undefined,
  past: [],
  future: [],
});

export const cloneTree = (n: TreeNode): TreeNode => ({
  id: n.id,
  type: n.type,
  classes: n.classes,
  props: { ...n.props },
  children: n.children.map(cloneTree),
});

const snapshot = (s: BuilderState): BuilderStateSnapshot => ({ root: cloneTree(s.root), selectedId: s.selectedId });

export const pushHistory = (s: BuilderState) => {
  s.past.push(snapshot(s));
  s.future = [];
};

export const undo = (s: BuilderState) => {
  const prev = s.past.pop();
  if (!prev) return;
  s.future.push(snapshot(s));
  s.root = cloneTree(prev.root);
  s.selectedId = prev.selectedId;
};

export const redo = (s: BuilderState) => {
  const next = s.future.pop();
  if (!next) return;
  s.past.push(snapshot(s));
  s.root = cloneTree(next.root);
  s.selectedId = next.selectedId;
};

export const genId = () => Math.random().toString(36).slice(2, 9);

export const addNode = (s: BuilderState, type: NodeType) => {
  pushHistory(s);
  const node: TreeNode = {
    id: genId(),
    type,
    classes: type === 'section' ? 'py-12' : type === 'button' ? 'px-4 py-2 bg-blue-600 text-white rounded' : '',
    props: defaultProps(type),
    children: [],
  };
  s.root.children.push(node);
  s.selectedId = node.id;
};

export const defaultProps = (type: NodeType): NodeProps => {
  switch (type) {
    case 'button':
      return { text: 'Button' };
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
      return { text: type.toUpperCase() };
    case 'text':
      return { text: 'Text' };
    case 'link':
      return { text: 'Link', href: '#', target: '_self' };
    default:
      return {};
  }
};

export const findNode = (root: TreeNode, id?: string): TreeNode | undefined => {
  if (!id) return undefined;
  if (root.id === id) return root;
  for (const c of root.children) {
    const f = findNode(c, id);
    if (f) return f;
  }
};

export const updateSelected = (s: BuilderState, updater: (n: TreeNode) => void) => {
  const n = findNode(s.root, s.selectedId);
  if (!n) return;
  pushHistory(s);
  updater(n);
};

