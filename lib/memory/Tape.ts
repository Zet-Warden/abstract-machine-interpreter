import Directions from '../utils/Direction';
import TapeCell from './TapeCell';

class Tape {
    private currentCell: TapeCell;

    constructor(input: string | TapeCell) {
        if (typeof input != 'string' && input instanceof TapeCell) {
            this.currentCell = input;
        } else {
            const symbols = input.trim().split('');
            //assign a TapeCell to each symbol
            let prevTapeCell: TapeCell;
            symbols.forEach((symbol) => {
                const newTapeCell = new TapeCell(symbol);
                if (this.currentCell == undefined) {
                    this.currentCell = newTapeCell;
                } else {
                    // prevTapeCell.joinRight(initTapeCell);
                    newTapeCell.joinLeft(prevTapeCell);
                }
                prevTapeCell = newTapeCell;
            });
        }
    }

    get currentSymbol(): string {
        return this.currentCell.symbol;
    }

    moveLeft(): string {
        return this.move(Directions.LEFT);
    }

    moveRight(): string {
        return this.move(Directions.RIGHT);
    }

    moveUp(): string {
        return this.move(Directions.UP);
    }

    moveDown(): string {
        return this.move(Directions.DOWN);
    }

    move(direction: Directions): string {
        // property of a TapeCell that determines the opposite Cell from the direction the tape is moving
        // e.g. if the tape is moving at Directions.LEFT
        //      then the previous cell must be located at TapeCell[oppositeDirection]
        const getOppositeDirection = (direction: Directions) => {
            switch (direction) {
                case Directions.LEFT:
                    return Directions.RIGHT;
                case Directions.RIGHT:
                    return Directions.LEFT;
                case Directions.UP:
                    return Directions.DOWN;
                case Directions.DOWN:
                    return Directions.UP;
            }
        };

        const oppositeDirection = getOppositeDirection(direction);
        let prevCell = this.currentCell;
        this.currentCell = prevCell[direction];

        if (this.currentCell != undefined) return this.currentCell.symbol;

        /**
         * when currentCell is undefined it means that there are holes in the tape
         * fill in the rest of the space with blank symbols
         * ensure the tape is always a solid quadrilateral of tape cells
         */

        this.currentCell = new TapeCell();
        //after moving, the prev cell is located at the opposite direction that the tape just moved from
        //e.g. moving to the left means that the prevCell is located at the right of the now currentCell
        this.currentCell.join(prevCell, oppositeDirection);

        const directionsToCheck =
            direction == Directions.LEFT || direction == Directions.RIGHT
                ? [Directions.UP, Directions.DOWN]
                : [Directions.LEFT, Directions.RIGHT];

        directionsToCheck.forEach((checkDirection) => {
            let prevCell = this.currentCell[oppositeDirection];

            //continue to fill block while not at edge of the tape
            while (prevCell[checkDirection] != undefined) {
                const newCell = new TapeCell();
                newCell.join(prevCell[checkDirection], oppositeDirection);
                newCell.join(
                    prevCell[direction],
                    getOppositeDirection(checkDirection)
                );

                prevCell = newCell[oppositeDirection];
            }
        });

        return this.currentCell.symbol;
    }

    private moveToLeftMostCell(currentCell: TapeCell): TapeCell {
        if (currentCell.left == undefined) return currentCell;
        return this.moveToLeftMostCell(currentCell.left);
    }

    private moveToTopMostCell(currentCell: TapeCell): TapeCell {
        if (currentCell.up == undefined) return currentCell;
        return this.moveToTopMostCell(currentCell.up);
    }

    private getStartingCell() {
        // console.log(this.#currentCell);
        const leftMostCell = this.moveToLeftMostCell(this.currentCell);
        const startingCell = this.moveToTopMostCell(leftMostCell);

        return startingCell;
    }

    write(symbol: string) {
        this.currentCell.write(symbol);
        return this.currentSymbol;
    }

    toString(): string {
        const startingCell = this.getStartingCell();
        let string = '';

        let currentCell = startingCell;

        //go top to bottom then go left to right,
        while (currentCell != undefined) {
            const leftMostCell = currentCell;
            while (currentCell != undefined) {
                string += currentCell.symbol;
                currentCell = currentCell.right;
            }
            string += '\n';
            currentCell = leftMostCell.down;
        }

        //remove trailing \n
        return string.trim();
    }

    clone() {
        //checks if the cell has been cloned
        const visitedCells = new Set<TapeCell>();

        //checks if the a cell from the original tape already has a copy
        //if so we reference that copy instead of cloning the TapeCell again
        const mappedCells = new Map<TapeCell, TapeCell>();

        const initCell = _clone(this.currentCell);
        return new Tape(initCell!);

        function _clone(cell: TapeCell) {
            if (cell == undefined) return;
            if (visitedCells.has(cell)) return;

            let newCell: TapeCell;

            if (mappedCells.has(cell)) {
                newCell = mappedCells.get(cell)!;
            } else {
                newCell = new TapeCell(cell.symbol);
                mappedCells.set(cell, newCell);
            }

            const directions = [
                Directions.LEFT,
                Directions.RIGHT,
                Directions.UP,
                Directions.DOWN,
            ];

            directions.forEach((direction) => {
                if (cell[direction] != undefined) {
                    if (mappedCells.has(cell[direction])) {
                        newCell.join(
                            mappedCells.get(cell[direction])!,
                            direction
                        );
                    } else {
                        const connectedCell = new TapeCell(
                            cell[direction].symbol
                        );
                        newCell.join(connectedCell, direction);
                        mappedCells.set(cell[direction], connectedCell);
                    }
                }
            });

            visitedCells.add(cell);

            _clone(cell.left);
            _clone(cell.up);
            _clone(cell.right);
            _clone(cell.down);

            return newCell!;
        }
    }
}

export default Tape;
