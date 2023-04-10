import { SimpleMachineParser } from '../../../lib/grammar/SimpleMachineParser';
import dedent from 'ts-dedent';

describe('SimpleMachineParser Test', () => {
    it('should remove comments', () => {
        const parser = new SimpleMachineParser();

        parser.setContent("//Hello World!\nconsole.log('Hello World!');");
        expect(parser.getContent()).toEqual("\nconsole.log('Hello World!');");
    });

    it('should get memory declarations', () => {
        const parser = new SimpleMachineParser();

        parser.setContent(dedent`
            //Hello World

            .DATA
            STACK S1
            QUEUE Q1

            .LOGIC
            A] SCAN (1,B)
            B] PRINT (1,A)
        `);

        expect(parser.getMemoryDeclarations()).toEqual([
            { memory: 'STACK', memoryName: 'S1' },
            { memory: 'QUEUE', memoryName: 'Q1' },
        ]);
    });

    it('should get logic declarations', () => {
        const parser = new SimpleMachineParser();

        parser.setContent(dedent`
            //Hello World

            .DATA
            STACK S1
            QUEUE Q1

            .LOGIC
            A] SCAN (1,B) (1,C)
            B] SCAN LEFT (1,A)
        `);

        // console.log(parser.getLogicDeclarations());
        expect(parser.getLogicDeclarations()).toEqual([
            {
                stateName: 'A',
                command: 'SCAN',
                transitions: [
                    ['1', 'B'],
                    ['1', 'C'],
                ],
            },
            {
                stateName: 'B',
                command: 'SCAN LEFT',
                transitions: [['1', 'A']],
            },
        ]);
    });
});
