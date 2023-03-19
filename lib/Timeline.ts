import Queue from './memory/Queue';
import Stack from './memory/Stack';
import Tape from './memory/Tape';
import State from './State';
import Command from './utils/Command';
import TimelineStatus from './utils/TimelineStatus';

export default class Timeline {
    private _inputTape: Tape;
    private _outputTape: Tape;
    private _status: TimelineStatus;

    //memory/ies: Map<name, data structure>
    private _memories: Map<string, Queue | Stack | Tape>;
    //non-deterministic machines can have multiple "current states"
    private _currentStateName: string;

    constructor(
        currentStateName: string,
        inputTape: Tape,
        outputTape: Tape,
        memories: Map<string, Queue | Stack | Tape>
    ) {
        this._inputTape = inputTape;
        this._outputTape = outputTape;
        this._currentStateName = currentStateName;

        this._memories = memories;
        this._status = TimelineStatus.RUNNING;
    }

    get status() {
        return this._status;
    }

    get currentStateName() {
        return this._currentStateName;
    }

    getInputTape() {
        return this._inputTape.clone();
        // return this._inputTape;
    }

    getOutputTape() {
        return this._outputTape.clone();
        // return this._outputTape;
    }

    setStatus(status: TimelineStatus) {
        this._status = status;
    }

    getMemories() {
        const clonedMemory = new Map<string, Queue | Stack | Tape>();
        const entries = this._memories.entries();

        for (const [memoryName, memory] of entries) {
            clonedMemory.set(memoryName, memory.clone());
        }

        return clonedMemory;

        // return structuredClone(this._memories);
    }

    scan() {
        const symbol = this._inputTape.moveRight();
        return symbol;
    }

    // step() {
    //     const command = this.currentState.command;
    //     switch (command) {
    //         case Command.SCAN:
    //             scan();
    //             break;
    //         case Command.PRINT:
    //             print();
    //             break;
    //         case Command.SCAN_LEFT:
    //             scan_left();
    //             break;
    //         case Command.SCAN_RIGHT:
    //             scan_right();
    //             break;
    //         case Command.READ:
    //             read();
    //             break;
    //         case Command.WRITE:
    //             write();
    //             break;
    //         case Command.RIGHT:
    //             right();
    //             break;
    //         case Command.LEFT:
    //             left();
    //             break;
    //         case Command.UP:
    //             up();
    //             break;
    //         case Command.DOWN:
    //             down();
    //             break;
    //     }
    // }
}
