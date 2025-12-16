import { INITIAL_STATS, MAX_STATS, BACKGROUND_POOL, SUPERVISOR_POOL, WEEKLY_RENT, ACTIONS_DATA, COST } from './constants.js';
import { generateResearchTopic } from './geminiService.js';
import { RANDOM_EVENT_POOL } from './events.js';

// --- GLOBAL STATE ---
const state = {
  phase: 'SETUP', // SETUP, PLAYING, GAMEOVER
  turn: 1,
  stats: JSON.parse(JSON.stringify(INITIAL_STATS)),
  maxStats: JSON.parse(JSON.stringify(MAX_STATS)),
  background: null,
  supervisor: null,
  activeTab: 'ACADEMICS',
  logs: [],
  activeProject: null,
  availableIdeas: [],
  modal: null, // { type: 'EVENT'|'IDEA', data: any }
  loading: false
};

// --- DOM ROOT ---
const app = document.getElementById('app');
const modalContainer = document.getElementById('modal-container');

// --- HELPER FUNCTIONS ---
const addLog = (msg, type = 'info') => {
  state.logs.unshift({ id: Date.now(), turn: state.turn, msg, type });
  if(state.phase === 'PLAYING') renderLogs();
};

const updateStats = (modifiers) => {
  if (!modifiers) return;
  
  const apply = (target, mods, cap) => {
    for (const [k, v] of Object.entries(mods || {})) {
      if (target[k] !== undefined) {
        target[k] = Math.max(0, target[k] + v);
        if (cap && cap[k]) target[k] = Math.min(cap[k], target[k]);
      }
    }
  };

  if (modifiers.energy) state.stats.energy = Math.max(0, Math.min(state.maxStats.energy, state.stats.energy + modifiers.energy));
  if (modifiers.funds) state.stats.funds += modifiers.funds;
  
  apply(state.stats.physiological, modifiers.physiological, state.maxStats.physiological);
  apply(state.stats.talents, modifiers.talents, state.maxStats.talents);
  apply(state.stats.skills, modifiers.skills, state.maxStats.skills);
  apply(state.stats.career, modifiers.career, state.maxStats.career);
};

// --- GLOBAL HANDLERS (Exposed to Window) ---
window.startGame = () => {
  if (!state.background || !state.supervisor) return;
  state.phase = 'PLAYING';
  
  // Apply Initial Modifiers
  updateStats(state.background.initialModifiers);
  updateStats(state.supervisor.initialModifiers);
  
  addLog(`Welcome, ${state.background.name}. You are working for ${state.supervisor.name}.`);
  render();
};

window.selectBackground = (id) => {
  state.background = BACKGROUND_POOL.find(b => b.id === id);
  render();
};

window.selectSupervisor = (id) => {
  state.supervisor = SUPERVISOR_POOL.find(s => s.id === id);
  render();
};

window.setTab = (tab) => {
  state.activeTab = tab;
  renderActions();
};

window.nextWeek = () => {
  state.turn++;
  
  // Costs & Decay
  state.stats.funds -= WEEKLY_RENT;
  state.stats.physiological.stress = Math.max(0, state.stats.physiological.stress - 5);
  
  // Energy Recovery
  const recovery = Math.round(state.maxStats.energy * 0.5); // Simplified
  state.stats.energy = Math.min(state.maxStats.energy, state.stats.energy + recovery);
  
  addLog(`Week ${state.turn}: Rent paid. Energy recovered.`);
  
  // Random Event (30% chance)
  if (Math.random() < 0.3) {
    const event = RANDOM_EVENT_POOL[Math.floor(Math.random() * RANDOM_EVENT_POOL.length)];
    state.modal = { type: 'EVENT', data: event };
    updateStats(event.effect);
    addLog(event.title, 'warning');
  }
  
  render();
};

