export default class Stack {
    private _stack: string[];

    constructor(arr?: string[]) {
        if (typeof arr != 'undefined') this._stack = [...arr];
        else this._stack = [];
    }

    push(element: string): void {
        this._stack.push(element);
    }

    pop(): string | undefined {
        return this._stack.pop();
    }

    peek(): string | undefined {
        return this._stack.at(-1);
    }

    isEmpty(): boolean {
        return this._stack.length == 0;
    }

    clone(): Stack {
        return new Stack(this._stack);
    }

    get length(): number {
        return this._stack.length;
    }
}
