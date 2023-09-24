import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ConnectionConfigTree } from 'drivers/base/SQLLikeConnection';
import Icon from 'renderer/components/Icon';
import { TreeViewItemData } from 'renderer/components/TreeView';

export default class ConnectionSettingTree {
  protected tree: ConnectionConfigTree[];
  protected dict: Record<string, ConnectionConfigTree> = {};

  constructor(tree: ConnectionConfigTree[]) {
    this.tree = tree;
    this.rebuildHashTable();
  }

  protected rebuildHashTable() {
    this.dict = {};
    this.buildHashTable(this.tree);
  }

  protected buildHashTable(tree?: ConnectionConfigTree[]) {
    if (!tree) return;
    for (const node of tree) {
      this.dict[node.id] = node;
      this.buildHashTable(node.children);
    }
  }

  protected buildTreeViewInternal(
    root?: ConnectionConfigTree[]
  ): TreeViewItemData<ConnectionConfigTree>[] {
    if (!root) return [];

    return root.map((config) => {
      return {
        id: config.id,
        data: config,
        icon:
          config.nodeType === 'folder' ? (
            <FontAwesomeIcon icon={faFolder} color="#f39c12" />
          ) : config.config?.type === 'mysql' ? (
            <Icon.MySql />
          ) : (
            <Icon.PostgreSQL />
          ),
        text: config.name,
        children:
          config.children && config.children.length > 0
            ? this.buildTreeViewInternal(config.children)
            : undefined,
      };
    });
  }

  protected sortConnection(tree: ConnectionConfigTree[]) {
    const tmp = [...tree];
    tmp.sort((a, b) => {
      if (a.nodeType === 'folder' && b.nodeType === 'folder')
        return a.name.localeCompare(b.name);
      else if (a.nodeType === 'folder') {
        return -1;
      } else if (b.nodeType === 'folder') {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
    return tmp;
  }

  buildTreeView() {
    return this.buildTreeViewInternal(this.tree);
  }

  getAllNodes() {
    return Object.values(this.dict);
  }

  getById(id?: string) {
    if (!id) return;
    return this.dict[id];
  }

  getNewTree() {
    return [...this.tree];
  }

  isParentAndChild(
    parent: ConnectionConfigTree,
    child: ConnectionConfigTree
  ): boolean {
    let ptr: ConnectionConfigTree | undefined = child;
    while (ptr) {
      if (ptr.id === parent.id) return true;
      ptr = this.getById(ptr.parentId);
    }
    return false;
  }

  detachFromParent(node: ConnectionConfigTree) {
    if (node.parentId) {
      const parent = this.getById(node.parentId);
      if (parent?.children) {
        parent.children = parent.children.filter(
          (child) => child.id !== node.id
        );
      }
    } else {
      this.tree = this.tree.filter((child) => child.id !== node.id);
    }
  }

  moveNodeToRoot(from: ConnectionConfigTree) {
    this.detachFromParent(from);
    this.insertNode(from);
  }

  moveNode(from: ConnectionConfigTree, to: ConnectionConfigTree) {
    // Stop operation if we are trying to move parent node
    // into its child node. It is impossible operation
    if (this.isParentAndChild(from, to)) return;

    this.detachFromParent(from);
    this.insertNode(from, to.id);
  }

  insertNode(node: ConnectionConfigTree, parentId?: string) {
    const parent: ConnectionConfigTree | undefined = this.getById(parentId);

    if (parent) {
      const folderParent =
        parent.nodeType === 'folder' ? parent : this.getById(parent.parentId);

      if (folderParent?.children) {
        node.parentId = folderParent.id;
        folderParent.children = this.sortConnection([
          ...folderParent.children,
          node,
        ]);
        return;
      }
    }

    node.parentId = undefined;
    this.tree = this.sortConnection([...this.tree, node]);
  }
}
