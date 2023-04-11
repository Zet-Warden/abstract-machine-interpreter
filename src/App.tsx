import React, { useRef, useState } from 'react';
import { SimpleMachineParser } from '../lib/grammar/SimpleMachineParser';
import Machine from '../lib/Machine';
import Queue from '../lib/memory/Queue';
import Stack from '../lib/memory/Stack';
import Tape from '../lib/memory/Tape';
import TapeCell from '../lib/memory/TapeCell';
import State from '../lib/State';
import Command from '../lib/utils/Command';
import TimelineStatus from '../lib/utils/TimelineStatus';
import ControlButton from './components/ControlButton';
import MemoryView from './components/MemoryView';
import TextEditor from './components/TextEditor';
import useMachine from './hooks/useMachine';

const parser = new SimpleMachineParser();

function initMachine(machine: Machine, input: string) /* : Machine */ {
    // const machine = new Machine();
    const logicDeclarations = parser.getLogicDeclarations();
    const memoryDeclarations = parser.getMemoryDeclarations();

    // init memory
    for (const [
        index,
        { memoryName, memory },
    ] of memoryDeclarations.entries()) {
        const isInitialTape = index == 0;
        if (memory == 'STACK') {
            machine.addMemory(memoryName, new Stack());
        } else if (memory == 'QUEUE') {
            machine.addMemory(memoryName, new Queue());
        } else {
            const tapeInput: string = isInitialTape
                ? `${TapeCell.BLANK_SYMBOL}${input}`
                : `${TapeCell.BLANK_SYMBOL}`;
            machine.addMemory(memoryName, new Tape(tapeInput));
        }
    }

    // init states
    for (const { stateName, command } of logicDeclarations) {
        const state = new State(
            stateName,
            //@ts-ignore
            Command[command.commandName],
            command.memoryName
        );
        machine.addState(state);
    }

    // init state transitions
    for (const { stateName, transitions } of logicDeclarations) {
        transitions.forEach((transition) =>
            machine.addStateTransition(stateName, [
                transition[0],
                transition[1],
            ])
        );
    }

    console.log([...machine.states.entries()]);
    machine.start(input);
    // return machine.start(input);
}

function App() {
    const [machine, setMachine] = useMachine();

    const [inputValue, setInputValue] = useState('');
    const [selectedTimelineIndex, setSelectedTimelineIndex] = useState(0);
    const [code, setCode] = useState('');

    const isMachineInitialized = machine.getIsInitialized();

    const timelines = machine?.timelines ?? [];
    const timeline = timelines[selectedTimelineIndex];
    const memories = timeline?.getMemories() ?? new Map();
    const currentStateName = timeline?.currentStateName ?? '';
    const inputTape = timeline?.getInputTape() ?? new Tape('#');
    const outputTape = timeline?.getOutputTape() ?? new Tape('#');

    parser.setContent(code);
    const lineNumberOfCurrentState =
        parser.getStateLineNumber(currentStateName);

    console.log(lineNumberOfCurrentState);
    // console.log('timeline: ', selectedTimelineIndex);

    const handleMachineReset = () => {
        setMachine(new Machine());
        setSelectedTimelineIndex(0);
    };

    const handleStep = () => {
        if (machine != undefined) {
            machine.step();
            setMachine(machine);
        }
    };

    const handleRun = () => {
        if (machine?.isThereRunningTimeLine()) {
            handleStep();
            setTimeout(handleRun, 50);
        }
    };

    const handleCreateMachine = () => {
        initMachine(machine, inputValue);
        setMachine(machine);
    };

    const handleTimelineSelect = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedTimelineIndex(Number(event.target.value));
        // console.log(event.target.value);
    };

    return (
        <div className="container flex h-full max-h-screen flex-col justify-center px-5 py-3">
            <div className="flex h-[703px] max-h-[703px] gap-3">
                <div className="relative flex w-1/2 flex-col">
                    <div className="flex justify-between py-3">
                        <div className="relative flex w-full items-center gap-2">
                            <span className="w-full max-w-max">
                                Initial Input:
                            </span>
                            <input
                                className="h-full w-full border px-3"
                                type="text"
                                value={inputValue}
                                placeholder="Input"
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="h-full">
                        <TextEditor
                            numOfLines={28}
                            onValueChange={(value) => {
                                setCode(value);
                            }}
                            readOnly={isMachineInitialized}
                            lineNumberToHighlight={lineNumberOfCurrentState}
                        />
                    </div>
                </div>
                <div className="flex h-full w-1/2 flex-col justify-between gap-2">
                    <div className="flex">
                        <div className="flex flex-1 items-center justify-around">
                            <div className="flex w-1/2 items-center gap-2">
                                <label htmlFor="pet-select">Timeline: </label>
                                <select
                                    onChange={handleTimelineSelect}
                                    className="bg-white px-1 outline outline-1 outline-slate-200"
                                >
                                    {timelines.length == 0 ? (
                                        <option value="">N/A</option>
                                    ) : (
                                        timelines.map((timeline, index) => (
                                            <option value={index}>
                                                {index + 1}{' '}
                                                {TimelineStatus.toEmoji(
                                                    timeline.status
                                                )}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div className="w-1/2">
                                Status: {machine?.status ?? 'N/A'}
                            </div>
                        </div>
                        <div className="flex gap-5">
                            <ControlButton
                                onClick={handleMachineReset}
                                text="Reset"
                            />
                            <ControlButton
                                onClick={handleCreateMachine}
                                disabled={isMachineInitialized}
                                text="Initialize"
                            />
                            <ControlButton
                                onClick={handleStep}
                                disabled={!isMachineInitialized}
                                text="Step"
                            />
                            <ControlButton
                                onClick={handleRun}
                                disabled={!isMachineInitialized}
                                text="Run"
                            />
                        </div>
                    </div>
                    <div className="relative h-1 flex-1">
                        <div className="h-full w-full overflow-y-auto border p-3">
                            <MemoryView
                                memories={memories}
                                inputTape={inputTape}
                                outputTape={outputTape}
                            />

                            {/* <p>
                                {JSON.stringify(parser.getMemoryDeclarations())}
                            </p>
                            <br />
                            <p>
                                {JSON.stringify(parser.getLogicDeclarations())}
                            </p>
                            <br />
                            <p>{[...memories.entries()].toString()}</p> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default App;
