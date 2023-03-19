import Command from './utils/Command';

export default class State {
    name: string;
    command?: Command;
    memoryName?: string;

    // non-deterministic machines can transition into many states
    // key: state name, value: next state name
    // note:    transitions can be anything from reading an input then going to the next state
    //          or possibly, writing to a memory than transition to the next state
    //          the general assumption is that the key is the stimulus
    //                  (e.g. reading an input, writing/reading the stack)
    //          while the value is the reaction
    //                  (e.g. going to the next state)
    private transitions: Map<string, string[]>;

    constructor(name: string, command?: Command, memoryName?: string) {
        if (
            (command == Command.READ || command == Command.WRITE) &&
            memoryName == undefined
        )
            throw new Error(
                'READ/WRITE Commands should have an associated memory name.'
            );

        this.name = name;
        this.command = command;
        this.memoryName = memoryName;

        this.transitions = new Map<string, string[]>();
    }

    getTransitions() {
        return structuredClone(this.transitions);
    }

    addTransition(symbol: string, nextState: string) {
        if (this.transitions.has(symbol)) {
            const gotoStates = this.transitions.get(symbol)!;
            gotoStates.push(nextState);
        } else {
            this.transitions.set(symbol, [nextState]);
        }
    }

    getNextState(symbol: string) {
        if (this.transitions.has(symbol)) return this.transitions.get(symbol)!;
        return [];
    }

    // getNextState(symbol: string) {
    //     if (this.command == Command.WRITE) {
    //         return this.transitions.values;
    //     } else if (this.command == Command.READ) {
    //     }
    // }
}
