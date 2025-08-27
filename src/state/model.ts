export type NodeType = 'section' | 'div' | 'button' | 'heading' | 'text' | 'link';

export interface NodeProps {
  text?: string;
  href?: string;
  target?: string;
  level?: 1 | 2 | 3 | 4 | 5; // for heading component
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
  root: { id: 'root', type: 'div', classes: 'min-h-screen p-6 m-8', props: {}, children: [] },
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

const MARGIN_TOKEN_RE = /^(m|mx|my|mt|mb|ml|mr)-(auto|\d+)(\/\d+)?$/;

export const hasAnyMarginClass = (classes: string): boolean => {
  const tokens = classes.split(/\s+/).filter(Boolean);
  return tokens.some((t) => MARGIN_TOKEN_RE.test(t));
};

export const ensureDivMargin = (n: TreeNode) => {
  if (n.type === 'div' && !hasAnyMarginClass(n.classes)) {
    n.classes = `${n.classes}`.trim();
  }
  for (const c of n.children) ensureDivMargin(c);
};

export const convertLegacyHeadings = (n: TreeNode): void => {
  const t = (n.type as unknown) as string;
  if (t === 'h1' || t === 'h2' || t === 'h3' || t === 'h4' || t === 'h5') {
    const level = parseInt(t.slice(1), 10) as 1 | 2 | 3 | 4 | 5;
    (n as any).type = 'heading';
    n.props = { ...n.props, level: (level || 1) as 1 | 2 | 3 | 4 | 5, text: n.props.text ?? t.toUpperCase() };
  }
  for (const c of n.children) convertLegacyHeadings(c);
};

export const addNode = (s: BuilderState, type: NodeType) => {
  pushHistory(s);
  const node: TreeNode = {
    id: genId(),
    type,
    classes:
      type === 'section'
        ? 'pt-[75px] pb-[75px] px-5 flex flex-col items-start'
        : type === 'button'
        ? 'px-4 py-2 bg-blue-600 text-white rounded'
        : type === 'div'
        ? 'inline-block min-w-[80px]'
        : type === 'heading'
        ? 'inline-block text-[32px]'
        : '',
    props: defaultProps(type),
    children: [],
  };
  s.root.children.push(node);
  s.selectedId = node.id;
};

export const canHaveChildren = (type: NodeType): boolean => {
  // Allow stacking inside section and div
  return type === 'div' || type === 'section';
};

export const addNodeToParent = (s: BuilderState, parentId: string, type: NodeType) => {
  const parent = findNode(s.root, parentId);
  if (!parent || !canHaveChildren(parent.type)) return;
  // Do not allow inserting a section into section or div
  if ((type as NodeType) === 'section') return;
  pushHistory(s);
  const node: TreeNode = {
    id: genId(),
    type,
    classes:
      (type as NodeType) === 'section'
        ? 'pt-[75px] pb-[75px] px-5 flex flex-col items-start'
        : (type as NodeType) === 'button'
        ? 'px-4 py-2 bg-blue-600 text-white rounded'
        : (type as NodeType) === 'div'
        ? 'inline-block min-w-[80px]'
        : (type as NodeType) === 'heading'
        ? 'inline-block text-[32px]'
        : '',
    props: defaultProps(type),
    children: [],
  };
  parent.children.push(node);
  s.selectedId = node.id;
};

export const findParentAndIndex = (root: TreeNode, id: string, parent?: TreeNode): { parent?: TreeNode; index: number } | undefined => {
  for (let i = 0; i < root.children.length; i++) {
    const c = root.children[i];
    if (c.id === id) return { parent: root, index: i };
    const found = findParentAndIndex(c, id, root);
    if (found) return found;
  }
  return undefined;
};

export const isDescendant = (root: TreeNode, ancestorId: string, nodeId: string): boolean => {
  const ancestor = findNode(root, ancestorId);
  if (!ancestor) return false;
  const walk = (n: TreeNode): boolean => {
    for (const c of n.children) {
      if (c.id === nodeId) return true;
      if (walk(c)) return true;
    }
    return false;
  };
  return walk(ancestor);
};

export const moveNodeAsChild = (s: BuilderState, nodeId: string, newParentId: string) => {
  const info = findParentAndIndex(s.root, nodeId);
  const newParent = findNode(s.root, newParentId);
  if (!info || !newParent) return;
  const node = info.parent!.children[info.index];
  if (!canHaveChildren(newParent.type)) return;
  if (node.type === 'section') return; // sections cannot be children
  if (isDescendant(s.root, nodeId, newParentId)) return; // prevent moving into own subtree
  pushHistory(s);
  info.parent!.children.splice(info.index, 1);
  newParent.children.push(node);
  s.selectedId = node.id;
};

export const moveNodeRelative = (s: BuilderState, nodeId: string, targetId: string, pos: 'before'|'after') => {
  if (nodeId === targetId) return;
  const srcInfo = findParentAndIndex(s.root, nodeId);
  const tgtInfo = findParentAndIndex(s.root, targetId);
  if (!srcInfo || !tgtInfo || !tgtInfo.parent) return;
  const node = srcInfo.parent!.children[srcInfo.index];
  // compute target parent and insertion index after removal
  const targetParent = tgtInfo.parent;
  // Sections can only be rearranged relative to sections, enforce at call sites; here allow siblings under any parent
  pushHistory(s);
  // remove source
  srcInfo.parent!.children.splice(srcInfo.index, 1);
  // adjust target index if same parent and source index < target index
  let insertIndex = tgtInfo.index;
  if (srcInfo.parent === targetParent && srcInfo.index < tgtInfo.index) insertIndex -= 1;
  if (pos === 'after') insertIndex += 1;
  targetParent.children.splice(insertIndex, 0, node);
  s.selectedId = node.id;
};

export const defaultProps = (type: NodeType): NodeProps => {
  switch (type) {
    case 'button':
      return { text: 'Button' };
    case 'heading':
      return { text: 'HEADING', level: 1 };
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

export const removeNode = (s: BuilderState, nodeId: string) => {
  // Don't allow removing the root node
  if (nodeId === 'root') return;
  
  const info = findParentAndIndex(s.root, nodeId);
  if (!info || !info.parent) return;
  
  pushHistory(s);
  
  // Remove the node from its parent's children
  info.parent.children.splice(info.index, 1);
  
  // If the removed node was selected, clear selection or select parent
  if (s.selectedId === nodeId) {
    s.selectedId = info.parent.id === 'root' ? undefined : info.parent.id;
  }
};

export const updateSelected = (s: BuilderState, updater: (n: TreeNode) => void) => {
  const n = findNode(s.root, s.selectedId);
  if (!n) return;
  pushHistory(s);
  updater(n);
};
