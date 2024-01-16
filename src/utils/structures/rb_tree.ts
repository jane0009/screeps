import profiler from "screeps-profiler";

declare global {
  interface Memory {
    _ds_cache?: { [key: string]: SERIALIZED_NODE | unknown };
  }
}

/**
 * function that returns a numeric index for a given item.
 *
 * @param {T} item the item
 * @returns {number} the number
 */
export type INDEX_FUNCTION<T> = (item: T) => number;

/**
 * function to test a given item,
 * for traversing when indexing is not possible
 *
 * @param {T} item the item
 * @returns {boolean} true if equals
 */
export type EQUALS_FUNCTION<T> = (item: T) => boolean;

enum COLOR {
  RED,
  BLACK
}

interface NODE<T> {
  color: COLOR;
  index: number;
  left?: NODE<T>;
  parent?: NODE<T>;
  right?: NODE<T>;
  value: T | null;
}

interface VALUE_EXPORT<T> {
  index: number;
  value: T;
}

interface SERIALIZED_NODE {
  root: string;
  size: number;
}

/**
 * implemtation of red black tree for all types
 *
 * @class
 */
export class RED_BLACK_TREE<T> {
  public id: string;
  private _idx: INDEX_FUNCTION<T>;

  /**
   * root node
   *
   * @returns {NODE<T>|undefined} the root node
   */
  private get _root(): NODE<T> | undefined {
    if (this._root_cache === undefined) {
      Memory._ds_cache ??= {};
      if (Memory._ds_cache[this.id]) {
        const data = Memory._ds_cache[this.id] as SERIALIZED_NODE;
        this._size = data.size;
        if (data.root !== undefined) {
          this._root_cache = JSON.parse(data.root) as NODE<T>;
        }
      }
    }
    return this._root_cache;
  }
  /**
   * root node
   *
   * @param {NODE<T>|undefined} value the root node
   */
  private set _root(value: NODE<T> | undefined) {
    this._root_cache = value;
    Memory._ds_cache ??= {};
    Memory._ds_cache[this.id] = {
      root: JSON.stringify(value),
      size: this._size
    };
  }
  private _root_cache?: NODE<T>;
  private _size = 0;
  /**
   * constructor
   *
   * @constructs RED_BLACK_TREE
   * @param {INDEX_FUNCTION<T>} index_fn the index function
   * @param {string} [name] the name of the tree
   */
  public constructor(index_fn: INDEX_FUNCTION<T>, name?: string) {
    this.id = `RED_BLACK_TREE_${name ?? "unknown"}`;
    this._idx = index_fn;
  }

  /**
   * finds an item by constraint
   *
   * @param {INDEX_FUNCTION<T>} value_fn the constraint function
   * @param {boolean} [allow_inexact=false] allow inexact matches
   * @returns {T|undefined} the item, if found
   */
  public find_by_constraint(value_fn: INDEX_FUNCTION<T>, allow_inexact = false): VALUE_EXPORT<T> | undefined {
    let node = this._root;
    while (node !== undefined) {
      if (node.value === null) {
        throw new Error("node value is null");
      }
      const value = value_fn(node.value);
      // const nval = node.value || "null";
      // console.log(`value test @ ${node.index} (${nval as string})): ${value}`);
      if (value === 0) {
        return {
          index: node.index,
          value: node.value
        };
      } else if (value < 0) {
        if (node.left === undefined && allow_inexact) {
          return {
            index: node.index,
            value: node.value
          };
        }
        node = node.left;
      } else {
        if (node.right === undefined && allow_inexact) {
          return {
            index: node.index,
            value: node.value
          };
        }
        node = node.right;
      }
    }
    return undefined;
  }

  /**
   * finds an item
   *
   * @param {number} index index of the item to find
   * @returns {T|undefined} the item, if found
   */
  public find_by_index(index: number): VALUE_EXPORT<T> | undefined {
    let node = this._root;
    while (node !== undefined) {
      if (index === node.index) {
        return node.value
          ? {
              index: node.index,
              value: node.value
            }
          : undefined;
      } else if (index < node.index) {
        node = node.left;
      } else {
        node = node.right;
      }
    }
    return undefined;
  }

