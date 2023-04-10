import Machine from '../../lib/Machine';
import Stack from '../../lib/memory/Stack';
import Tape from '../../lib/memory/Tape';
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

    it('should handle 1D turing machine', () => {
        //turing machine that accepts a^n b^m c^m d^n
        const machine = new Machine();

        const A = new State('A', Command.RIGHT, 't1');
        const B = new State('B', Command.RIGHT, 't1');
        const C = new State('C', Command.RIGHT, 't1');
        const D = new State('D', Command.LEFT, 't1');
        const E = new State('E', Command.LEFT, 't1');
        const F = new State('F', Command.RIGHT, 't1');
        const G = new State('G', Command.RIGHT, 't1');
        const H = new State('H', Command.LEFT, 't1');
        const I = new State('I', Command.LEFT, 't1');
        const J = new State('J', Command.RIGHT, 't1');
        const accept = new State('accept');

        A.addTransition('a/#', 'B');

        B.addTransition('a/a', 'B');
        B.addTransition('b/b', 'B');
        B.addTransition('c/c', 'B');
        B.addTransition('d/d', 'C');

        C.addTransition('d/d', 'C');
        C.addTransition('#/#', 'D');

        D.addTransition('d/#', 'E');

        E.addTransition('a/a', 'E');
        E.addTransition('b/b', 'E');
        E.addTransition('c/c', 'E');
        E.addTransition('d/d', 'E');
        E.addTransition('#/#', 'F');

        F.addTransition('a/#', 'B');
        F.addTransition('b/#', 'G');

        G.addTransition('b/b', 'G');
        G.addTransition('c/c', 'G');
        G.addTransition('#/#', 'H');

        H.addTransition('c/#', 'I');

        I.addTransition('b/b', 'I');
        I.addTransition('c/c', 'I');
        I.addTransition('#/#', 'J');

        J.addTransition('b/#', 'G');
        J.addTransition('#/#', 'accept');

        const tape = new Tape('#aaabbbbccccddd');
        machine.addMemory('t1', tape);

        machine.addState(A);
        machine.addState(B);
        machine.addState(C);
        machine.addState(D);
        machine.addState(E);
        machine.addState(F);
        machine.addState(G);
        machine.addState(H);
        machine.addState(I);
        machine.addState(J);
        machine.addState(accept);

        machine.start();
        const result = machine.run();

        // expect(result).toEqual('accepted');
        // console.log(machine.timelines[0].getMemories().get('t1')!.toString());
        expect(result).toEqual('accepted');
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

        describe('Problem set #3', () => {
            describe('#1', () => {
                const machine = new Machine();

                const A = new State('A', Command.RIGHT, 't1');
                const B = new State('B', Command.RIGHT, 't1');
                const C = new State('C', Command.LEFT, 't1');
                const D = new State('D', Command.RIGHT, 't1');
                const E = new State('E', Command.RIGHT, 't1');
                const F = new State('F', Command.RIGHT, 't1');
                const G = new State('G', Command.LEFT, 't1');
                const H = new State('H', Command.LEFT, 't1');
                const J = new State('J', Command.LEFT, 't1');
                const K = new State('K', Command.RIGHT, 't1');
                const L = new State('L', Command.RIGHT, 't1');
                const M = new State('M', Command.LEFT, 't1');
                const N = new State('N', Command.LEFT, 't1');
                const O = new State('O', Command.LEFT, 't1');
                const accept = new State('accept');

                A.addTransition('X/X', 'A');
                A.addTransition('1/X', 'B');
                A.addTransition('#/1', 'J');

                B.addTransition('1/1', 'B');
                B.addTransition('#/#', 'C');

                C.addTransition('1/1', 'C');
                C.addTransition('X/X', 'C');
                C.addTransition('Y/Y', 'C');
                C.addTransition('Z/Z', 'C');
                C.addTransition('#/#', 'D');

                D.addTransition('Y/Y', 'D');
                D.addTransition('Z/Z', 'D');
                D.addTransition('X/Y', 'E');
                D.addTransition('1/Z', 'E');
                D.addTransition('#/#', 'H');

                E.addTransition('1/1', 'E');
                E.addTransition('X/X', 'E');
                E.addTransition('Y/Y', 'E');
                E.addTransition('Z/Z', 'E');
                E.addTransition('#/#', 'F');

                F.addTransition('1/1', 'F');
                F.addTransition('#/1', 'G');

                G.addTransition('1/1', 'G');
                G.addTransition('#/#', 'C');

                H.addTransition('Y/X', 'H');
                H.addTransition('Z/1', 'H');
                H.addTransition('#/#', 'A');

                J.addTransition('X/X', 'J');
                J.addTransition('1/1', 'J');
                J.addTransition('#/#', 'K');

                K.addTransition('1/1', 'K');
                K.addTransition('X/1', 'L');
                K.addTransition('#/#', 'N');

                L.addTransition('X/X', 'L');
                L.addTransition('1/1', 'L');
                L.addTransition('#/#', 'M');

                M.addTransition('1/#', 'J');

                N.addTransition('1/#', 'O');

                O.addTransition('1/1', 'O');
                O.addTransition('#/#', 'accept');

                machine.addState(A);
                machine.addState(B);
                machine.addState(C);
                machine.addState(D);
                machine.addState(E);
                machine.addState(F);
                machine.addState(G);
                machine.addState(H);
                machine.addState(J);
                machine.addState(K);
                machine.addState(L);
                machine.addState(M);
                machine.addState(N);
                machine.addState(O);
                machine.addState(accept);

                const tape = new Tape('#11');
                machine.addMemory('t1', tape);

                machine.start();
                machine.run();

                // console.log(
                //     machine.timelines[0].getMemories().get('t1')!.toString()
                // );
                expect(
                    machine.timelines[0]
                        .getMemories()
                        .get('t1')!
                        .toString({ printBlank: false })
                ).toEqual('1111');
            });

            describe('#2', () => {
                const machine = new Machine();

                const A = new State('A', Command.RIGHT, 't1');
                const B = new State('B', Command.RIGHT, 't1');
                const C = new State('C', Command.LEFT, 't1');
                const D = new State('D', Command.RIGHT, 't1');
                const E = new State('E', Command.LEFT, 't1');
                const F = new State('F', Command.RIGHT, 't1');
                const accept = new State('accept');

                const G = new State('G', Command.RIGHT, 't1');
                const H = new State('H', Command.RIGHT, 't1');

                A.addTransition('X/X', 'A');
                A.addTransition('a/X', 'B');
                A.addTransition('Y/Y', 'G');
                A.addTransition('#/#', 'accept');

                B.addTransition('a/a', 'B');
                B.addTransition('Y/Y', 'B');
                B.addTransition('b/Y', 'C');

                C.addTransition('a/a', 'C');
                C.addTransition('X/X', 'C');
                C.addTransition('Y/Y', 'C');
                C.addTransition('#', 'A');

                D.addTransition('Y/Y', 'D');
                D.addTransition('Z/Z', 'D');
                D.addTransition('c/Z', 'E');

                E.addTransition('b/b', 'E');
                E.addTransition('Z/Z', 'E');
                E.addTransition('Y/Y', 'E');
                E.addTransition('X/X', 'F');

                F.addTransition('b/b', 'F');
                F.addTransition('Y/b', 'D');
                F.addTransition('Z/Z', 'H');

                G.addTransition('Y/Y', 'G');
                G.addTransition('c/c', 'E');

                H.addTransition('Z/Z', 'H');
                H.addTransition('#/#', 'accept');

                const tape = new Tape('#aaabbbccc');
                machine.addMemory('t1', tape);

                machine.addState(A);
                machine.addState(B);
                machine.addState(C);
                machine.addState(D);
                machine.addState(E);
                machine.addState(F);
                machine.addState(accept);

                machine.addState(G);
                machine.addState(H);

                machine.start('#aaabbbccc');
                const result = machine.run();

                // console.log(result);
                // console.log(
                //     machine.timelines[0].getMemories().get('t1')!.toString()
                // );
            });
        });
    });
});
