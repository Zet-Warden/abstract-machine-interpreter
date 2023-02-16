export default class Stack<T> {
    private _stack: T[];

    constructor(arr?: T[]) {
        if (typeof arr != 'undefined') this._stack = arr;
        else this._stack = [];
    }

    push(element: T): void {
        this._stack.push(element);
    }

    pop(): T | undefined {
        return this._stack.pop();
    }

    peek(): T | undefined {
        return this._stack.at(-1);
    }

    isEmpty(): boolean {
        return this._stack.length == 0;
    }

    copy(): Stack<T> {
        return new Stack(this._stack);
    }

    get length(): number {
        return this._stack.length;
    }
}
