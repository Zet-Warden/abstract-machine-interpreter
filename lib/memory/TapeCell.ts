import Directions from '../utils/Direction';
import Tape from './Tape';

export default class TapeCell {
    private _symbol: string;
    left: TapeCell;
    right: TapeCell;
    up: TapeCell;
    down: TapeCell;

    static BLANK_SYMBOL: string = 'Ø';

    constructor(symbol: string = TapeCell.BLANK_SYMBOL) {
        this._symbol = symbol;
    }

    get symbol() {
        return this._symbol;
    }

    join(tapeBlock: TapeCell, direction: Directions) {
        switch (direction) {
            case Directions.LEFT:
                this.joinLeft(tapeBlock);
                break;
            case Directions.RIGHT:
                this.joinRight(tapeBlock);
                break;
            case Directions.UP:
                this.joinUp(tapeBlock);
                break;
            case Directions.DOWN:
                this.joinDown(tapeBlock);
                break;
            default:
                throw new Error(
                    `Umatched case ${direction} for direction. Expecting "L", "R", "U", "D".`
                );
        }
    }

    write(symbol: string) {
        this._symbol = symbol;
    }

    joinLeft(tapeBlock: TapeCell) {
        this.left = tapeBlock;
        tapeBlock.right = this;
    }

    joinRight(tapeBlock: TapeCell) {
        this.right = tapeBlock;
        tapeBlock.left = this;
    }

    joinUp(tapeBlock: TapeCell) {
        this.up = tapeBlock;
        tapeBlock.down = this;
    }

    joinDown(tapeBlock: TapeCell) {
        this.down = tapeBlock;
        tapeBlock.up = this;
    }

    toString(): string {
        return this._symbol;
    }

    // clone(): TapeCell {
    //     const clonedCell = new TapeCell(this._symbol);

    //     if (this.right != undefined) clonedCell.joinRight(this.right);
    //     if (this.left != undefined) clonedCell.joinLeft(this.left);
    //     if (this.up != undefined) clonedCell.joinUp(this.up);
    //     if (this.down != undefined) clonedCell.joinDown(this.down);

    //     return clonedCell;
    // }
}
