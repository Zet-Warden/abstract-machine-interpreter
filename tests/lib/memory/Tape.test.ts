import { describe, expect, test } from '@jest/globals';
import dedent from 'ts-dedent';
import Tape from '../../../lib/memory/Tape';

describe('Memory Tape', () => {
    describe('Moving the tape', () => {
        test('Moving the tape should land on the correct tape block', () => {
            const tape = new Tape('1100');
            tape.moveRight();
            tape.moveRight();
            expect(tape.currentSymbol).toBe('0');
        });

        test('Moving the tape towards an edge should increase tape area', () => {
            const tape = new Tape('1100');
            tape.moveUp();
            expect(tape.toString()).toBe(dedent`
            ØØØØ
            1100`);

            tape.moveLeft();
            expect(tape.toString()).toBe(dedent`
            ØØØØØ
            Ø1100`);

            tape.moveDown();
            tape.moveDown();

            expect(tape.toString()).toBe(dedent`
            ØØØØØ
            Ø1100
            ØØØØØ`);

            tape.moveRight();
            tape.moveRight();
            tape.moveRight();
            tape.moveRight();
            tape.moveRight();

            console.log(tape.toString());
            expect(tape.toString()).toBe(dedent`
            ØØØØØØ
            Ø1100Ø
            ØØØØØØ`);
        });

        test('Moving the tape inside tape area', () => {
            const tape = new Tape('1100');
            tape.moveRight();
            tape.moveLeft();
            expect(tape.toString()).toBe('1100');

            //increase area
            tape.moveUp();
            tape.moveDown();
            tape.moveDown();

            //move within the area
            tape.moveUp();
            tape.moveRight();
            tape.moveRight();
            tape.moveLeft();
            tape.moveLeft();
            tape.moveDown();

            expect(tape.toString()).toBe(dedent`
            ØØØØ
            1100
            ØØØØ`);
        });
    });

    describe('Tape representation', () => {
        test('The toString of the tape ', () => {
            const tape = new Tape('1100');
            expect(tape.toString()).toBe('1100');
        });
    });
});

// const tape = new Tape('ABCD');
// tape.moveRight();
// tape.moveRight();

// tape.toString();
