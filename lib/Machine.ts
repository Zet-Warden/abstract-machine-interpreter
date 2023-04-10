import Queue from './memory/Queue';
import Stack from './memory/Stack';
import Tape from './memory/Tape';
import TapeCell from './memory/TapeCell';

import State from './State';
import Timeline from './Timeline';
import Command from './utils/Command';
import Direction from './utils/Direction';
import TimelineStatus from './utils/TimelineStatus';

export default class Machine {
    initialState: State;
    states: Map<string, State>;
    memories: Map<string, Queue | Stack | Tape>;
    isInitialized: boolean;

    //non-deterministic machines can have multiple "timelines"
    timelines: Timeline[];

    constructor() {
        this.states = new Map<string, State>();
        this.memories = new Map<string, Queue | Stack | Tape>();
        this.isInitialized = false;

        this.timelines = [];
    }

    get status(): TimelineStatus {
        if (this.isThereRunningTimeLine()) return TimelineStatus.RUNNING;
        if (this.getAcceptedTimeline() != undefined)
            return TimelineStatus.ACCEPTED;
        return TimelineStatus.REJECTED;
    }

    getStateNames() {
        return [...this.states.keys()];
    }

    getAcceptedTimeline() {
        return this.timelines.find(
            (timeline) => timeline.status == TimelineStatus.ACCEPTED
        );
    }

    getIsInitialized() {
        return this.initialState != undefined;
    }

    isThereRunningTimeLine() {
        return (
            this.timelines.some(
                (timeline) => timeline.status == TimelineStatus.RUNNING
            ) &&
            this.timelines.every(
                (timeline) => timeline.status != TimelineStatus.ACCEPTED
            )
        );
    }

    shouldHalt() {
        return (
            this.getAcceptedTimeline() != undefined ||
            !this.isThereRunningTimeLine()
        );
    }

    addState(state: State) {
        if (this.getStateNames().length == 0) this.initialState = state;
        this.states.set(state.name, state);
    }

    addStateTransition(name: string, transition: [string, string]) {
        if (!this.states.has(name))
            throw new Error(
                `${name} has not been added as a state to this machine.`
            );

        const state = this.states.get(name)!;
        state.addTransition(transition[0], transition[1]);
    }

    addMemory(name: string, memory: Stack | Queue | Tape) {
        this.memories.set(name, memory);
    }

    start(input: string = ''): Machine {
        this.timelines = [];

        const clonedMemory = new Map<string, Queue | Stack | Tape>();
        const entries = this.memories.entries();
        for (const [memoryName, memory] of entries) {
            clonedMemory.set(memoryName, memory.clone());
        }

        const [hasDeclaredTape, memoryTape] = (() => {
            const memories = this.memories.values();
            for (const memory of memories) {
                if (memory instanceof Tape) {
                    return [true, memory];
                }
            }
            return [false, ''];
        })();

        const inputTape = hasDeclaredTape
            ? (memoryTape as Tape)
            : new Tape(`${TapeCell.BLANK_SYMBOL}${input}`);
        const outputTape = new Tape(`${TapeCell.BLANK_SYMBOL}`);
        const initialTimeline = new Timeline(
            this.initialState.name,
            inputTape,
            outputTape,
            clonedMemory
        );

        this.timelines.push(initialTimeline);
        return this;
        // hasDeclaredTape ? console.log('start', this.timelines.length) : '';
    }

    step() {
        if (this.shouldHalt()) return;

        const existingTimelines: Timeline[] = [];
        const additionalTimelines: Timeline[] = [];

        //remove previous dead/rejected timelines
        const filteredTimelines = this.timelines.filter(
            (timeline) => timeline.status != TimelineStatus.REJECTED
        );

        for (const timeline of filteredTimelines) {
            const newTimelines = this.stepTimeline(timeline);
            existingTimelines.push(...newTimelines.slice(0, 1));
            additionalTimelines.push(...newTimelines.slice(1));
        }

        this.timelines = [...existingTimelines, ...additionalTimelines];
    }

    run() {
        while (this.shouldHalt()) {
            this.step();
        }

        return this.getAcceptedTimeline() != undefined
            ? 'accepted'
            : 'rejected';
    }

    private stepTimeline(timeline: Timeline): Timeline[] {
        const stateName = timeline.currentStateName;
        const state = this.states.get(stateName)!;
        console.log(state, stateName);
        switch (state.command) {
            case Command.SCAN:
                return this.scan_right(timeline);
            case Command.PRINT:
                return this.print(timeline);
            case Command.SCAN_LEFT:
                return this.scan_left(timeline);
            case Command.SCAN_RIGHT:
                return this.scan_right(timeline);
            case Command.READ:
                return this.read(timeline);
            case Command.WRITE:
                return this.write(timeline);
            case Command.RIGHT:
                return this.right(timeline);
            case Command.LEFT:
                return this.left(timeline);
            case Command.UP:
                return this.up(timeline);
            case Command.DOWN:
                return this.down(timeline);
        }

        return [];
    }

    private scan_right(timeline: Timeline): Timeline[] {
        return this.readTransition(timeline, Command.SCAN_RIGHT);
    }

    private scan_left(timeline: Timeline): Timeline[] {
        return this.readTransition(timeline, Command.SCAN_LEFT);
    }

