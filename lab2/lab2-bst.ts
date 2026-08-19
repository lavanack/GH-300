/**
 * Binary Search Tree implementation
 * 
 * @class BinarySearchTree
 * @template T - The type of values stored in the tree
 * 
 * Methods:
 * - insert(value: T): void — Insert a value maintaining BST property
 * - search(value: T): boolean — Return true if value exists
 * - inOrderTraversal(): T[] — Return sorted array of all values
 * - delete(value: T): void — Remove value, maintaining BST property
 * - min(): T | undefined — Return minimum value
 * - max(): T | undefined — Return maximum value
 * 
 * Properties:
 * - root: TreeNode<T> | null
 * - size: number (readonly)
 * 
 * Edge cases:
 * - Duplicate values should be ignored (no duplicates)
 * - Operations on empty tree should not throw
 */

interface TreeNode<T> {
    value: T;
    left: TreeNode<T> | null;
    right: TreeNode<T> | null;
}

class BinarySearchTree<T> {
    root: TreeNode<T> | null = null;
    private _size: number = 0;

    get size(): number {
        return this._size;
    }

    insert(value: T): void {
        const newNode: TreeNode<T> = { value, left: null, right: null };

        if (this.root === null) {
            this.root = newNode;
            this._size++;
            return;
        }

        let current = this.root;
        while (true) {
            if (value === current.value) {
                return; // Ignore duplicates
            }
            if (value < current.value) {
                if (current.left === null) {
                    current.left = newNode;
                    this._size++;
                    return;
                }
                current = current.left;
            } else {
                if (current.right === null) {
                    current.right = newNode;
                    this._size++;
                    return;
                }
                current = current.right;
            }
        }
    }
}