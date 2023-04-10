import clsx from 'clsx';
import { useRef, useState } from 'react';

type TextEditorProps = {
    value?: string;
    numOfLines: number;
    onValueChange: (value: string) => void;
    readOnly: boolean;
    lineNumberToHighlight: number;
};

function TextEditor({
    numOfLines,
    onValueChange,
    readOnly,
    lineNumberToHighlight,
}: TextEditorProps) {
    const [value, setValue] = useState('\n\n.DATA\n\n\n.LOGIC\n\n\n');
    const lineCounterRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const lineCount = value.split('\n').length;
    const lines = Array.from(
        //we add 1 to lineCount to create a buffer when horizontal scrollbar appears!
        {
            length: Math.max(numOfLines, lineCount + 1),
        },
        (_, i) => i + 1
    );

    const handleValueChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setValue(event.target.value);
        onValueChange(event.target.value);
    };

    const handleScroll = () => {
        if (lineCounterRef.current && textareaRef.current) {
            lineCounterRef.current.scrollTop = textareaRef.current.scrollTop;
            console.log('scrolling');
            console.log('line counter', lineCounterRef.current.scrollTop);
            console.log('text area', textareaRef.current.scrollTop);
        }
    };

    return (
        <div className="relative flex h-full w-full gap-1 overflow-hidden pl-10">
            <div
                ref={lineCounterRef}
                className="absolute left-0 mr-1 h-full w-full overflow-y-hidden border font-mono"
            >
                {lines.map((_, index) => (
                    <div
                        key={index}
                        className={clsx(
                            index == lineNumberToHighlight
                                ? 'bg-teal-100'
                                : 'bg-white'
                        )}
                    >
                        <div
                            className={clsx(
                                'relative z-10 w-[45px] overflow-x-auto bg-slate-200 px-2 text-right'
                            )}
                        >
                            {/* this hides the buffer created when we add 1 to lineCount see variable lines */}
                            <span
                                className={clsx(
                                    'bg-slate-200',
                                    index > lineCount - 1 && 'invisible',
                                    readOnly && 'cursor-default text-gray-400'
                                )}
                            >
                                {index + 1}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <textarea
                ref={textareaRef}
                className={clsx(
                    'overflow-x-overlay relative h-full w-full resize-none bg-transparent pl-3 font-mono outline-none',
                    readOnly && 'cursor-default text-gray-400'
                )}
                wrap="off"
                onChange={handleValueChange}
                onScroll={handleScroll}
                value={value}
                readOnly={readOnly}
            />
        </div>
    );
}

export default TextEditor;
