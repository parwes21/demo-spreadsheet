import React, { useState, useEffect } from 'react';

const initialVal = Array.from({ length: 10 }, () => Array(10).fill(''));

function Spreadsheet() {
  const [grid, setGrid] = useState(initialVal);
  const [selectedRange, setSelectedRange] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [boldCells, setBoldCells] = useState(new Set());


  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'c') {
          handleCopy();
        } else if (event.key === 'v') {
          handlePaste();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRange, clipboard]);

  function addRow() {
    setGrid([...grid, Array(grid[0].length).fill('')]);
  }

  function addColumn() {
    setGrid(grid.map(row => [...row, '']));
  }

  function handleCellChange(row, col, value) {
    const newGrid = [...grid];
    newGrid[row][col] = value;
    setGrid(newGrid);
  }

  function handleSave() {
    const json = JSON.stringify(grid);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.json';
    a.click();
    a.remove();
  }

  function columnIndexToLetter(index) {
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  }

  function handleMouseDown(row, col) {
    setSelectedRange({ start: { row, col }, end: { row, col } });
  }

  function handleMouseOver(row, col) {
    if (selectedRange) {
      setSelectedRange({ ...selectedRange, end: { row, col } });
    }
  }

  function handleMouseUp() {
    if (selectedRange) {
      console.log('Selected Range:', selectedRange);
    }
  }

  function handleCopy() {
    if (!selectedRange) return;
    const { start, end } = selectedRange;
    const copiedData = grid.slice(start.row, end.row + 1).map(row => row.slice(start.col, end.col + 1));
    setClipboard(copiedData);
  }

  function handlePaste() {
    if (!clipboard.length || !selectedRange) return;
    const { start } = selectedRange;
    const newGrid = [...grid];
    clipboard.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (newGrid[start.row + rowIndex] && newGrid[start.row + rowIndex][start.col + colIndex] !== undefined) {
          newGrid[start.row + rowIndex][start.col + colIndex] = cell;
        }
      });
    });
    setGrid(newGrid);
  }

  function calculateFormula(value) {
    if (!value.startsWith('=')) return value;
    try {
      if (value.startsWith('=SUM(')) {
        const match = value.match(/=SUM\((.*)\)/);
        if (!match) return value;
        const range = match[1];
        const [startCell, endCell] = range.split(':');
        const [startCol, startRow] = [startCell.charCodeAt(0) - 65, parseInt(startCell.slice(1)) - 1];
        const [endCol, endRow] = [endCell.charCodeAt(0) - 65, parseInt(endCell.slice(1)) - 1];
        const numbers = [];
        for (let i = startRow; i <= endRow; i++) {
          for (let j = startCol; j <= endCol; j++) {
            const num = parseFloat(grid[i][j]);
            if (!isNaN(num)) numbers.push(num);
          }
        }
        return numbers.reduce((a, b) => a + b, 0);
      }
    } catch {
      return value;
    }
  }
 

  function toggleBold() {
    if (!selectedRange) return;
    const { start, end } = selectedRange;
    const newBoldCells = new Set(boldCells);
    for (let i = Math.min(start.row, end.row); i <= Math.max(start.row, end.row); i++) {
      for (let j = Math.min(start.col, end.col); j <= Math.max(start.col, end.col); j++) {
        const cellKey = `${i}-${j}`;
        if (newBoldCells.has(cellKey)) {
          newBoldCells.delete(cellKey);
        } else {
          newBoldCells.add(cellKey);
        }
      }
    }
    setBoldCells(newBoldCells);
  }

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={addRow}>Add Row</button>
        <button onClick={addColumn}>Add Column</button>
        <button onClick={handleSave}>Save</button>
        <button onClick={toggleBold}>Bold</button>

        {/* <button onClick={handleCopy}>Copy</button>
        <button onClick={handlePaste}>Paste</button> */}
      </div>
      <table border="1">
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: grid[0].length }, (_, i) => (
              <th key={i}>{columnIndexToLetter(i)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>{rowIndex + 1}</td>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  style={{ padding: '2px', minWidth: '90px', backgroundColor: selectedRange && rowIndex >= selectedRange.start.row && rowIndex <= selectedRange.end.row && colIndex >= selectedRange.start.col && colIndex <= selectedRange.end.col ? 'lightblue' : 'transparent' }}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                >
                  <input
                    type="text"
                    value={calculateFormula(cell)}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    style={{
                      width: '80px',
                      textAlign: 'center',
                      fontWeight: boldCells.has(`${rowIndex}-${colIndex}`) ? 'bold' : 'normal',
                    }}
                    
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Spreadsheet;
