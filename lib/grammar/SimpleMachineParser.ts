import Command from '../utils/Command';

export class SimpleMachineParser {
    private content: string;

    constructor() {
        this.content = '';
    }

    getContent() {
        return this.content;
    }

    setContent(content: string) {
        this.content = this.removeComments(content);
    }

    getMemoryDeclarations() {
        // const lines = this.content.split('\n');
        const lines = this.getLines();
        const dataIndex = lines.findIndex((line) => line == '.DATA');
        const logicIndex = lines.findIndex((line) => line == '.LOGIC');

        const linesOfDataSection = lines
            .slice(dataIndex + 1, logicIndex)
            .filter((line) => !/^\s*$/.test(line));

        const memoryDeclarations = [];
        for (const line of linesOfDataSection) {
            if (!this.isValidMemoryDeclaration(line)) continue;

            const tokens = line.split(/\s+/);
            memoryDeclarations.push({
                memory: tokens[0],
                memoryName: tokens[1],
            });
        }
        return memoryDeclarations;
    }

    getLogicDeclarations() {
        // const lines = this.content.split('\n');
        const lines = this.getLines();
        const logicIndex = lines.findIndex((line) => line == '.LOGIC');

        const linesOfLogicSection = lines
            .slice(logicIndex + 1)
            .filter((line) => !/^\s*$/.test(line));

        const logicDeclarations = [];
        for (const line of linesOfLogicSection) {
            if (!this.isValidLogicDeclaration(line)) {
                console.log('invalid', line);
                continue;
            }

            const tokens = line.split(/\s*,\s+|\s+/);
            const startOfTransitionTokens = /^LEFT$|^RIGHT$/.test(tokens[2])
                ? 3
                : 2;
            const command =
                startOfTransitionTokens == 3
                    ? `${tokens[1]}_${tokens[2]}`
                    : tokens[1];
            const commandName = command.split('(')[0] ?? command;
            const memoryName = command.split('(')[1]?.replaceAll(')', '');

            const transitionTokens = tokens.slice(startOfTransitionTokens);
            const transitions = transitionTokens.map((token) =>
                token.replaceAll(/\(|\)/g, '').split(',')
            );

            logicDeclarations.push({
                stateName: tokens[0].replace(']', ''),
                command: {
                    commandName: commandName,
                    memoryName: memoryName,
                },
                transitions: transitions,
            });
        }

        return logicDeclarations;
    }

    getLines() {
        const lines = this.content.split('\n');
        return lines.map((line) => line.trim());
    }

    removeComments(content: string) {
        return content.replaceAll(/\/\/.*/g, '');
    }

    isValidMemoryDeclaration(line: string) {
        const tokens = line.split(/\s+/);
        if (tokens.length != 2) return false;

        const isMemoryDefinitionCorrect =
            /^STACK$|^QUEUE$|^TAPE$|^2D_TAPE$/.test(tokens[0]);
        const isMemoryNameCorrect = /^\w+$/.test(tokens[1]);

        return isMemoryDefinitionCorrect && isMemoryNameCorrect;
    }

    isValidLogicDeclaration(line: string) {
        const tokens = line.split(/\s*,\s+|\s+/);
        const startOfTransitionTokens = /^LEFT$|^RIGHT$/.test(tokens[2])
            ? 3
            : 2;

        const transitionTokens = tokens.slice(startOfTransitionTokens);
        const command =
            startOfTransitionTokens == 3
                ? `${tokens[1]} ${tokens[2]}`
                : tokens[1];

        const isValidStateName = /^\w+]$/.test(tokens[0]);
        const isValidCommand =
            /^SCAN$|^PRINT$|^SCAN RIGHT$|^SCAN LEFT$|^READ\(\w+\)$|^WRITE\(\w+\)$|^RIGHT\(\w+\)$|^LEFT\(\w+\)$|^UP\(\w+\)$|^DOWN\(\w+\)$/.test(
                command
            );

        const isValidTransitions =
            transitionTokens.length == 0 ||
            transitionTokens.every((token) =>
                /^\(.+(\/\w+)?,\w+\)$/.test(token)
            );

        console.log(transitionTokens);
        console.log(isValidStateName, isValidCommand, isValidTransitions);
        return isValidStateName && isValidCommand && isValidTransitions;
    }

    getStateLineNumber(stateName: string) {
        const lines = this.content.split('\n');

        for (const [index, line] of lines.entries()) {
            const tokens = line.split(/\s*,\s+|\s+/);
            if (tokens[0] == `${stateName}]`) return index;
        }

        return -1;
    }
}
