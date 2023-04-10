import clsx from 'clsx';
import { memo } from 'react';
import Queue from '../../lib/memory/Queue';
import Stack from '../../lib/memory/Stack';
import Tape from '../../lib/memory/Tape';
import TapeCell from '../../lib/memory/TapeCell';
// import TapeView from './TapeView';

type MemoryViewProps = {
    memories: Map<string, Tape | Stack | Queue>;
    inputTape: Tape;
    outputTape: Tape;
};

type TapeViewProps = {
    tape: Tape;
};

type StackQueueViewProps = {
    stackOrQueue: Stack | Queue;
};

function MemoryView({ memories, inputTape, outputTape }: MemoryViewProps) {
    const memoriesArr = [...memories.entries()];
    return (
        <div className="z-20 flex w-full flex-col gap-2 font-mono text-xl">
            <div className="overflow-x-auto border p-2 text-center">
                <div>Input Tape</div>
                <TapeView tape={inputTape} />
            </div>
            <div className="overflow-x-auto border p-2 text-center">
                <div>Output Tape</div>
                <TapeView tape={outputTape} />
            </div>
            {memoriesArr.map(([memoryName, memory]) => {
                if (memory instanceof Tape) {
                    return (
                        <div
                            key={memoryName}
                            className="overflow-x-auto border p-2 text-center"
                        >
                            <div>Tape: {memoryName}</div>
                            <TapeView tape={memory} />
                        </div>
                    );
                } else {
                    return (
                        <div
                            key={memoryName}
                            className="overflow-x-auto border p-2 text-center"
                        >
                            <div>
                                {memory instanceof Stack ? 'Stack' : 'Queue'}:{' '}
                                {memoryName}
                            </div>
                            <StackQueueView stackOrQueue={memory} />
                        </div>
                    );
                }
            })}
        </div>
    );
}

function TapeView({ tape }: TapeViewProps) {
    const tapeRows = tape.getCellRows();

    return (
        <div>
            {tapeRows.map((row) => {
                return (
                    <div>
                        {row.map((cell: TapeCell) => (
                            <span
                                className={clsx(
                                    '',
                                    cell == tape.currentCell &&
                                        'bg-teal-100 font-bold text-red-500'
                                )}
                            >
                                {cell.symbol}
                            </span>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

function StackQueueView({ stackOrQueue }: StackQueueViewProps) {
    const memory = stackOrQueue.clone();
    const isStack = stackOrQueue instanceof Stack;

    const stack = memory.toArray();
    const headPosition = isStack ? memory.length - 1 : 0;

    return (
        <div>
            {stack.map((elem, index) => {
                return (
                    <span
                        className={clsx(
                            '',
                            index == headPosition &&
                                'bg-teal-100 font-bold text-red-500'
                        )}
                    >
                        {elem}
                    </span>
                );
            })}
        </div>
    );
}

export default MemoryView;
