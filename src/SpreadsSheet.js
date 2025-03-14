import React, { useState } from 'react';
 
const initialVal = Array.from({ length: 10 }, () => Array(10).fill(''));

function Spreadsheet() {
  const [grid, setGrid] = useState(initialVal);

   
  function addRow() {
    setGrid([...grid, Array(grid[0].length).fill('')]);
  }
 
  function addColumn() {
    setGrid(grid.map(row => [...row, '']));
  }
 
  function handleCellChange(row, col, value) {
    console.log(row, col, value, 'row, col, value');
    
    const newGrid = [...grid];
    newGrid[row][col] = value;
    setGrid(newGrid);
  }

   
  function handleSave() {
    const json = JSON.stringify(grid);
    console.log(json);    
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
  console.log(grid, "grid")
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={addRow}>Add Row</button>
        <button onClick={addColumn}>Add Column</button>
        <button onClick={handleSave}>Save</button>
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
                <td key={colIndex}style={{ padding: '2px', minWidth: '90px' }}> 
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    style={{ width: '80px', textAlign: 'center' }}
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