    private print(timeline: Timeline): Timeline[] {
        return this.writeTransition(timeline, Command.PRINT);
    }

    private read(timeline: Timeline): Timeline[] {
        return this.readTransition(timeline, Command.READ);
    }

    private write(timeline: Timeline): Timeline[] {
        return this.writeTransition(timeline, Command.WRITE);
    }

    private right(timeline: Timeline): Timeline[] {
        return this.readWriteTransition(timeline, Direction.RIGHT);
    }

    private left(timeline: Timeline): Timeline[] {
        return this.readWriteTransition(timeline, Direction.LEFT);
    }

    private up(timeline: Timeline): Timeline[] {
        return this.readWriteTransition(timeline, Direction.UP);
    }

    private down(timeline: Timeline): Timeline[] {
        return this.readWriteTransition(timeline, Direction.DOWN);
    }

    private readTransition(
        timeline: Timeline,
        command: Command.SCAN_LEFT | Command.SCAN_RIGHT | Command.READ
    ) {
        const inputTape = timeline.getInputTape();
        const outputTape = timeline.getOutputTape();
        const memories = timeline.getMemories();
        const stateName = timeline.currentStateName;
        const state = this.states.get(stateName)!;

        if (command == Command.SCAN_RIGHT) {
            var symbol = inputTape.moveRight();
        } else if (command == Command.SCAN_LEFT) {
            var symbol = inputTape.moveLeft();
        } else {
            const memory = memories.get(state.memoryName!)!;
            var symbol = (<Stack | Queue>memory).pop()!;
        }

        const nextStates = state.getNextState(symbol);

        const newTimelines = [];
        for (const nextStateName of nextStates) {
            const newTimeline = this.createNewTimeline(nextStateName, {
                inputTape,
                outputTape,
                memories,
            });
            newTimelines.push(newTimeline);
        }

        if (newTimelines.length == 0) {
            timeline.setStatus(TimelineStatus.REJECTED);
            newTimelines.push(timeline);
        }

        return newTimelines;
    }

    private writeTransition(
        timeline: Timeline,
        command: Command.PRINT | Command.WRITE
    ): Timeline[] {
        const inputTape = timeline.getInputTape();
        const outputTape = timeline.getOutputTape();
        const memories = timeline.getMemories();
        const stateName = timeline.currentStateName;
        const state = this.states.get(stateName)!;

        const writeTransitions = [...state.getTransitions().entries()];
        const newTimelines = [];

        for (const [symbolTobePrinted, nextStates] of writeTransitions) {
            if (command == Command.PRINT) {
                outputTape.write(symbolTobePrinted);
                outputTape.moveRight();
            } else {
                const memory = memories.get(state.memoryName!)!;
                (<Stack | Queue>memory).push(symbolTobePrinted);
            }

            for (const nextStateName of nextStates) {
                const newTimeline = this.createNewTimeline(nextStateName, {
                    inputTape,
                    outputTape,
                    memories,
                });
                newTimelines.push(newTimeline);
            }
        }

        return newTimelines;
    }

    private readWriteTransition(
        timeline: Timeline,
        direction: Direction
    ): Timeline[] {
        const inputTape = timeline.getInputTape();
        const outputTape = timeline.getOutputTape();
        const memories = timeline.getMemories();
        const stateName = timeline.currentStateName;
        const state = this.states.get(stateName)!;

        const tape = memories.get(state.memoryName!)! as Tape;
        const symbol = tape.move(direction);

        const transitions = state.getTransitions();
        const readWriteTransitions = [...transitions.entries()];
        const newTimelines = [];

        for (const [readWriteTrigger, nextStates] of readWriteTransitions) {
            const [symbolTrigger, symbolToBePrinted] =
                readWriteTrigger.split('/');

            if (symbolTrigger != symbol) continue;

            tape.write(symbolToBePrinted);
            // console.log(tape.toString({ printBlank: false }));
            for (const nextStateName of nextStates) {
                const newTimeline = this.createNewTimeline(nextStateName, {
                    inputTape,
                    outputTape,
                    memories,
                });
                newTimelines.push(newTimeline);
            }
        }

        // if (stateName == 'A') console.log('A', symbol);

        // console.log(tape.toString());
        if (newTimelines.length == 0) {
            timeline.setStatus(TimelineStatus.REJECTED);
            newTimelines.push(timeline);

            console.log(
                `Died at timeline where current state is at: ${stateName}; read a ${symbol}; looking for ${[
                    ...transitions.keys(),
                ]}`
            );
        }
        return newTimelines;
    }

    private createNewTimeline(
        nextStateName: string,
        timeline: {
            inputTape: Tape;
            outputTape: Tape;
            memories: Map<string, Stack | Queue | Tape>;
        }
    ): Timeline {
        // const nextState = this.states.get(nextStateName)!;
        const newTimeline = new Timeline(
            nextStateName,
            timeline.inputTape,
            timeline.outputTape,
            timeline.memories
        );

        if (nextStateName == 'accept') {
            newTimeline.setStatus(TimelineStatus.ACCEPTED);
        } else if (nextStateName == 'reject') {
            newTimeline.setStatus(TimelineStatus.REJECTED);
        }

        return newTimeline;
    }
}