window.handleAction = (actionId) => {
  const allActions = [...Object.values(ACTIONS_DATA)];
  if(state.background.exclusiveActions) allActions.push(...state.background.exclusiveActions);
  if(state.supervisor.exclusiveActions) allActions.push(...state.supervisor.exclusiveActions);
  
  const action = allActions.find(a => a.id === actionId);
  if (!action) return;

  // Cost Check
  if (action.cost.energy && state.stats.energy < action.cost.energy) {
    addLog("Not enough energy!", "danger");
    return;
  }
  
  // Apply Cost
  if (action.cost.energy) state.stats.energy -= action.cost.energy;
  if (action.cost.funds) state.stats.funds -= action.cost.funds;
  if (action.cost.physiological) updateStats({ physiological: action.cost.physiological });

  // Apply Effect
  updateStats(action.effect);
  addLog(action.logMessage);
  
  // Idea Trigger
  if (actionId === 'READ_PAPERS' && Math.random() > 0.5) generateIdea();

  render();
};

async function generateIdea() {
  state.loading = true;
  render();
  const idea = await generateResearchTopic("Physics");
  state.availableIdeas.push({ ...idea, id: Date.now() });
  state.loading = false;
  addLog("New research idea generated!", "success");
  render();
}

window.inspectIdea = (id) => {
  const idea = state.availableIdeas.find(i => i.id == id);
  if (idea) {
    state.modal = { type: 'IDEA', data: idea };
    render();
  }
};

window.startProject = (id) => {
  const idea = state.availableIdeas.find(i => i.id == id);
  if (state.stats.energy < COST.DEVELOP_IDEA.energy) return;
  
  state.stats.energy -= COST.DEVELOP_IDEA.energy;
  state.activeProject = { ...idea, progress: 0 };
  state.availableIdeas = state.availableIdeas.filter(i => i.id != id);
  state.modal = null;
  addLog(`Started project: ${idea.title}`);
  render();
};

window.workProject = () => {
  if (!state.activeProject) return;
  if (state.stats.energy < 15) return;
  
  state.stats.energy -= 15;
  const progress = 10 + Math.random() * 10;
  state.activeProject.progress += progress;
  addLog(`Research progress: +${Math.round(progress)}%`);
  
  if (state.activeProject.progress >= 100) {
    addLog("Project ready for publication! (Publication logic wip)", "success");
    state.activeProject.progress = 100;
  }
  render();
};

window.closeModal = () => {
  state.modal = null;
  render();
};

// --- RENDERERS ---

