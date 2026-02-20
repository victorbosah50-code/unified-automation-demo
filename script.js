// DOM Elements
const toggleModeBtn = document.getElementById('toggle-mode');
const exportBtn = document.getElementById('export-report');
const tabBtns = document.querySelectorAll('.tab-btn');
const modules = document.querySelectorAll('.module');
const manualScanBtn = document.getElementById('manual-scan');
const cyberLogsBody = document.querySelector('#cyber-logs tbody');
const opsForm = document.getElementById('ops-form');
const opsInput = document.getElementById('ops-input');
const opsTasksBody = document.querySelector('#ops-tasks tbody');
const leadsForm = document.getElementById('leads-form');
const leadsInput = document.getElementById('leads-input');
const leadsTableBody = document.querySelector('#leads-table tbody');

// Storage Keys
const CYBER_KEY = 'cyberLogs';
const OPS_KEY = 'opsTasks';
const LEADS_KEY = 'leads';

// State
let currentModule = 'cyber';
let cyberLogs = JSON.parse(localStorage.getItem(CYBER_KEY)) || [];
let opsTasks = JSON.parse(localStorage.getItem(OPS_KEY)) || [];
let leadsData = JSON.parse(localStorage.getItem(LEADS_KEY)) || [];

// Charts
let cyberChart, opsChart, leadsChart;

// Event Listeners
toggleModeBtn.addEventListener('click', toggleDarkMode);
exportBtn.addEventListener('click', exportReport);
tabBtns.forEach(btn => btn.addEventListener('click', switchModule));
manualScanBtn.addEventListener('click', simulateThreat);
opsForm.addEventListener('submit', handleOpsSubmit);
leadsForm.addEventListener('submit', handleLeadsSubmit);

// Init
renderAll();
initCharts();
startAutomationTriggers();

// Functions
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function switchModule(e) {
    const module = e.target.dataset.module;
    currentModule = module;
    tabBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    modules.forEach(m => m.classList.remove('active'));
    document.getElementById(`${module}-module`).classList.add('active');
}

function renderAll() {
    renderCyberLogs();
    renderOpsTasks();
    renderLeads();
}

function initCharts() {
    cyberChart = new Chart(document.getElementById('cyber-chart'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Threat Levels', data: [], borderColor: '#ff6384' }] },
        options: { scales: { y: { beginAtZero: true } } }
    });
    opsChart = new Chart(document.getElementById('ops-chart'), {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Priorities', data: [], backgroundColor: '#36a2eb' }] },
        options: { scales: { y: { beginAtZero: true } } }
    });
    leadsChart = new Chart(document.getElementById('leads-chart'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Lead Counts', data: [], borderColor: '#ffce56' }] },
        options: { scales: { y: { beginAtZero: true } } }
    });
    updateCharts();
}

function updateCharts() {
    // Cyber
    cyberChart.data.labels = cyberLogs.map((_, i) => `Log ${i+1}`);
    cyberChart.data.datasets[0].data = cyberLogs.map(log => log.level === 'High' ? 100 : log.level === 'Medium' ? 50 : 0);
    cyberChart.update();
    // Ops
    opsChart.data.labels = opsTasks.map((_, i) => `Task ${i+1}`);
    opsChart.data.datasets[0].data = opsTasks.map(task => task.priority === 'High' ? 100 : task.priority === 'Medium' ? 50 : 0);
    opsChart.update();
    // Leads
    leadsChart.data.labels = leadsData.map((_, i) => `Lead ${i+1}`);
    leadsChart.data.datasets[0].data = leadsData.map(lead => lead.leads.length);
    leadsChart.update();
}

function startAutomationTriggers() {
    // Cyber auto-scan every 10s
    setInterval(() => {
        if (currentModule === 'cyber') simulateThreat();
    }, 10000);
}

// Cyber Functions
function simulateThreat() {
    const levels = ['Low', 'Medium', 'High'];
    const messages = ['No threat', 'Potential issue', 'Critical alert'];
    const random = Math.floor(Math.random() * 3);
    const log = { timestamp: new Date().toLocaleString(), level: levels[random], message: messages[random] };
    cyberLogs.push(log);
    localStorage.setItem(CYBER_KEY, JSON.stringify(cyberLogs));
    renderCyberLogs();
    updateCharts();
    if (log.level === 'High') alert(`High Threat Alert: ${log.message}`); // Real trigger
}

function renderCyberLogs() {
    cyberLogsBody.innerHTML = '';
    cyberLogs.forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${log.timestamp}</td><td>${log.level}</td><td>${log.message}</td>`;
        cyberLogsBody.appendChild(tr);
    });
}

// Ops Functions
function handleOpsSubmit(e) {
    e.preventDefault();
    const desc = opsInput.value.trim();
    if (!desc) return;
    const priority = simulateOpsPriority(desc);
    const routedTo = simulateOpsRouting(desc);
    const task = { timestamp: new Date().toLocaleString(), priority, routedTo, description: desc };
    opsTasks.push(task);
    localStorage.setItem(OPS_KEY, JSON.stringify(opsTasks));
    renderOpsTasks();
    updateCharts();
    opsInput.value = '';
    alert(`Task Auto-Routed to ${routedTo} with ${priority} priority.`); // Trigger
}

function simulateOpsPriority(desc) {
    const lower = desc.toLowerCase();
    if (lower.includes('urgent')) return 'High';
    if (lower.includes('important')) return 'Medium';
    return 'Low';
}

function simulateOpsRouting(desc) {
    const lower = desc.toLowerCase();
    if (lower.includes('sales')) return 'Sales Team';
    if (lower.includes('hr')) return 'HR Team';
    return 'General';
}

function renderOpsTasks() {
    opsTasksBody.innerHTML = '';
    opsTasks.forEach(task => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${task.timestamp}</td><td>${task.priority}</td><td>${task.routedTo}</td><td>${task.description}</td>`;
        opsTasksBody.appendChild(tr);
    });
}

// Leads Functions
function handleLeadsSubmit(e) {
    e.preventDefault();
    const msg = leadsInput.value.trim();
    if (!msg) return;
    const leads = extractLeads(msg);
    const outreach = leads.length ? 'Outreach email simulated: Hello, interested?' : 'No leads found.';
    const lead = { timestamp: new Date().toLocaleString(), leads, outreach };
    leadsData.push(lead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leadsData));
    renderLeads();
    updateCharts();
    leadsInput.value = '';
    if (leads.length) alert(`Auto-Outreach Triggered: ${outreach}`); // Trigger
}

function extractLeads(msg) {
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    return msg.match(emailRegex) || [];
}

function renderLeads() {
    leadsTableBody.innerHTML = '';
    leadsData.forEach(lead => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${lead.timestamp}</td><td>${lead.leads.join(', ') || 'None'}</td><td>${lead.outreach}</td>`;
        leadsTableBody.appendChild(tr);
    });
}

// Export Report
function exportReport() {
    let data;
    if (currentModule === 'cyber') data = cyberLogs;
    else if (currentModule === 'ops') data = opsTasks;
    else data = leadsData;

    if (data.length === 0) {
        alert('No data to export.');
        return;
    }

    const csv = Object.keys(data[0]).join(',') + '\n' + data.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentModule}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
