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

    //non-deterministic machines can have multiple "timelines"
    timelines: Timeline[];

    constructor() {
        this.states = new Map<string, State>();
        this.memories = new Map<string, Queue | Stack | Tape>();
    }

    getStateNames() {
        return [...this.states.keys()];
    }

    getAcceptedTimeline() {
        return this.timelines.find(
            (timeline) => timeline.status == TimelineStatus.ACCEPTED
        );
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

    start(input: string) {
        this.timelines = [];
        const clonedMemory = new Map<string, Queue | Stack | Tape>();
        const entries = this.memories.entries();
        for (const [memoryName, memory] of entries) {
            clonedMemory.set(memoryName, memory.clone());
        }

        const inputTape = new Tape(`${TapeCell.BLANK_SYMBOL}${input}`);
        const outputTape = new Tape(`${TapeCell.BLANK_SYMBOL}`);
        const initialTimeline = new Timeline(
            this.initialState.name,
            inputTape,
            outputTape,
            clonedMemory
        );

        this.timelines.push(initialTimeline);
    }

    step() {
        const existingTimelines: Timeline[] = [];
        const additionalTimelines: Timeline[] = [];

        for (const timeline of this.timelines) {
            const newTimelines = this.stepTimeline(timeline);
            existingTimelines.push(...newTimelines.slice(0, 1));
            additionalTimelines.push(...newTimelines.slice(1));
        }

        this.timelines = [...existingTimelines, ...additionalTimelines];
    }

    run() {
        while (this.isThereRunningTimeLine()) {
            this.step();
        }

        return this.getAcceptedTimeline() != undefined
            ? 'accepted'
            : 'rejected';
    }

    private stepTimeline(timeline: Timeline): Timeline[] {
        const stateName = timeline.currentStateName;
        const state = this.states.get(stateName)!;
        switch (state.command) {
            case Command.SCAN:
                return this.scan(timeline, Direction.RIGHT);
            case Command.PRINT:
                return this.print(timeline);
            case Command.SCAN_LEFT:
                return this.scan(timeline, Direction.LEFT);
            case Command.SCAN_RIGHT:
                return this.scan(timeline, Direction.RIGHT);
            case Command.READ:
                return this.read(timeline);
            case Command.WRITE:
                return this.write(timeline);
            // case Command.RIGHT:
            //     right();
            //     break;
            // case Command.LEFT:
            //     left();
            //     break;
            // case Command.UP:
            //     up();
            //     break;
            // case Command.DOWN:
            //     down();
            //     break;
            // default:
            //     return this.scan(timeline, Direction.RIGHT);
        }

        return [];
    }

    private writeTransition(
        timeline: Timeline,
        command:
            | Command.SCAN
            | Command.SCAN_LEFT
            | Command.SCAN_RIGHT
            | Command.READ
    ) {
        const inputTape = timeline.getInputTape();
        const outputTape = timeline.getOutputTape();
        const memories = timeline.getMemories();
        const stateName = timeline.currentStateName;
        const state = this.states.get(stateName)!;

        if (command == Command.SCAN || command == Command.SCAN_RIGHT) {
            var symbol = inputTape.moveRight();
        } else if (command == Command.SCAN_LEFT) {
            var symbol = inputTape.moveLeft();
        } else {
            const memory = memories.get(state.memoryName!)!;
            var symbol = (<Stack | Queue>memory).pop()!;
        }

        const nextStates = state.getNextState(symbol);
        if (nextStates.length == 0) {
            timeline.setStatus(TimelineStatus.DEAD);
            return [timeline];
        }

        const newTimelines = this.createNewTimelines(nextStates, {
            inputTape,
            outputTape,
            memories,
        });

        return newTimelines;
    }

    private createNewTimelines(
        nextStates: string[],
        timeline: {
            inputTape: Tape;
            outputTape: Tape;
            memories: Map<string, Stack | Queue | Tape>;
        }
    ) {
        const newTimelines: Timeline[] = [];
        for (const nextStateName of nextStates) {
            const nextState = this.states.get(nextStateName)!;
            const newTimeline = new Timeline(
                nextState.name,
                timeline.inputTape,
                timeline.outputTape,
                timeline.memories
            );

            if (nextState.name == 'accept') {
                newTimeline.setStatus(TimelineStatus.ACCEPTED);
            } else if (nextState.name == 'reject') {
                newTimeline.setStatus(TimelineStatus.DEAD);
            }
            newTimelines.push(newTimeline);
        }

        return newTimelines;
    }

    private scan(
        timeline: Timeline,
        direction: Direction.RIGHT | Direction.LEFT
    ): Timeline[] {
        const newTimelines: Timeline[] = [];

        const inputTape = timeline.getInputTape();
        const outputTape = timeline.getOutputTape();
        const memories = timeline.getMemories();
        const stateName = timeline.currentStateName;

        const symbol =
            direction == Direction.RIGHT
                ? inputTape.moveRight()
                : inputTape.moveLeft();
        const state = this.states.get(stateName)!;

        if (state.getNextState(symbol).length == 0) {
            timeline.setStatus(TimelineStatus.DEAD);
            return [timeline];
        }

        for (const nextStateName of state.getNextState(symbol)) {
            const nextState = this.states.get(nextStateName)!;
            const newTimeline = new Timeline(
                nextState.name,
                inputTape,
                outputTape,
                memories
            );

            if (nextState.name == 'accept') {
                newTimeline.setStatus(TimelineStatus.ACCEPTED);
            } else if (nextState.name == 'reject') {
                newTimeline.setStatus(TimelineStatus.DEAD);
            }
            newTimelines.push(newTimeline);
        }

        return newTimelines;
    }

    private print(timeline: Timeline): Timeline[] {
        const newTimelines: Timeline[] = [];

        const inputTape = timeline.getInputTape();
        const outputTape = timeline.getOutputTape();
        const memories = timeline.getMemories();
        const stateName = timeline.currentStateName;

        const state = this.states.get(stateName)!;
        const printTransitions = [...state.getTransitions().entries()];

        for (const [symbolTobePrinted, nextStates] of printTransitions) {
            outputTape.write(symbolTobePrinted);
            outputTape.moveRight();

            for (const nextStateName of nextStates) {
                const nextState = this.states.get(nextStateName)!;
                const newTimeline = new Timeline(
                    nextState.name,
                    inputTape,
                    outputTape,
                    memories
                );

                if (nextState.name == 'accept') {
                    newTimeline.setStatus(TimelineStatus.ACCEPTED);
                } else if (nextState.name == 'reject') {
                    newTimeline.setStatus(TimelineStatus.DEAD);
                }
                newTimelines.push(newTimeline);
            }
        }

        return newTimelines;
    }

    private read(timeline: Timeline): Timeline[] {
        const newTimelines: Timeline[] = [];

        const inputTape = timeline.getInputTape();
        const outputTape = timeline.getOutputTape();
        const memories = timeline.getMemories();
        const stateName = timeline.currentStateName;

        const state = this.states.get(stateName)!;
        const memoryName = state.memoryName!;

        const memory = memories.get(memoryName)! as Queue | Stack;
        const symbol = memory.pop()!;

        if (state.getNextState(symbol).length == 0) {
            timeline.setStatus(TimelineStatus.DEAD);
            return [timeline];
        }

        for (const nextStateName of state.getNextState(symbol)) {
            const nextState = this.states.get(nextStateName)!;
            const newTimeline = new Timeline(
                nextState.name,
                inputTape,
                outputTape,
                memories
            );

            if (nextState.name == 'accept') {
                newTimeline.setStatus(TimelineStatus.ACCEPTED);
            } else if (nextState.name == 'reject') {
                newTimeline.setStatus(TimelineStatus.DEAD);
            }
            newTimelines.push(newTimeline);
        }

        return newTimelines;
    }

    private write(timeline: Timeline): Timeline[] {
        const newTimelines: Timeline[] = [];

        const inputTape = timeline.getInputTape();
        const outputTape = timeline.getOutputTape();
        const memories = timeline.getMemories();
        const stateName = timeline.currentStateName;

        const state = this.states.get(stateName)!;
        const memoryName = state.memoryName!;
        const memory = memories.get(memoryName)! as Queue | Stack;

        const printTransitions = [...state.getTransitions().entries()];

        for (const [symbolTobePrinted, nextStates] of printTransitions) {
            memory.push(symbolTobePrinted);

            for (const nextStateName of nextStates) {
                const nextState = this.states.get(nextStateName)!;
                const newTimeline = new Timeline(
                    nextState.name,
                    inputTape,
                    outputTape,
                    memories
                );

                if (nextState.name == 'accept') {
                    newTimeline.setStatus(TimelineStatus.ACCEPTED);
                } else if (nextState.name == 'reject') {
                    newTimeline.setStatus(TimelineStatus.DEAD);
                }
                newTimelines.push(newTimeline);
            }
        }

        return newTimelines;
    }
}
