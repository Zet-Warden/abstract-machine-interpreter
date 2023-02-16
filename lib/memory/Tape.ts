import Directions from '../utils/Direction';
import TapeCell from './TapeCell';

class Tape {
    private currentCell: TapeCell;

    constructor(input: string) {
        const symbols = input.trim().split('');

        //assign a TapeCell to each symbol
        let prevTapeCell: TapeCell;
        symbols.forEach((symbol) => {
            const initTapeCell = new TapeCell(symbol);
            if (this.currentCell == undefined) {
                this.currentCell = initTapeCell;
            } else {
                // prevTapeCell.joinRight(initTapeCell);
                initTapeCell.joinLeft(prevTapeCell);
            }
            prevTapeCell = initTapeCell;
        });
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
}

export default Tape;
