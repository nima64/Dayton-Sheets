function updateGrid(sheet) {
    const gridContainer = document.getElementById('product-grid');

    // Clear existing grid
    let cells = gridContainer.querySelectorAll('.grid-cell');
    if (cells) {
        cells.forEach(cell => {
            cell.remove();
        });
    };

    sheet.forEach(row => {
        const rowId = row.rowId;

        gridContainer.insertAdjacentHTML('beforeend', `
            <div class="grid-cell">${row.make}</div>
            <div class="grid-cell">${row.model}</div>
            <div class="grid-cell">${row.config}</div>
            <div class="grid-cell">
              <input class="grid-input" type="text" data-row-id="${rowId}" data-col="price" value="${row.price}">
            </div>
            <div class="grid-cell">
              <input class="grid-input" type="text" data-row-id="${rowId}" data-col="qty" value="${row.qty}">
            </div>
            `);
    });

    gridContainer.querySelectorAll('.grid-input').forEach(input => {
        input.addEventListener('keyup', e => {
            const target = e.target;
            const rowId = target.dataset.rowId;
            const col = target.dataset.col;
            const value = target.value.trim();
            dirtyCells.set(`${rowId}|${col}`, { rowId, col, value });
            console.log(`Edited ${rowId} / ${col} = ${value}`);
        });
    });
}

const dirtyCells = new Map();
// let sheetData = {};

const queries = 'user=seller2';

fetch(`/api/sheet?${queries}`)
    .then(res => res.json())
    .then(({ sheet }) => {
        // let rowIndex = 0;
        updateGrid(sheet);
    });




// 3. Every 5 seconds, send batched changes to backend
setInterval(() => {
    if (dirtyCells.size === 0) return;

    const updates = Array.from(dirtyCells.values());
    console.log('Sending batch update:', updates);

    fetch(`/api/sheet/batch-update?${queries}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            op: 'batch_update',
            data: { updates }
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log('Update success:', data);
            dirtyCells.clear();
        })
        .catch(err => {
            console.error('Update failed:', err);
        });
}, 5000);
