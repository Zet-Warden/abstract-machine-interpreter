export default class Queue {
    private _queue: string[];

    constructor(arr?: string[]) {
        if (typeof arr != 'undefined') this._queue = [...arr];
        else this._queue = [];
    }

    enqueue(element: string): void {
        this._queue.unshift(element);
    }

    dequeue(): string | undefined {
        return this._queue.shift();
    }

    peek(): string | undefined {
        return this._queue.at(0);
    }

    isEmpty(): boolean {
        return this._queue.length == 0;
    }

    copy(): Queue {
        return new Queue(this._queue);
    }

    get length(): number {
        return this._queue.length;
    }
}
