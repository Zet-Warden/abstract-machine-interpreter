import { completeFromList } from '@codemirror/autocomplete';
import {
    indentNodeProp,
    foldInside,
    foldNodeProp,
    LRLanguage,
    LanguageSupport,
} from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import React from 'react';
// @ts-ignore
import { parser } from '../lib/grammar/lang';

let parserWithMetadata = parser.configure({
    props: [
        styleTags({
            DataHeader: t.moduleKeyword,
            LogicHeader: t.moduleKeyword,

            State: t.variableName,
            Command: t.literal,
            Transition: t.name,

            Memory: t.definitionOperator,
            MemoryName: t.variableName,

            Comment: t.lineComment,
            '( )': t.paren,
        }),
        // indentNodeProp.add({
        //     DataSection: (context) =>
        //         context.column(context.node.from) + context.unit,
        // }),
        foldNodeProp.add({
            DataSection: foldInside,
        }),
    ],
});

let exampleLanguage = LRLanguage.define({
    parser: parserWithMetadata,
    languageData: { commentTokens: { line: '//' } },
});

const exampleCompletion = exampleLanguage.data.of({
    autocomplete: completeFromList([
        { label: 'SCAN', type: 'keyword' },
        { label: 'PRINT', type: 'keyword' },
        { label: 'SCAN_RIGHT', type: 'keyword' },
        { label: 'SCAN_LEFT', type: 'keyword' },
        { label: 'READ', type: 'keyword' },
        { label: 'WRITE', type: 'keyword' },
        { label: 'RIGHT', type: 'keyword' },
        { label: 'LEFT', type: 'keyword' },
        { label: 'UP', type: 'keyword' },
        { label: 'DOWN', type: 'keyword' },
        { label: 'STACK', type: 'keyword' },
        { label: 'QUEUE', type: 'keyword' },
        { label: 'TAPE', type: 'keyword' },
        { label: '2D_TAPE', type: 'keyword' },
    ]),
});

function App() {
    const onChange = React.useCallback((value: string) => {
        console.log('value:', value);
    }, []);
    return (
        <CodeMirror
            value={'.DATA\n\n\n.LOGIC\n\n\n'}
            height="200px"
            width="300px"
            theme={vscodeDark}
            extensions={[
                new LanguageSupport(exampleLanguage, [exampleCompletion]),
            ]}
            onChange={onChange}
        />
    );
}
export default App;
