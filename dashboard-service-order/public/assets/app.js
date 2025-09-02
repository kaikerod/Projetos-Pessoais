(() => {
  const API_URL = 'http://localhost:3000'; // URL do nosso backend
  const WORK_TYPES = [
    { key: 'triagem', label: 'Triagem', color: '#34d399' },
    { key: 'solicitacao_de_peca', label: 'Solicitação de peça', color: '#fbbf24' },
    { key: 'reparo', label: 'Reparo', color: '#60a5fa' },
    { key: 'orcamento_gerado', label: 'Orçamento gerado', color: '#f472b6' },
    { key: 'saw', label: 'SAW', color: '#a78bfa' },
    { key: 'reparo_recusado', label: 'Reparo recusado', color: '#f87171' },
    { key: 'reparo_completo', label: 'Reparo Completo', color: '#fb923c' },
  ];

  let entries = [];

  const form = document.getElementById('entry-form');
  const osNumberInput = document.getElementById('osNumber');
  const workTypeSelect = document.getElementById('workType');
  const collaboratorInput = document.getElementById('collaboratorName');
  const clearAllBtn = document.getElementById('clearAll');
  const statsContainer = document.getElementById('stats');
  const pieCanvas = document.getElementById('pieChart');
  const chartSection = document.getElementById('chartSection');
  const board = document.getElementById('board');
  let pieChartInstance = null;

  // --- Funções de API ---
  async function fetchEntries() {
    try {
      const response = await fetch(`${API_URL}/items`);
      if (!response.ok) {
        throw new Error('Falha ao buscar dados da API');
      }
      return await response.json();
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      showNotification('❌ Erro ao carregar dados do servidor.', 'error');
      return []; // Retorna array vazio em caso de erro
    }
  }

  async function postEntry(entry) {
    try {
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        throw new Error('Falha ao salvar o registro.');
      }
      return await response.json();
    } catch (err) {
      console.error('Erro ao salvar registro:', err);
      showNotification('❌ Erro ao salvar o registro.', 'error');
      return null;
    }
  }
  
  async function updateEntryAPI(entry) {
    // O DynamoDB usa put para criar e atualizar, então a chamada é a mesma.
    // O ID garante que o item correto seja sobrescrito.
    return await postEntry(entry);
  }

  async function deleteEntryAPI(id) {
    try {
      // Nota: O endpoint de exclusão não foi implementado no backend de exemplo.
      // Isso é uma demonstração de como seria a chamada no front-end.
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Falha ao excluir o registro.');
      }
      return true;
    } catch (err) {
      console.error('Erro ao excluir registro:', err);
      showNotification('❌ Erro ao excluir o registro.', 'error');
      return false;
    }
  }


  function resetForm() {
    osNumberInput.value = '';
    collaboratorInput.value = '';
    workTypeSelect.value = '';
    osNumberInput.focus();
  }

  function formatDateTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleString();
  }

  function getTypeLabel(typeKey) {
    const t = WORK_TYPES.find((t) => t.key === typeKey);
    return t ? t.label : typeKey;
  }

  function renderAll() {
    renderStats();
    renderBoard();
  }

  function renderStats() {
    const countByType = WORK_TYPES.reduce((acc, t) => ({ ...acc, [t.key]: 0 }), {});
    for (const e of entries) {
      if (countByType[e.type] !== undefined) countByType[e.type] += 1;
    }
    statsContainer.innerHTML = WORK_TYPES.map((t) => {
      return `
        <div class="stat-card">
          <div class="stat-title">${getTypeLabel(t.key)}</div>
          <div class="stat-value">${countByType[t.key] || 0}</div>
        </div>
      `;
    }).join('');

    renderPieChart(countByType);
  }

  function renderPieChart(countByType) {
    if (!pieCanvas) return;
    const labels = WORK_TYPES.map((t) => t.label);
    const data = WORK_TYPES.map((t) => countByType[t.key] || 0);
    const colors = WORK_TYPES.map((t) => t.color);
    const colorsBg = colors.map((c) => hexToRgba(c, 0.25));

    const total = data.reduce((a, b) => a + b, 0);
    if (chartSection) {
      if (total === 0) {
        chartSection.classList.add('is-hidden');
      } else {
        chartSection.classList.remove('is-hidden');
      }
    }

    if (total === 0) {
      if (pieChartInstance) {
        pieChartInstance.destroy();
        pieChartInstance = null;
      }
      return;
    }

    const cfg = {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colorsBg, borderColor: colors, borderWidth: 1 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { color: '#e5e7eb' } } },
      },
    };
    if (pieChartInstance) {
      pieChartInstance.data = cfg.data;
      pieChartInstance.update();
    } else {
      const ctx = pieCanvas.getContext('2d');
      pieChartInstance = new Chart(ctx, cfg);
    }
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace('#','');
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function renderBoard() {
    if (!board) return;

    board.innerHTML = WORK_TYPES.map(type => `
      <div class="board-column" data-type="${type.key}">
        <div class="column-header" style="color: ${type.color};">
          ${type.label}
          <span class="column-count">(${entries.filter(e => e.type === type.key).length})</span>
        </div>
        <div class="column-body" id="column-${type.key}">
          <!-- Cards will be rendered here -->
        </div>
      </div>
    `).join('');

    entries.forEach(entry => {
      const columnBody = document.getElementById(`column-${entry.type}`);
      if (columnBody) {
        const card = document.createElement('div');
        card.className = 'entry-card';
        card.draggable = true;
        card.dataset.id = entry.id;
        card.innerHTML = `
          <div class="os-number">OS: ${escapeHtml(String(entry.osNumber))}</div>
          <div class="collaborator">${escapeHtml(String(entry.collaborator || ''))}</div>
          <div class="timestamp">${formatDateTime(entry.timestamp)}</div>
          <div class="actions">
            <button class="link-like" data-action="delete" data-id="${entry.id}">Excluir</button>
          </div>
        `;
        columnBody.appendChild(card);
      }
    });

    addDragAndDropListeners();
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function addEntry(osNumber, type, collaborator) {
    const now = new Date().toISOString();
    const entry = {
      // O ID deve ser a chave de partição no DynamoDB
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      osNumber: osNumber,
      type: type,
      collaborator: collaborator || '',
      timestamp: now,
    };
    
    const result = await postEntry(entry);
    if (result) {
      entries.push(result.item);
      renderAll();
      showNotification('✅ Registro adicionado com sucesso!', 'success');
    }
  }
  
  function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  async function deleteEntryById(id) {
    // Nota: A rota DELETE precisa ser implementada no backend.
    // Por enquanto, vamos apenas remover do front-end para manter a UI funcional.
    // const success = await deleteEntryAPI(id);
    // if (success) {
      const idx = entries.findIndex((e) => e.id === id);
      if (idx >= 0) {
        entries.splice(idx, 1);
        renderAll();
        showNotification('🗑️ Registro excluído (localmente)!', 'info');
      }
    // }
  }

  // A função de apagar tudo precisaria de um endpoint específico no backend.
  // Por simplicidade, vamos desativá-la por enquanto.
  function clearAll() {
    showNotification('Função desativada na versão com backend.', 'warning');
    // if (!confirm('Tem certeza que deseja apagar todos os registros?')) return;
    // entries = [];
    // renderAll();
  }

  async function updateEntryType(id, newType) {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      entry.type = newType;
      const result = await updateEntryAPI(entry);
      if (result) {
        renderAll();
        showNotification(`Status da OS ${entry.osNumber} alterado para ${getTypeLabel(newType)}`, 'success');
      } else {
        // Reverte a mudança se a API falhar
        entry.type = entries.find(e => e.id === id).type; 
      }
    }
  }

  let draggedCard = null;

  function addDragAndDropListeners() {
    const cards = document.querySelectorAll('.entry-card');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedCard = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.id);
      });

      card.addEventListener('dragend', () => {
        draggedCard.classList.remove('dragging');
        draggedCard = null;
      });
    });

    const columns = document.querySelectorAll('.board-column');
    columns.forEach(column => {
      column.addEventListener('dragover', (e) => {
        e.preventDefault();
        const columnBody = column.querySelector('.column-body');
        const dragging = document.querySelector('.dragging');
        if (dragging && columnBody && !columnBody.contains(dragging)) {
          columnBody.classList.add('drop-zone');
        }
        e.dataTransfer.dropEffect = 'move';
      });

      column.addEventListener('dragleave', (e) => {
        const columnBody = column.querySelector('.column-body');
        if (columnBody) {
          columnBody.classList.remove('drop-zone');
        }
      });

      column.addEventListener('drop', (e) => {
        e.preventDefault();
        const columnBody = column.querySelector('.column-body');
        if (columnBody) {
          columnBody.classList.remove('drop-zone');
        }

        if (draggedCard) {
          const entryId = draggedCard.dataset.id;
          const newType = column.dataset.type;
          updateEntryType(entryId, newType);
        }
      });
    });
  }

  // --- Eventos ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const osNumber = osNumberInput.value.trim();
    const workType = workTypeSelect.value;
    const collaborator = collaboratorInput.value.trim();
    if (!osNumber || !workType) return;
    addEntry(osNumber, workType, collaborator);
    resetForm();
  });

  clearAllBtn.addEventListener('click', clearAll);

  board.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'delete') deleteEntryById(id);
  });

  // --- Inicialização ---
  async function initializeApp() {
    entries = await fetchEntries();
    renderAll();
  }

  initializeApp();
})();
