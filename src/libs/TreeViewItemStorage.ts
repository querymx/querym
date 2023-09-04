import { ReactElement } from 'react';
import { TreeViewItemData } from 'renderer/components/TreeView';
import { v1 as uuidv1 } from 'uuid';

type TreeViewItemStorageNode<T> = T & {
  id: string;
  name: string;
  position: number;
  parent: string | null;
  folder: boolean;
};

type TreeViewItemStorageIconMapper<T> = (
  node: TreeViewItemStorageNode<T>
) => ReactElement;

export default class TreeViewItemStorage<T> {
  protected root: TreeViewItemStorageNode<T>[] = [];
  protected onIconMapper?: TreeViewItemStorageIconMapper<T>;
  protected hash: Record<string, TreeViewItemStorageNode<T>> = {};

  constructor(options?: { onIconMapper?: TreeViewItemStorageIconMapper<T> }) {
    this.onIconMapper = options?.onIconMapper;
  }

  insertNode(item: T, name: string, folder: boolean, overrideKey?: string) {
    const key = overrideKey ?? uuidv1();
    const nodeData = {
      ...item,
      id: key,
      position: 0,
      parent: null,
      folder,
      name,
    };

    this.root = [...this.root, nodeData];
    this.hash[key] = nodeData;
  }

  removeNode(id: string) {}

  renameNode(id: string, name: string) {}

  updateNode(id: string, name: string, value: T) {
    if (this.hash[id]) {
      Object.assign(this.hash[id], { ...value, name });
    } else {
      this.insertNode(value, name, false, id);
    }
  }

  moveNode(from: string, to: string) {}

  protected toTreeViewArrayWalker(
    root: TreeViewItemStorageNode<T>[]
  ): TreeViewItemData<TreeViewItemStorageNode<T>>[] {
    return root.map((node) => {
      return {
        id: node.id,
        data: node,
        text: node.name,
        icon: this.onIconMapper ? this.onIconMapper(node) : undefined,
      };
    });
  }

  toTreeViewArray(): TreeViewItemData<TreeViewItemStorageNode<T>>[] {
    return this.toTreeViewArrayWalker(this.root);
  }
}
