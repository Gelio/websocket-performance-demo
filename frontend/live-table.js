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
      Array.from({ length: tableSize.width }).map(() => ({
        value: 0,
        dirty: true,
        recentlyUpdated: false,
      }))
    );
  }

  /**
   *
   * @param {{ row: number, column: number, value: number }} updateData
   */
  setState(updateData) {
    const cellState = this._state[updateData.row][updateData.column];
    cellState.value = updateData.value;
    cellState.dirty = true;
  }

  refreshCells() {
    this._cells.forEach((row, rowIndex) => {
      const rowState = this._state[rowIndex];

      row.forEach((cell, cellIndex) => {
        const cellState = rowState[cellIndex];

        if (cellState.dirty) {
          cell.innerText = cellState.value;
          cell.classList.add('hot');
          cellState.dirty = false;
          cellState.recentlyUpdated = true;
        } else if (cellState.recentlyUpdated) {
          cellState.recentlyUpdated = false;
          cell.classList.remove('hot');
        }
      });
    });
  }
}
