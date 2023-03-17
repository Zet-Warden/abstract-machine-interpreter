import Command from './utils/Command';

export default class State {
    name: string;
    command: Command;
    private transitions: Map<string, State[]>;

    constructor(name: string, command: Command) {
        this.name = name;
        this.command = command;
    }

    addTransition(symbol: string, state: State) {
        if (this.transitions.has(symbol)) {
            const gotoStates = this.transitions.get(symbol)!;
            gotoStates.push(state);
        } else {
            this.transitions.set(symbol, [state]);
        }
    }
}