  /**
   * finds an item by constraint
   *
   * @param {INDEX_FUNCTION<T>} value_fn the constraint function
   * @returns {T|undefined} the item, if found
   */
  public find_by_non_indexing_constraint(value_fn: EQUALS_FUNCTION<T>): VALUE_EXPORT<T> | undefined {
    if (!this._root) {
      return undefined;
    }
    const result = this._traverse(value_fn, this._root);
    if (!result || !result.value) {
      return undefined;
    }
    return {
      index: result.index,
      value: result.value
    };
  }

  /**
   * inserts an item into the tree
   *
   * @param {T} item the item to insert
   * @returns {number} the index of the item
   */
  public insert(item: T): number {
    const new_node: NODE<T> = {
      color: COLOR.RED,
      index: 0,
      value: item
    };
    let node = this._root;
    let parent: NODE<T> | undefined;

    while (node !== undefined) {
      parent = node;
      if (node.value === null || new_node.value === null) {
        throw new Error("node value is null");
      }
      const compare_n = this._idx(new_node.value);
      const compare = this._idx(node.value);
      if (compare_n < compare) {
        new_node.index = node.index - 1;
        node = node.left;
      } else if (compare_n > compare) {
        new_node.index = node.index + 1;
        node = node.right;
      } else {
        // make it the left child
        new_node.index = node.index + 1;
        node = node.left;
      }
    }

    if (parent === undefined) {
      this._root = new_node;
    } else if (new_node.index < parent.index) {
      parent.left = new_node;
    } else {
      parent.right = new_node;
    }
    new_node.parent = parent;

    this._rebalance(new_node);

    this._size++;
    return new_node.index;
  }

  /**
   * delete by index
   *
   * @param {number} index the index to delete
   * @returns {boolean} true if deleted, false if not found
   */
  public remove_by_index(index: number): boolean {
    let node = this._root;
    // hot path delete root
    if (node?.index === index) {
      this._root = undefined;
      return true;
    }

    while (node !== undefined && node.index !== index) {
      if (index < node.index) {
        node = node.left;
      } else {
        node = node.right;
      }
    }

    if (node === undefined) {
      return false;
    }

    let up: NODE<T> | undefined;
    let color: COLOR | undefined;

    if (node.left === undefined || node.right === undefined) {
      up = this._delete_low(node);
      color = node.color;
    } else {
      const successor = this._find_successor(node.right);

      node.index = successor.index;
      node.value = successor.value;

      up = this._delete_low(successor);
      color = successor.color;
    }

    if (color === COLOR.BLACK && up !== undefined) {
      this._rebalance_after_delete(up);

      if (up.value === null && up.parent !== undefined) {
        this._replace_child_of_parent(up.parent, up);
      }
    }
    this._size--;
    return true;
  }

  /**
   * get the size of the tree
   *
   * @returns {number} the size
   */
  public get size(): number {
    return this._size;
  }

  /**
   * update a node's value by its index
   *
   * @param {number} index the index of the node to update
   * @param {T} value the new value
   * @returns {boolean} true if updated, false if not found
   */
  public update_by_index(index: number, value: T): boolean {
    let node = this._root;
    while (node !== undefined && node.index !== index) {
      if (index < node.index) {
        node = node.left;
      } else {
        node = node.right;
      }
    }
    if (node !== undefined) {
      // delete and reinsert
      this.remove_by_index(node.index);
      this.insert(value);
      return true;
    } else {
      return false;
    }
  }

  /**
   * delete 0 or 1
   *
   * @param {NODE<T>} node the node to delete
   * @returns {NODE<T>} the replacement node
   */
  private _delete_low(node: NODE<T>): NODE<T> | undefined {
    if (node.parent === undefined) {
      throw new Error("no parent. naturally, this is a problem");
    }
    if (node.left !== undefined) {
      this._replace_child_of_parent(node.parent, node, node.left);
      return node.left;
    } else if (node.right !== undefined) {
      this._replace_child_of_parent(node.parent, node, node.right);
      return node.right;
    } else {
      const new_child: NODE<T> | undefined =
        node.color === COLOR.BLACK
          ? {
              color: COLOR.BLACK,
              index: 0,
              value: null
            }
          : undefined;
      this._replace_child_of_parent(node.parent, node, new_child);
      return new_child;
    }
  }

