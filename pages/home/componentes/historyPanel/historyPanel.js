export function setupHistoryPanel(container, { onDelete } = {}) {
    const tableBody = container.querySelector('#homeHistoryTableBody');
    const emptyState = container.querySelector('#homeHistoryEmpty');

    if (!tableBody || !emptyState) {
        throw new Error('Estrutura do histórico da Home está incompleta.');
    }

    function createHistoryRow(entry, index) {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(entry.playedAt ?? Date.now()).toLocaleDateString('pt-BR');

        const opponentCell = document.createElement('td');
        opponentCell.textContent = entry.oponenteName ?? 'Oponente';

        const resultCell = document.createElement('td');
        resultCell.textContent = entry.resultLabel ?? '—';

        const scoreCell = document.createElement('td');
        scoreCell.textContent = `${entry.playerPoints ?? 0} x ${entry.oponentePoints ?? 0}`;

        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'home-delete-history';
        deleteButton.dataset.historyIndex = String(index);
        deleteButton.textContent = 'Excluir';
        actionCell.appendChild(deleteButton);

        row.append(dateCell, opponentCell, resultCell, scoreCell, actionCell);
        return row;
    }

    tableBody.addEventListener('click', event => {
        const deleteButton = event.target.closest('.home-delete-history');

        if (!deleteButton) {
            return;
        }

        onDelete?.(Number(deleteButton.dataset.historyIndex));
    });

    function renderHistory(entries = []) {
        tableBody.replaceChildren();

        if (entries.length === 0) {
            emptyState.classList.remove('is-hidden');
            return;
        }

        emptyState.classList.add('is-hidden');
        tableBody.append(...entries.map((entry, index) => createHistoryRow(entry, index)));
    }

    return {
        renderHistory,
    };
}
