import { database } from './firebase-config.js';
import { ref, set, get, onValue, push, remove } from 'firebase/database';

// Constants
const WORK_TYPES = [
  { key: 'reparo', label: 'Reparo' },
  { key: 'triagem', label: 'Triagem' },
  { key: 'solicitacao_de_peca', label: 'Solicitação de peça' },
  { key: 'saw', label: 'SAW' },
  { key: 'reparo_recusado', label: 'Reparo recusado' },
  { key: 'oqc', label: 'OQC' },
];

  let entries = [];
  let currentFilter = '';

  const form = document.getElementById('entry-form');
  const osNumberInput = document.getElementById('osNumber');
  const workTypeSelect = document.getElementById('workType');
  const collaboratorInput = document.getElementById('collaboratorName');
  const clearAllBtn = document.getElementById('clearAll');
  const searchInput = document.getElementById('searchInput');
  const tableBody = document.getElementById('entriesTableBody');
  const statsContainer = document.getElementById('stats');
  const pieCanvas = document.getElementById('pieChart');
  const chartSection = document.getElementById('chartSection');
  const dataSourceInfo = document.getElementById('dataSourceInfo');
  let pieChartInstance = null;

  // Histórico mensal
  const monthsGrid = document.getElementById('monthsGrid');
  const monthlyHistorySection = document.getElementById('monthlyHistorySection');
  let currentMonthKey = '';

  // Firebase/Cloud
  import { database } from './firebase-config.js';
  import { ref, set, get, onValue } from 'firebase/database';
  
  let isCloudEnabled = false;
  let unsubscribe = null;

  function tryInitializeFirebase() {
    try {
      if (!database) {
        console.warn('⚠️ Configuração do Firebase inválida ou incompleta');
        return false;
      }

      // Configure real-time listener for entries
      const entriesRef = ref(database, 'entries');
      unsubscribe = onValue(entriesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          entries = Object.values(data);
          renderEntries();
          updateStats();
          updateCharts();
        }
      });

      isCloudEnabled = true;
      console.log('✅ Firebase inicializado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase:', error);
      return false;
    }
  }
          cfg.apiKey.includes('XXXXX')) {
        console.warn('⚠️ Configuração do Firebase ainda contém valores placeholder');
        return false;
      }
      
      // Verifica se o Firebase está disponível
      if (typeof firebase === 'undefined') {
        console.warn('⚠️ Firebase não está carregado');
        return false;
      }
      
      // Verifica se o Firestore está disponível
      if (!firebase.firestore) {
        console.warn('⚠️ Firestore não está disponível');
        return false;
      }
      
      // Verifica se já foi inicializado
      if (firebase.apps.length > 0) {
        try {
          firebase.app().delete();
        } catch (e) {
          console.warn('⚠️ Erro ao deletar app existente:', e);
        }
      }
      
      // Inicializa o Firebase
      firebase.initializeApp(cfg);
      db = firebase.firestore();
      isCloudEnabled = true;
      
      console.log('✅ Firebase inicializado com sucesso!');
      console.log('📊 Projeto:', cfg.projectId);
      console.log('🔗 Aplicação compartilhada ativada.');
      
      return true;
    } catch (e) {
      console.error('❌ Erro ao inicializar Firebase:', e);
      isCloudEnabled = false;
      return false;
    }
  }

  function loadEntriesFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      entries = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Erro ao ler dados do storage', err);
      entries = [];
    }
  }

  function saveEntriesToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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

  function renderStats() {
    const visibleEntries = filterEntriesByMonth(entries, currentMonthKey);
    const countByType = WORK_TYPES.reduce((acc, t) => ({ ...acc, [t.key]: 0 }), {});
    for (const e of visibleEntries) {
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
    renderMonthlyHistory();
  }

  function renderPieChart(countByType) {
    if (!pieCanvas) return;
    const labels = WORK_TYPES.map((t) => t.label);
    const data = WORK_TYPES.map((t) => countByType[t.key] || 0);
    const colors = ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#22d3ee'];
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

  function renderTable() {
    const filter = currentFilter.trim().toLowerCase();
    const filteredByMonth = filterEntriesByMonth(entries, currentMonthKey);
    const filtered = filteredByMonth.filter((e) => {
      if (!filter) return true;
      const typeLabel = getTypeLabel(e.type).toLowerCase();
      return (
        String(e.osNumber).toLowerCase().includes(filter) ||
        typeLabel.includes(filter) ||
        String(e.collaborator || '').toLowerCase().includes(filter)
      );
    });

    // Ordena mais recentes primeiro
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    tableBody.innerHTML = filtered.map((e) => {
      const typeClass = e.type;
      return `
        <tr>
          <td>${formatDateTime(e.timestamp)}</td>
          <td>${escapeHtml(String(e.osNumber))}</td>
          <td>${escapeHtml(String(e.collaborator || ''))}</td>
          <td><span class="tag ${typeClass}">${escapeHtml(getTypeLabel(e.type))}</span></td>
          <td class="row-actions">
            <button class="link-like" data-action="delete" data-id="${e.id}">Excluir</button>
          </td>
        </tr>
      `;
    }).join('');
    renderMonthlyHistory();
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
    
    if (isCloudEnabled && db) {
      try {
        console.log('📤 Tentando adicionar entrada no Firestore...');
        
        const docRef = await db.collection('entries').add({
          osNumber,
          type,
          collaborator: collaborator || '',
          timestamp: now,
        });
        
        console.log('✅ Entrada adicionada com sucesso no Firestore! ID:', docRef.id);
        
        // Mostra feedback visual temporário
        showNotification('✅ Registro adicionado com sucesso!', 'success');
        
        // onSnapshot cuidará do render
        return;
      } catch (error) {
        console.error('❌ Erro ao adicionar no Firestore:', error);
        
        // Mostra erro ao usuário
        showNotification(`❌ Erro ao salvar: ${error.message}`, 'error');
        
        // Fallback para localStorage
        console.log('🔄 Fallback para localStorage...');
        isCloudEnabled = false;
        addEntryLocal(osNumber, type, collaborator, now);
        return;
      }
    }
    
    // Fallback para localStorage
    addEntryLocal(osNumber, type, collaborator, now);
  }
  
  function addEntryLocal(osNumber, type, collaborator, timestamp) {
    const entry = {
      id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      osNumber: osNumber,
      type: type,
      collaborator: collaborator || '',
      timestamp: timestamp,
    };
    
    entries.push(entry);
    saveEntriesToStorage();
    renderStats();
    renderTable();
    
    showNotification('💾 Registro salvo localmente', 'info');
  }
  
  function showNotification(message, type = 'info') {
    // Remove notificação existente
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Adiciona estilos
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
    
    // Cores baseadas no tipo
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Adiciona ao DOM
    document.body.appendChild(notification);
    
    // Remove após 5 segundos
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
    if (isCloudEnabled && db) {
      await db.collection('entries').doc(id).delete();
      return; // onSnapshot fará o render
    }
    const idx = entries.findIndex((e) => e.id === id);
    if (idx >= 0) {
      entries.splice(idx, 1);
      saveEntriesToStorage();
      renderStats();
      renderTable();
    }
  }

  async function clearAll() {
    if (!confirm('Tem certeza que deseja apagar todos os registros?')) return;
    if (isCloudEnabled && db) {
      const snap = await db.collection('entries').get();
      const batch = db.batch();
      snap.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      return;
    }
    entries = [];
    saveEntriesToStorage();
    renderStats();
    renderTable();
  }

  function subscribeEntries() {
    if (!(isCloudEnabled && db)) return null;
    return db
      .collection('entries')
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        (snap) => {
          entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          renderStats();
          renderTable();
        },
        (err) => {
          console.warn('Falha no Firestore, voltando para localStorage.', err);
          isCloudEnabled = false;
          try { unsubscribe && unsubscribe(); } catch (_) {}
          loadEntriesFromStorage();
          renderStats();
          renderTable();
        }
      );
  }

  function initDataSource() {
    const ok = tryInitializeFirebase();
    if (ok) {
      // Render inicial (0) até chegar o snapshot
      renderStats();
      renderTable();
      unsubscribe = subscribeEntries();
      
      // Atualiza footer para mostrar que está usando Firebase
      if (dataSourceInfo) {
        dataSourceInfo.innerHTML = '🔄 <strong>Aplicação compartilhada ativa!</strong> Dados sincronizados em tempo real via Firebase.';
        dataSourceInfo.style.color = '#10b981';
      }
      return;
    }
    // Local fallback
    loadEntriesFromStorage();
    renderStats();
    renderTable();
    
    // Atualiza footer para mostrar que está usando localStorage
    if (dataSourceInfo) {
      dataSourceInfo.innerHTML = '💾 Dados salvos apenas neste navegador (localStorage). Configure o Firebase para compartilhar.';
      dataSourceInfo.style.color = '#6b7280';
    }
  }

  // Auxiliares de mês
  function getMonthKey(isoOrDate) {
    const d = (isoOrDate instanceof Date) ? isoOrDate : new Date(isoOrDate);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  function formatMonthLabel(monthKey) {
    const [y, m] = monthKey.split('-').map((v) => parseInt(v, 10));
    if (!y || !m) return 'Inválido';
    return `${String(m).padStart(2, '0')}/${y}`;
  }

  function filterEntriesByMonth(list, monthKey) {
    if (!monthKey) return list.slice();
    return list.filter((e) => getMonthKey(e.timestamp) === monthKey);
  }

  function renderMonthlyHistory() {
    if (!monthsGrid || !monthlyHistorySection) return;
    if (!entries || entries.length === 0) {
      monthlyHistorySection.classList.add('is-hidden');
      return;
    }

    // Agrupa por mês
    const counts = new Map();
    for (const e of entries) {
      const key = getMonthKey(e.timestamp);
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const keys = Array.from(counts.keys()).sort().reverse();
    if (keys.length === 0) {
      monthlyHistorySection.classList.add('is-hidden');
      return;
    }
    monthlyHistorySection.classList.remove('is-hidden');

    const totalCount = entries.length;
    const cardsHtml = [
      `
      <div class="month-card ${currentMonthKey ? '' : 'is-active'}" data-month="">
        <div class="month">Todos</div>
        <div class="count">${totalCount} registros</div>
      </div>
      `,
      ...keys.map((k) => {
        const active = currentMonthKey === k ? 'is-active' : '';
        const n = counts.get(k) || 0;
        return `
          <div class="month-card ${active}" data-month="${k}">
            <div class="month">${formatMonthLabel(k)}</div>
            <div class="count">${n} registros</div>
          </div>
        `;
      })
    ].join('');

    monthsGrid.innerHTML = cardsHtml;
  }


  // Eventos
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
  

  searchInput.addEventListener('input', (e) => {
    currentFilter = e.target.value;
    renderTable();
  });

  if (monthsGrid) {
    monthsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.month-card');
      if (!card) return;
      const month = card.getAttribute('data-month') || '';
      // Toggle se clicar novamente no ativo
      currentMonthKey = (currentMonthKey === month) ? '' : month;
      renderStats();
      renderTable();
      renderMonthlyHistory();
    });
  }

  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'delete') deleteEntryById(id);
  });

  // Init
  initDataSource();
})();