  /**
   * finds the successor of a node
   *
   * @param {NODE<T>} node the node to find the successor of
   * @returns {NODE<T>} the successor
   */
  private _find_successor(node: NODE<T>): NODE<T> {
    let successor = node;
    while (successor.left !== undefined) {
      successor = successor.left;
    }
    return successor;
  }

  /**
   * rebalances the tree
   *
   * @param {NODE<T>} node the node to rebalance
   */
  private _rebalance(node: NODE<T>): void {
    let parent = node.parent;

    if (parent === undefined) {
      node.color = COLOR.BLACK;
      return;
    }

    if (parent.color === COLOR.BLACK) {
      return;
    }

    const grandparent = parent.parent;
    if (grandparent === undefined) {
      parent.color = COLOR.BLACK;
      return;
    }

    const uncle = this._uncle(node);
    if (uncle !== undefined && uncle.color === COLOR.RED) {
      parent.color = COLOR.BLACK;
      grandparent.color = COLOR.RED;
      uncle.color = COLOR.BLACK;

      this._rebalance(grandparent);
    } else if (parent === grandparent.left) {
      if (node === parent.right) {
        this._rotate_left(parent);
        parent = node;
      }
      this._rotate_right(grandparent);
      parent.color = COLOR.BLACK;
      grandparent.color = COLOR.RED;
    } else {
      if (node === parent.left) {
        this._rotate_right(parent);
        parent = node;
      }
      this._rotate_left(grandparent);
      parent.color = COLOR.BLACK;
      grandparent.color = COLOR.RED;
    }
  }

  /**
   * rebalances the tree after a delete
   *
   * @param {NODE<T>} node the node to rebalance
   */
  private _rebalance_after_delete(node: NODE<T>): void {
    if (node === this._root) {
      node.color = COLOR.BLACK;
      return;
    }

    if (!node.parent) {
      throw new Error("node has no parent");
    }

    let sibling = this._sibling(node);
    if (!sibling) {
      throw new Error("sibling is undefined");
    }

    if (sibling.color === COLOR.RED) {
      this._rebalance_after_delete_red_sibling(node, sibling);
      sibling = this._sibling(node);
    }

    if (!sibling) {
      throw new Error("sibling is undefined after rebalance");
    }
    if (!sibling.left || !sibling.right) {
      throw new Error("sibling does not have 2 children");
    }

    if (sibling.left.color === COLOR.BLACK && sibling.right.color === COLOR.BLACK) {
      sibling.color = COLOR.RED;

      if (node.parent.color === COLOR.RED) {
        node.parent.color = COLOR.BLACK;
      } else {
        this._rebalance_after_delete(node.parent);
      }
    } else {
      this._rebalance_after_delete_black_sibling(node, sibling);
    }
  }

  /**
   * helper for tree rebalance
   *
   * @param {NODE<T>} node the node to rebalance
   * @param {NODE<T>} sibling the sibling node
   */
  private _rebalance_after_delete_black_sibling(node: NODE<T>, sibling: NODE<T>): void {
    let _sibling = sibling;
    if (!node.parent) {
      throw new Error("node has no parent");
    }
    if (!node.parent.right || !node.parent.left) {
      throw new Error("node parent does not have 2 children");
    }
    if (!_sibling.right || !_sibling.left) {
      throw new Error("sibling does not have 2 children");
    }
    const left = node === node.parent.left;
    if (left && _sibling.right.color === COLOR.BLACK) {
      _sibling.left.color = COLOR.BLACK;
      _sibling.color = COLOR.RED;
      this._rotate_right(_sibling);
      _sibling = node.parent.right;
    } else if (!left && _sibling.left.color === COLOR.BLACK) {
      _sibling.right.color = COLOR.BLACK;
      _sibling.color = COLOR.RED;
      this._rotate_left(_sibling);
      _sibling = node.parent.left;
    }

    if (!_sibling) {
      throw new Error("sibling is undefined after rebalance");
    }
    if (!_sibling.left || !_sibling.right) {
      throw new Error("sibling does not have 2 children");
    }

    _sibling.color = node.parent.color;
    node.parent.color = COLOR.BLACK;
    if (left) {
      _sibling.right.color = COLOR.BLACK;
      this._rotate_left(node.parent);
    } else {
      _sibling.left.color = COLOR.BLACK;
      this._rotate_right(node.parent);
    }
  }

