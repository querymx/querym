import { ReactElement } from 'react';
import { TreeViewItemData } from 'renderer/components/TreeView';
import { v1 as uuidv1 } from 'uuid';

interface TreeViewItemStorageNode<T> {
  id: string;
  name: string;
  position: number;
  parent: string | null;
  folder: boolean;
  children: TreeViewItemStorageNode<T>[];
  data?: T;
}

type TreeViewItemStorageIconMapper<T> = (
  node: TreeViewItemStorageNode<T>
) => ReactElement;

export default class TreeViewItemStorage<T> {
  protected root: TreeViewItemStorageNode<T> = {
    children: [],
    folder: true,
    id: 'root',
    name: 'root',
    position: 1,
    parent: null,
  };

  protected onIconMapper?: TreeViewItemStorageIconMapper<T>;
  protected hash: Record<string, TreeViewItemStorageNode<T>> = {};
  protected onChangeCallback?: (self: TreeViewItemStorage<T>) => void;

  constructor(options?: {
    onIconMapper?: TreeViewItemStorageIconMapper<T>;
    onChange?: (self: TreeViewItemStorage<T>) => void;
  }) {
    this.onIconMapper = options?.onIconMapper;
    this.onChangeCallback = options?.onChange;
    this.hash['root'] = this.root;
  }

  insertNode(item: T, name: string, folder: boolean, overrideKey?: string) {
    const key = overrideKey ?? uuidv1();

    const nodeData: TreeViewItemStorageNode<T> = {
      id: key,
      children: [],
      position:
        Math.max(...this.root.children.map((node) => node.position)) + 1,
      parent: 'root',
      folder,
      name,
      data: item,
    };

    this.root.children = [...this.root.children, nodeData];
    this.hash[key] = nodeData;

    if (this.onChangeCallback) this.onChangeCallback(this);
  }

  protected removeNodeWalker(node: TreeViewItemStorageNode<T>) {
    for (const childNode of node.children) {
      this.removeNodeWalker(childNode);
    }

    this.detactFromParent(node);
    delete this.hash[node.id];
  }

  removeNode(id: string) {
    const node = this.getById(id);
    if (node) this.removeNodeWalker(node);
    if (this.onChangeCallback) this.onChangeCallback(this);
  }

  renameNode(id: string, name: string) {
    const node = this.getById(id);
    if (node) {
      node.name = name;
    }
    if (this.onChangeCallback) this.onChangeCallback(this);
  }

  updateNode(id: string, name: string, value: T) {
    if (this.hash[id]) {
      Object.assign(this.hash[id], { ...value, name });
    } else {
      this.insertNode(value, name, false, id);
    }
    if (this.onChangeCallback) this.onChangeCallback(this);
  }

  protected getById(id: string | null): TreeViewItemStorageNode<T> | null {
    if (!id) return null;
    return this.hash[id] ?? null;
  }

  protected isParentAndChild(
    parent: TreeViewItemStorageNode<T>,
    child: TreeViewItemStorageNode<T>
  ): boolean {
    let ptr: TreeViewItemStorageNode<T> | undefined = child;
    while (ptr) {
      if (ptr.id === parent.id) return true;
      ptr = ptr.parent ? this.hash[ptr.parent] : undefined;
    }
    return false;
  }

  protected detactFromParent(node: TreeViewItemStorageNode<T>) {
    const parentNode = this.getById(node.parent);
    if (!parentNode) return;
    if (!parentNode.children) return;

    // Remove it from the parent
    parentNode.children = parentNode.children.filter(
      (child) => child.id !== node.id
    );

    this.reposition(parentNode.children);
  }

  protected reposition(arr: TreeViewItemStorageNode<T>[]) {
    arr.sort((a, b) => a.position - b.position);
    arr.forEach((childNode, childIdx) => (childNode.position = childIdx + 1));
  }

  protected attachNode(
    node: TreeViewItemStorageNode<T>,
    parent: TreeViewItemStorageNode<T> | null,
    position: number
  ) {
    if (!parent) return;

    // If the current node is not a folder, use its parent
    if (!parent.folder) {
      parent = this.getById(parent.parent);
    }

    if (!parent) return;

    // Shift the position of the parent node
    parent.children.forEach((childNode) => {
      if (childNode.position > position) childNode.position += 1;
    });

    // Insert into parent
    node.parent = parent.id;
    node.position = position;
    parent.children.push(node);
    this.reposition(parent.children);
  }

  moveNode(from: string, to: string, side: 'bottom' | 'top') {
    // Cannot move itself into itself
    if (from === to) return;

    const nodeFrom = this.getById(from);
    const nodeTo = this.getById(to);

    if (!nodeFrom) return;
    if (!nodeTo) return;

    if (this.isParentAndChild(nodeFrom, nodeTo)) return;

    this.detactFromParent(nodeFrom);
    if (nodeTo.folder && side === 'bottom') {
      this.attachNode(nodeFrom, nodeTo, 0);
    } else {
      this.attachNode(
        nodeFrom,
        nodeTo.folder ? this.getById(nodeTo.parent) ?? nodeTo : nodeTo,
        nodeTo.position + (side === 'bottom' ? 1 : -1)
      );
    }

    if (this.onChangeCallback) this.onChangeCallback(this);
  }

  protected toTreeViewArrayWalker(
    root: TreeViewItemStorageNode<T>
  ): TreeViewItemData<T>[] {
    return root.children.map((node) => {
      return {
        id: node.id,
        data: node.data,
        text: node.name,
        icon: this.onIconMapper ? this.onIconMapper(node) : undefined,
        children: this.toTreeViewArrayWalker(node),
      };
    });
  }

  toTreeViewArray(): TreeViewItemData<T>[] {
    return this.toTreeViewArrayWalker(this.root);
  }

  serialize() {
    return this.root;
  }

  protected rebuildHash(node: TreeViewItemStorageNode<T>) {
    this.hash[node.id] = node;
    for (const r of node.children) {
      this.rebuildHash(r);
    }
  }

  deserialize(node: TreeViewItemStorageNode<T>) {
    try {
      this.root = node;
      this.hash = {};
      this.rebuildHash(this.root);
    } catch {
      // Reset in case there is error
      this.root = {
        children: [],
        folder: true,
        id: 'root',
        name: 'root',
        position: 1,
        parent: null,
      };
      this.hash = { root: this.root };
    }
  }
}
