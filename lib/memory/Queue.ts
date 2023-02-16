export default class Queue<T> {
    private _queue: T[];

    constructor(arr?: T[]) {
        if (typeof arr != 'undefined') this._queue = arr;
        else this._queue = [];
    }

    enqueue(element: T): void {
        this._queue.unshift(element);
    }

    dequeue(): T | undefined {
        return this._queue.shift();
    }

    peek(): T | undefined {
        return this._queue.at(0);
    }

    isEmpty(): boolean {
        return this._queue.length == 0;
    }

    copy(): Queue<T> {
        return new Queue(this._queue);
    }

    get length(): number {
        return this._queue.length;
    }
}