  /**
   * helper for tree rebalance
   *
   * @param {NODE<T>} node the node to rebalance
   * @param {NODE<T>} sibling the sibling node
   */
  private _rebalance_after_delete_red_sibling(node: NODE<T>, sibling: NODE<T>): void {
    if (!node.parent) {
      throw new Error("node has no parent");
    }
    sibling.color = COLOR.BLACK;
    node.parent.color = COLOR.RED;

    if (node === node.parent.left) {
      this._rotate_left(node.parent);
    } else {
      this._rotate_right(node.parent);
    }
  }

  /**
   * replace the parent
   *
   * @param {NODE<T>} node the node to replace
   * @param {NODE<T>} parent the parent node
   * @param {NODE<T>} replacement the replacement node
   */
  private _replace_child_of_parent(node: NODE<T>, parent?: NODE<T>, replacement?: NODE<T>): void {
    if (parent === undefined) {
      this._root = replacement;
    } else if (parent.left === node) {
      parent.left = replacement;
    } else if (parent.right === node) {
      parent.right = replacement;
    } else {
      throw new Error("parent does not have node as child");
    }

    if (replacement !== undefined) {
      replacement.parent = parent;
    }
  }

  /**
   * rotates a node left
   *
   * @param {NODE<T>} node the node to rotate
   */
  private _rotate_left(node: NODE<T>): void {
    const parent = node.parent;
    const right = node.right;
    if (right) {
      // handle right->left child
      if (right?.left) {
        node.right = right.left;
      }

      right.left = node;
      node.parent = right;
    }

    this._replace_child_of_parent(node, parent, right);
  }
  /**
   * rotates a node right
   *
   * @param {NODE<T>} node the node to rotate
   */
  private _rotate_right(node: NODE<T>) {
    const parent = node.parent;
    const left = node.left;
    if (left) {
      // handle left->right child
      if (left?.right) {
        node.left = left.right;
      }

      left.right = node;
      node.parent = left;
    }

    this._replace_child_of_parent(node, parent, left);
  }

  /**
   * sibling
   *
   * @param {NODE<T>} node the node
   * @returns {NODE<T>|undefined} the sibling
   */
  private _sibling(node: NODE<T>): NODE<T> | undefined {
    const parent = node.parent;
    if (parent?.left === node) {
      return parent?.right;
    } else if (parent?.right === node) {
      return parent?.left;
    } else {
      throw new Error("node is not a child of its parent");
    }
  }

  /**
   * traverse the tree
   *
   * @param {EQUALS_FUNCTION<T>} fn the function to traverse with
   * @param {NODE<T>} node current node
   * @returns {NODE<T>|undefined} the node, if found
   */
  private _traverse(fn: EQUALS_FUNCTION<T>, node: NODE<T>): NODE<T> | undefined {
    if (!node.value) {
      throw new Error("node value is null");
    }
    if (fn(node.value)) {
      return node;
    }
    if (node.left) {
      const left = this._traverse(fn, node.left);
      if (left) {
        return left;
      }
    }
    if (node.right) {
      const right = this._traverse(fn, node.right);
      if (right) {
        return right;
      }
    }

    return undefined;
  }

  /**
   * gets the grandparent of a node
   *
   * @param {NODE<T>} node the node
   * @returns {NODE<T>|undefined} the uncle
   */
  private _uncle(node: NODE<T>): NODE<T> | undefined {
    const parent = node.parent;
    if (parent?.left === node) {
      return parent?.right;
    } else if (parent?.right === node) {
      return parent?.left;
    } else {
      throw new Error("node is not a child of its parent");
    }
  }
}

profiler.registerClass(RED_BLACK_TREE, "RED_BLACK_TREE");
