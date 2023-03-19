import { describe, expect, test } from '@jest/globals';
import dedent from 'ts-dedent';
import Tape from '../../../lib/memory/Tape';
import TapeCell from '../../../lib/memory/TapeCell';

//#

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
            ####
            1100`);

            tape.moveLeft();
            expect(tape.toString()).toBe(dedent`
            #####
            #1100`);

            tape.moveDown();
            tape.moveDown();

            expect(tape.toString()).toBe(dedent`
            #####
            #1100
            #####`);

            tape.moveRight();
            tape.moveRight();
            tape.moveRight();
            tape.moveRight();
            tape.moveRight();

            expect(tape.toString()).toBe(dedent`
            ######
            #1100#
            ######`);
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
            ####
            1100
            ####`);
        });
    });

    describe('Tape representation', () => {
        test('The toString of the tape ', () => {
            const tape = new Tape('1100');
            expect(tape.toString()).toBe('1100');
        });
    });

    describe('Deep clone of Tape memory', () => {
        const tape = new Tape('10010');
        tape.moveRight();

        const newTape = tape.clone();

        expect(newTape.currentSymbol).toBe('0');

        newTape.moveRight();
        newTape.moveRight();

        expect(newTape.currentSymbol).toBe('1');
        expect(tape.currentSymbol).toBe('0');

        newTape.moveDown();

        const newerTape = newTape.clone();
        newerTape.moveUp();
        newerTape.write('A');

        newTape.moveDown();
        tape.moveUp();
        tape.moveUp();
        tape.moveUp();

        expect(tape.toString()).toBe(dedent`
        #####
        #####
        #####
        10010`);

        expect(newTape.toString()).toBe(dedent`
        10010
        #####
        #####`);

        expect(newerTape.toString()).toBe(dedent`
        100A0
        #####`);

        expect(newerTape.currentSymbol).toBe('A');
    });
});

// const tape = new Tape('ABCD');
// tape.moveRight();
// tape.moveRight();

// tape.toString();