function renderSetup() {
  return `
    <div class="max-w-5xl mx-auto p-8">
      <h1 class="serif text-4xl font-bold mb-8 text-slate-900">Publish or Perish <span class="text-lg font-sans font-normal text-slate-500 block">PhD Simulator Setup</span></h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Backgrounds -->
        <div>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><i data-lucide="user"></i> Background</h2>
          <div class="space-y-4">
            ${BACKGROUND_POOL.map(bg => `
              <div onclick="window.selectBackground('${bg.id}')" class="cursor-pointer p-4 rounded-xl border-2 transition-all ${state.background?.id === bg.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 hover:border-indigo-300 bg-white'}">
                <div class="font-bold text-lg text-slate-800">${bg.name}</div>
                <div class="text-xs text-slate-500 font-medium mb-2">${bg.education}</div>
                <div class="text-sm text-slate-600 italic">"${bg.description}"</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Supervisors -->
        <div>
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><i data-lucide="user-check"></i> Supervisor</h2>
          <div class="space-y-4">
            ${SUPERVISOR_POOL.map(sup => `
              <div onclick="window.selectSupervisor('${sup.id}')" class="cursor-pointer p-4 rounded-xl border-2 transition-all ${state.supervisor?.id === sup.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 hover:border-indigo-300 bg-white'}">
                <div class="flex justify-between">
                  <div class="font-bold text-lg text-slate-800">${sup.name}</div>
                  <div class="text-xs bg-slate-200 px-2 py-1 rounded">Rep: ${sup.reputation}</div>
                </div>
                <div class="text-xs text-slate-500 font-medium mb-2">${sup.institution}</div>
                <div class="text-sm text-slate-600 italic">"${sup.description}"</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-end">
        <button onclick="window.startGame()" ${(!state.background || !state.supervisor) ? 'disabled' : ''} class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
          Start Journey <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </div>
  `;
}

function renderGame() {
  const { stats, maxStats } = state;
  const healthPct = (stats.physiological.health / maxStats.physiological.health) * 100;
  const stressPct = (stats.physiological.stress / maxStats.physiological.stress) * 100;
  const energyPct = (stats.energy / maxStats.energy) * 100;

  return `
    <div class="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Header -->
      <div class="lg:col-span-12 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h1 class="serif text-2xl font-bold text-slate-900">Publish or Perish</h1>
          <div class="text-sm text-slate-500">Week ${state.turn} • ${state.background.name}</div>
        </div>
        <div class="text-right flex items-center gap-4">
           <div class="text-center">
             <div class="text-xs text-slate-400 uppercase font-bold">Funds</div>
             <div class="text-xl font-mono font-bold ${stats.funds < 0 ? 'text-red-500' : 'text-emerald-600'}">$${stats.funds}</div>
           </div>
           <button onclick="window.nextWeek()" class="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
             Next Week <i data-lucide="calendar"></i>
           </button>
        </div>
      </div>

      <!-- Left: Stats -->
      <div class="lg:col-span-3 space-y-4">
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 class="font-bold text-slate-700 border-b pb-2">Vitals</h3>
          
          <!-- Energy -->
          <div>
            <div class="flex justify-between text-xs mb-1 font-bold text-slate-600"><span>Energy</span> <span>${Math.round(stats.energy)}/${maxStats.energy}</span></div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-yellow-400" style="width: ${energyPct}%"></div></div>
          </div>
          <!-- Health -->
          <div>
            <div class="flex justify-between text-xs mb-1 font-bold text-slate-600"><span>Health</span> <span>${Math.round(stats.physiological.health)}%</span></div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-rose-500" style="width: ${healthPct}%"></div></div>
          </div>
          <!-- Stress -->
          <div>
            <div class="flex justify-between text-xs mb-1 font-bold text-slate-600"><span>Stress</span> <span>${Math.round(stats.physiological.stress)}%</span></div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-indigo-500" style="width: ${stressPct}%"></div></div>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
           <h3 class="font-bold text-slate-700 border-b pb-2 mb-2">Academic Stats</h3>
           <div class="space-y-2 text-sm">
             <div class="flex justify-between"><span>Creativity</span> <span class="font-bold text-purple-600">${stats.talents.creativity}</span></div>
             <div class="flex justify-between"><span>Logic</span> <span class="font-bold text-blue-600">${stats.talents.logic}</span></div>
             <div class="flex justify-between"><span>Focus</span> <span class="font-bold text-emerald-600">${stats.talents.focus}</span></div>
             <div class="flex justify-between"><span>Writing</span> <span class="font-bold text-slate-600">${stats.skills.writing}</span></div>
           </div>
        </div>
      </div>

      <!-- Center: Workspace -->
      <div class="lg:col-span-6 space-y-6">
        <!-- Project Card -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[200px]">
          ${state.activeProject ? `
            <div class="border-l-4 border-indigo-600 pl-4">
              <div class="text-xs font-bold text-indigo-600 uppercase mb-1">Current Research</div>
              <h3 class="serif text-xl font-bold mb-2">${state.activeProject.title}</h3>
              <div class="mb-4">
                <div class="flex justify-between text-xs mb-1"><span>Progress</span> <span>${Math.round(state.activeProject.progress)}%</span></div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-indigo-600 transition-all duration-300" style="width: ${state.activeProject.progress}%"></div></div>
              </div>
              <button onclick="window.workProject()" class="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700">Conduct Research (-15 En)</button>
            </div>
          ` : `
            <div class="text-center py-8 text-slate-400">
              <i data-lucide="flask-conical" class="mx-auto mb-2" width="40"></i>
              <p>No active project. Select an idea from your notebook below.</p>
            </div>
          `}
        </div>

        <!-- Notebook -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2"><i data-lucide="book"></i> Idea Notebook</h3>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            ${state.availableIdeas.length === 0 ? '<div class="text-sm text-slate-400 italic">Read papers to get ideas.</div>' : 
              state.availableIdeas.map(idea => `
              <div onclick="window.inspectIdea(${idea.id})" class="p-3 rounded-lg border border-slate-200 hover:border-indigo-400 cursor-pointer bg-slate-50 transition-colors">
                <div class="font-bold text-sm text-slate-800">${idea.title}</div>
                <div class="text-xs text-slate-500 mt-1 flex gap-2">
                   <span class="bg-white px-2 rounded border">Diff: ${idea.difficulty}</span>
                   <span class="bg-white px-2 rounded border">Pot: ${idea.potential}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Logs -->
        <div class="bg-slate-900 text-slate-300 p-4 rounded-2xl h-48 overflow-y-auto font-mono text-xs" id="log-container">
           <!-- Logs injected here -->
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
           <div class="flex border-b text-xs font-bold">
             ${['ACADEMICS', 'LIFE', 'SOCIAL', 'SELF_IMPROVEMENT'].map(tab => `
               <button onclick="window.setTab('${tab}')" class="flex-1 py-3 hover:bg-slate-50 ${state.activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}">
                 ${tab.slice(0,4)}
               </button>
             `).join('')}
           </div>
           <div id="actions-list" class="p-2 space-y-2 overflow-y-auto flex-1">
             <!-- Actions injected here -->
           </div>
        </div>
      </div>
    </div>
  `;
}

function renderActions() {
  const container = document.getElementById('actions-list');
  if (!container) return;
  
  const allActions = [...Object.values(ACTIONS_DATA)];
  if(state.background.exclusiveActions) allActions.push(...state.background.exclusiveActions);
  if(state.supervisor.exclusiveActions) allActions.push(...state.supervisor.exclusiveActions);

  const actions = allActions.filter(a => a.category === state.activeTab);
  
  container.innerHTML = actions.map(action => `
    <button onclick="window.handleAction('${action.id}')" class="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group relative">
      <div class="font-bold text-sm text-slate-700 group-hover:text-indigo-700">${action.label}</div>
      <div class="text-[10px] text-slate-500 leading-tight my-1">${action.description}</div>
      <div class="flex justify-end gap-2 text-[10px] font-mono font-bold text-slate-400">
        ${action.cost.energy ? `<span>-${action.cost.energy} En</span>` : ''}
        ${action.cost.funds ? `<span>-$${action.cost.funds}</span>` : ''}
      </div>
    </button>
  `).join('');
  
  lucide.createIcons();
}

function renderLogs() {
  const container = document.getElementById('log-container');
  if (!container) return;
  container.innerHTML = state.logs.map(l => `
    <div class="mb-1 ${l.type === 'danger' ? 'text-red-400' : l.type === 'success' ? 'text-emerald-400' : ''}">
      <span class="opacity-50 mr-2">[W${l.turn}]</span> ${l.msg}
    </div>
  `).join('');
}

function renderModal() {
  if (!state.modal) {
    modalContainer.classList.remove('active');
    setTimeout(() => modalContainer.innerHTML = '', 300);
    return;
  }
  
  modalContainer.classList.add('active');
  const { type, data } = state.modal;
  
  let content = '';
  if (type === 'EVENT') {
    content = `
      <div class="modal-content bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
        <h2 class="serif text-2xl font-bold mb-2 ${data.type === 'good' ? 'text-emerald-600' : 'text-red-600'}">${data.title}</h2>
        <p class="text-slate-600 mb-6">${data.description}</p>
        <button onclick="window.closeModal()" class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Okay</button>
      </div>
    `;
  } else if (type === 'IDEA') {
    content = `
      <div class="modal-content bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <h2 class="serif text-xl font-bold mb-2">${data.title}</h2>
        <p class="text-sm text-slate-600 italic mb-4">"${data.description}"</p>
        <div class="grid grid-cols-2 gap-2 text-xs mb-6">
           <div class="bg-slate-100 p-2 rounded">Difficulty: ${data.difficulty}</div>
           <div class="bg-slate-100 p-2 rounded">Potential: ${data.potential}</div>
           <div class="bg-slate-100 p-2 rounded">Feasibility: ${data.feasibility}</div>
           <div class="bg-slate-100 p-2 rounded">Resources: ${data.resources}</div>
        </div>
        <div class="flex gap-2">
          <button onclick="window.closeModal()" class="flex-1 py-2 border rounded-lg font-bold text-slate-500">Cancel</button>
          <button onclick="window.startProject(${data.id})" class="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">Start (-20 En)</button>
        </div>
      </div>
    `;
  }
  
  modalContainer.innerHTML = content;
}

function render() {
  if (state.phase === 'SETUP') {
    app.innerHTML = renderSetup();
  } else {
    app.innerHTML = renderGame();
    renderLogs();
    renderActions();
  }
  renderModal();
  lucide.createIcons();
}

// Initial Render
render();
