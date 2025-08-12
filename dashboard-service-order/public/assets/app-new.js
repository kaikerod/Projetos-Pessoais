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

// DOM Elements
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
const monthsGrid = document.getElementById('monthsGrid');
const monthlyHistorySection = document.getElementById('monthlyHistorySection');

let entries = [];
let currentFilter = '';
let pieChartInstance = null;
let currentMonthKey = '';

// Firebase initialization
function initializeFirebase() {
  try {
    if (!database) {
      console.warn('⚠️ Configuração do Firebase inválida ou incompleta');
      return false;
    }

    // Set up real-time listener for entries
    const entriesRef = ref(database, 'entries');
    onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        entries = Object.values(data);
        renderEntries();
        updateStats();
        updateCharts();
      }
    });

    console.log('✅ Firebase inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    return false;
  }
}

// Event Handlers
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const entry = {
    osNumber: osNumberInput.value,
    workType: workTypeSelect.value,
    collaborator: collaboratorInput.value || 'Não informado',
    timestamp: new Date().toISOString(),
  };

  try {
    // Save to Firebase
    const entriesRef = ref(database, 'entries');
    const newEntryRef = push(entriesRef);
    await set(newEntryRef, entry);
    
    console.log('✅ Entrada salva com sucesso!');
    form.reset();
  } catch (error) {
    console.error('❌ Erro ao salvar entrada:', error);
    alert('Erro ao salvar entrada. Por favor, tente novamente.');
  }
}

async function handleClearAll() {
  if (!confirm('Tem certeza que deseja limpar todos os registros?')) {
    return;
  }

  try {
    const entriesRef = ref(database, 'entries');
    await set(entriesRef, null);
    console.log('✅ Todos os registros foram limpos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar registros:', error);
    alert('Erro ao limpar registros. Por favor, tente novamente.');
  }
}

function handleSearch(event) {
  currentFilter = event.target.value.toLowerCase().trim();
  renderEntries();
}

// Rendering Functions
function renderEntries() {
  const filteredEntries = entries
    .filter(entry => 
      entry.osNumber.toLowerCase().includes(currentFilter) ||
      entry.collaborator.toLowerCase().includes(currentFilter) ||
      WORK_TYPES.find(type => type.key === entry.workType)?.label.toLowerCase().includes(currentFilter)
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  tableBody.innerHTML = filteredEntries
    .map(entry => `
      <tr>
        <td>${entry.osNumber}</td>
        <td>${WORK_TYPES.find(type => type.key === entry.workType)?.label || entry.workType}</td>
        <td>${entry.collaborator}</td>
        <td>${new Date(entry.timestamp).toLocaleString()}</td>
      </tr>
    `)
    .join('');

  dataSourceInfo.textContent = \`Mostrando \${filteredEntries.length} de \${entries.length} registros\`;
}

function updateStats() {
  const stats = WORK_TYPES.map(type => ({
    ...type,
    count: entries.filter(entry => entry.workType === type.key).length
  }));

  statsContainer.innerHTML = stats
    .map(stat => \`
      <div class="stat-card">
        <h3>\${stat.label}</h3>
        <p>\${stat.count}</p>
      </div>
    \`)
    .join('');
}

function updateCharts() {
  if (pieChartInstance) {
    pieChartInstance.destroy();
  }

  const stats = WORK_TYPES.map(type => ({
    ...type,
    count: entries.filter(entry => entry.workType === type.key).length
  }));

  pieChartInstance = new Chart(pieCanvas, {
    type: 'pie',
    data: {
      labels: stats.map(s => s.label),
      datasets: [{
        data: stats.map(s => s.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        }
      }
    }
  });
}

// Event Listeners
form.addEventListener('submit', handleFormSubmit);
clearAllBtn.addEventListener('click', handleClearAll);
searchInput.addEventListener('input', handleSearch);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeFirebase();
});
