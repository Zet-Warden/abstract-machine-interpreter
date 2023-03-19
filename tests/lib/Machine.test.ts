import Machine from '../../lib/Machine';
import Stack from '../../lib/memory/Stack';
import TapeCell from '../../lib/memory/TapeCell';
import State from '../../lib/State';
import Command from '../../lib/utils/Command';

describe('', () => {
    it('should be able to accept added states', () => {
        const machine = new Machine();

        const state1 = new State('A', Command.SCAN);
        const state2 = new State('B', Command.SCAN);

        machine.addState(state1);
        machine.addState(state2);

        expect(machine.getStateNames()).toEqual(['A', 'B']);
    });

    it('should be able to add transition for each state', () => {
        const machine = new Machine();

        const state1 = new State('A', Command.SCAN);
        const state2 = new State('B', Command.SCAN);

        machine.addState(state1);
        machine.addState(state2);

        machine.addStateTransition('A', ['X', 'B']);
        machine.addStateTransition('B', ['Y', 'B']);

        const state1Transitions = state1.getTransitions();

        const expectedTransition1 = new Map([['X', ['B']]]);
        expect([...state1Transitions.entries()]).toEqual([
            ...expectedTransition1.entries(),
        ]);

        state1Transitions.get('X')?.push('C');
        // should prevent accidental mutation
        expect([...state1.getTransitions().entries()]).toEqual([
            ...expectedTransition1.entries(),
        ]);
    });

    it('should handle scan states', () => {
        const machine = new Machine();
        const state1 = new State('A', Command.SCAN);
        const state2 = new State('B', Command.SCAN);

        machine.addState(state1);
        machine.addState(state2);

        machine.addStateTransition('A', ['1', 'B']);
        machine.addStateTransition('A', ['0', 'B']);

        machine.addStateTransition('B', ['1', 'A']);
        machine.addStateTransition('B', ['0', 'B']);

        machine.start('1100');

        machine.step();
        expect(machine.timelines[0].currentStateName).toEqual('B');

        machine.step();
        expect(machine.timelines[0].currentStateName).toEqual('A');

        machine.step();
        expect(machine.timelines[0].currentStateName).toEqual('B');

        machine.step();
        expect(machine.timelines[0].currentStateName).toEqual('B');

        machine.step();
        expect(machine.timelines.length).toEqual(1);
    });

    it('should handle print states', () => {
        const machine = new Machine();

        const state1 = new State('A', Command.SCAN);
        const state2 = new State('B', Command.PRINT);
        const state3 = new State('C', Command.PRINT);

        machine.addState(state1);
        machine.addState(state2);
        machine.addState(state3);

        machine.addStateTransition('A', ['1', 'B']);
        machine.addStateTransition('A', ['0', 'C']);

        machine.addStateTransition('B', ['0', 'A']);

        machine.addStateTransition('C', ['1', 'A']);

        machine.start('0011');

        while (machine.isThereRunningTimeLine()) {
            machine.step();
        }

        expect(
            machine.timelines[0]
                .getOutputTape()
                .toString()
                .replaceAll(TapeCell.BLANK_SYMBOL, '')
        ).toEqual('1100');
    });

    it('should handle nondeterminism', () => {
        const machine = new Machine();

        const state1 = new State('A', Command.SCAN);
        const state2 = new State('B', Command.PRINT);
        const state3 = new State('C', Command.PRINT);
        const state4 = new State('D', Command.SCAN);
        const state5 = new State('E', Command.SCAN);
        const state6 = new State('F', Command.PRINT);
        const state7 = new State('G', Command.PRINT);

        state1.addTransition('1', 'B');
        state1.addTransition('1', 'G');
        state1.addTransition('0', 'F');
        state1.addTransition('0', 'C');

        state2.addTransition('0', 'D');
        state3.addTransition('0', 'E');

        state4.addTransition('1', 'B');
        state4.addTransition('0', 'F');

        state5.addTransition('1', 'G');
        state5.addTransition('0', 'C');

        state6.addTransition('1', 'D');
        state7.addTransition('1', 'E');

        machine.addState(state1);
        machine.addState(state2);
        machine.addState(state3);
        machine.addState(state4);
        machine.addState(state5);
        machine.addState(state6);
        machine.addState(state7);

        machine.start('0011');

        while (machine.isThereRunningTimeLine()) {
            machine.step();
        }

        expect(
            machine.timelines[0]
                .getOutputTape()
                .toString()
                .replaceAll(TapeCell.BLANK_SYMBOL, '')
        ).toEqual('1100');

        expect(
            machine.timelines[1]
                .getOutputTape()
                .toString()
                .replaceAll(TapeCell.BLANK_SYMBOL, '')
        ).toEqual('0011');
    });

    describe('handle problem set solutions', () => {
        describe('Problem set #2', () => {
            describe('#1', () => {
                const machine = new Machine();

                const A = new State('A', Command.SCAN);
                const B = new State('B', Command.PRINT);
                const C = new State('C', Command.PRINT);
                const D = new State('D', Command.SCAN);
                const E = new State('E', Command.SCAN);
                const F = new State('F', Command.PRINT);
                const G = new State('G', Command.PRINT);
                const H = new State('H', Command.PRINT);
                const I = new State('I', Command.PRINT);

                A.addTransition('0', 'B');
                A.addTransition('1', 'C');

                B.addTransition('Y', 'D');
                C.addTransition('Y', 'E');

                D.addTransition('0', 'F');
                D.addTransition('1', 'I');

                E.addTransition('0', 'G');
                E.addTransition('1', 'H');

                F.addTransition('X', 'D');
                G.addTransition('Y', 'D');
                H.addTransition('X', 'E');
                I.addTransition('Y', 'E');

                machine.addState(A);
                machine.addState(B);
                machine.addState(C);
                machine.addState(D);
                machine.addState(E);
                machine.addState(F);
                machine.addState(G);
                machine.addState(H);
                machine.addState(I);

                test('1101101', () => {
                    machine.start('1101101');
                    machine.run();
                    expect(
                        machine.timelines[0]
                            .getOutputTape()
                            .toString({ printBlank: false })
                    ).toEqual('YXYYXYY');
                });

                test('000111', () => {
                    machine.start('000111');
                    machine.run();
                    expect(
                        machine.timelines[0]
                            .getOutputTape()
                            .toString({ printBlank: false })
                    ).toEqual('YXXYXX');
                });

                test('10101', () => {
                    machine.start('10011');
                    machine.run();
                    expect(
                        machine.timelines[0]
                            .getOutputTape()
                            .toString({ printBlank: false })
                    ).toEqual('YYXYX');
                });
            });

            describe('#2', () => {
                const machine = new Machine();

                const A = new State('A', Command.SCAN_RIGHT);
                const B = new State('B', Command.PRINT);
                const C = new State('C', Command.SCAN_LEFT);
                const D = new State('D', Command.SCAN_RIGHT);
                const E = new State('E', Command.PRINT);

                A.addTransition('1', 'A');
                A.addTransition('0', 'B');
                D;
                A.addTransition('#', 'C');

                B.addTransition('0', 'A');

                C.addTransition('0', 'C');
                C.addTransition('1', 'C');
                C.addTransition('#', 'D');

                D.addTransition('0', 'D');
                D.addTransition('1', 'E');

                E.addTransition('1', 'D');

                machine.addState(A);
                machine.addState(B);
                machine.addState(C);
                machine.addState(D);
                machine.addState(E);

                test('00100', () => {
                    machine.start('00100');
                    machine.run();

                    expect(
                        machine.timelines[0]
                            .getOutputTape()
                            .toString({ printBlank: false })
                    ).toEqual('00001');
                });

                test('110011', () => {
                    machine.start('110011');
                    machine.run();

                    expect(
                        machine.timelines[0]
                            .getOutputTape()
                            .toString({ printBlank: false })
                    ).toEqual('001111');
                });

                test('10101', () => {
                    machine.start('10101');
                    machine.run();

                    expect(
                        machine.timelines[0]
                            .getOutputTape()
                            .toString({ printBlank: false })
                    ).toEqual('00111');
                });
            });

            describe('#3', () => {
                const machine = new Machine();
                const stack = new Stack();

                const A = new State('A', Command.WRITE, 's1');
                const B = new State('B', Command.SCAN);
                const C = new State('C', Command.SCAN);
                const D = new State('D', Command.SCAN);
                const E = new State('E', Command.WRITE, 's1');
                const F = new State('F', Command.SCAN);
                const G = new State('G', Command.READ, 's1');
                const H = new State('H', Command.SCAN);
                const I = new State('I', Command.READ, 's1');
                const accept = new State('accept');

                A.addTransition('#', 'B');

                B.addTransition('0', 'C');
                B.addTransition('1', 'F');
                B.addTransition('#', 'I');

                C.addTransition('0', 'D');
                D.addTransition('1', 'E');
                E.addTransition('X', 'B');

                F.addTransition('0', 'G');
                G.addTransition('X', 'H');
                H.addTransition('1', 'F');

                H.addTransition('#', 'I');
                I.addTransition('#', 'accept');

                machine.addMemory('s1', stack.clone());

                machine.addState(A);
                machine.addState(B);
                machine.addState(C);
                machine.addState(D);
                machine.addState(E);
                machine.addState(F);
                machine.addState(G);
                machine.addState(H);
                machine.addState(I);
                machine.addState(accept);

                test('00110', () => {
                    machine.start('00110');
                    const result = machine.run();
                    expect(result).toEqual('accepted');
                });

                test('', () => {
                    machine.start('');
                    const result = machine.run();
                    expect(result).toEqual('accepted');
                });

                test('0010011010', () => {
                    machine.start('0010011010');
                    const result = machine.run();
                    expect(result).toEqual('accepted');
                });

                test('010010', () => {
                    machine.start('010010');
                    const result = machine.run();
                    expect(result).toEqual('rejected');
                });

                test('0', () => {
                    machine.start('0');
                    const result = machine.run();
                    expect(result).toEqual('rejected');
                });

                test('110', () => {
                    machine.start('110');
                    const result = machine.run();
                    expect(result).toEqual('rejected');
                });
            });
        });
    });
});
