// @ts-check
export class LiveTable {
  /**
   * @param {Element} tableElement
   */
  constructor(tableElement) {
    this._tableElement = tableElement;
    this._cells = null;
    this._state = [];
  }

  createStructure(tableSize) {
    this._cells = Array.from({ length: tableSize.height }).map(() => {
      const tableRow = document.createElement('tr');
      this._tableElement.appendChild(tableRow);

      return Array.from({ length: tableSize.width }).map(() => {
        const cell = document.createElement('td');
        tableRow.appendChild(cell);

        return cell;
      });
    });

    this._state = Array.from({ length: tableSize.height }).map(() =>
      Array.from({ length: tableSize.width }).fill(0)
    );
  }

  /**
   *
   * @param {{ row: number, column: number, value: number }} updateData
   */
  setState(updateData) {
    this._state[updateData.row][updateData.column] = updateData.value;
  }

  refreshCells() {
    this._cells.forEach((row, rowIndex) => {
      const rowState = this._state[rowIndex];

      row.forEach((cell, cellIndex) => {
        cell.innerText = rowState[cellIndex];
      });
    });
  }
}
