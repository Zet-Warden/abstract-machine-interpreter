import Tape from './memory/Tape';
import TapeCell from './memory/TapeCell';
import Queue from './memory/Queue';
import Stack from './memory/Stack';

import State from './State';
import Command from './utils/Command';

export default class Machine {
    inputTape: Tape;
    outputTape: Tape;
    states: State[];

    //non-deterministic machines can have multiple "current states"
    currentStates: State[];

    //memory/ies: Map<name, data structure>
    queues: Map<string, Queue>;
    stacks: Map<string, Stack>;
    tapes: Map<string, Tape>;

    constructor(input: string) {
        this.inputTape = new Tape(`${TapeCell.BLANK_SYMBOL}${input}`);
        this.outputTape = new Tape(TapeCell.BLANK_SYMBOL);
    }

    addState(name: string, method: Command) {
        // this.states.push
    }

    step() {
        for (const currentState of this.currentStates) {
            const command = currentState.command;
            switch (command) {
                case Command.SCAN:
                    scan();
                    break;
                case Command.PRINT:
                    print();
                    break;
                case Command.SCAN_LEFT:
                    scan_left();
                    break;
                case Command.SCAN_RIGHT:
                    scan_right();
                    break;
                case Command.READ:
                    read();
                    break;
                case Command.WRITE:
                    write();
                    break;
                case Command.RIGHT:
                    right();
                    break;
                case Command.LEFT:
                    left();
                    break;
                case Command.UP:
                    up();
                    break;
                case Command.DOWN:
                    down();
                    break;
            }
        }
    }
}
