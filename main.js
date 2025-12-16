import { INITIAL_STATS, MAX_STATS, BACKGROUND_POOL, SUPERVISOR_POOL, WEEKLY_RENT, ACTIONS_DATA, COST, CONFIRMATION_TASK, GamePhase } from './constants.js';
import { generateResearchTopic } from './geminiService.js';
import { RANDOM_EVENT_POOL } from './events.js';

// --- STATE ---
const state = {
    phase: GamePhase.SETUP,
    turn: 1,
    stats: JSON.parse(JSON.stringify(INITIAL_STATS)),
    maxStats: JSON.parse(JSON.stringify(MAX_STATS)),
    background: null,
    supervisor: null,
    activeTab: 'ACADEMICS',
    logs: [],
    activeProject: null,
    availableIdeas: [],
    publishedPapers: [],
    modal: null,
    loading: false
};

const app = document.getElementById('app');
const modalContainer = document.getElementById('modal-container');

// --- HELPERS ---
const addLog = (msg, type = 'info') => {
    state.logs.unshift({ id: Date.now(), turn: state.turn, msg, type });
    if(state.phase === GamePhase.PLAYING) render();
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

// --- GLOBAL HANDLERS ---
window.selectBackground = (id) => {
    state.background = BACKGROUND_POOL.find(b => b.id === id);
    render();
};
window.selectSupervisor = (id) => {
    state.supervisor = SUPERVISOR_POOL.find(s => s.id === id);
    render();
};
window.startGame = () => {
    if (!state.background || !state.supervisor) return;
    state.phase = GamePhase.PLAYING;
    updateStats(state.background.initialModifiers);
    updateStats(state.supervisor.initialModifiers);
    addLog(`Started PhD under ${state.supervisor.name}.`);
    render();
};
window.nextWeek = () => {
    state.turn++;
    state.stats.funds -= WEEKLY_RENT;
    const recovery = 50; 
    state.stats.energy = Math.min(state.maxStats.energy, state.stats.energy + recovery);
    state.stats.physiological.stress = Math.max(0, state.stats.physiological.stress - 5);
    
    if (Math.random() < 0.3) {
        const evt = RANDOM_EVENT_POOL[Math.floor(Math.random() * RANDOM_EVENT_POOL.length)];
        updateStats(evt.effect);
        state.modal = { type: 'EVENT', data: evt };
    }
    addLog(`Week ${state.turn} began.`);
    render();
};
window.setTab = (t) => { state.activeTab = t; render(); };
window.handleAction = (id) => {
    const allActions = [...Object.values(ACTIONS_DATA)];
    if(state.background.exclusiveActions) allActions.push(...state.background.exclusiveActions);
    if(state.supervisor.exclusiveActions) allActions.push(...state.supervisor.exclusiveActions);
    
    const action = allActions.find(a => a.id === id);
    if(!action) return;
    
    if ((action.cost.energy && state.stats.energy < action.cost.energy) || (action.cost.funds && state.stats.funds < action.cost.funds)) {
        addLog("Cannot afford action.", 'danger');
        return;
    }
    
    if(action.cost.energy) state.stats.energy -= action.cost.energy;
    if(action.cost.funds) state.stats.funds -= action.cost.funds;
    if(action.cost.physiological) updateStats({physiological: action.cost.physiological});
    
    updateStats(action.effect);
    addLog(action.logMessage);
    
    if(id === 'READ_PAPERS' && Math.random() > 0.5) generateIdea();
    render();
};
window.closeModal = () => { state.modal = null; render(); };
window.inspectIdea = (id) => {
    const idea = state.availableIdeas.find(i => i.id == id);
    if(idea) state.modal = { type: 'IDEA', data: idea };
    render();
};
window.startProject = (id) => {
    const idea = state.availableIdeas.find(i => i.id == id);
    if(state.stats.energy < COST.DEVELOP_IDEA.energy) return;
    state.stats.energy -= COST.DEVELOP_IDEA.energy;
    state.activeProject = { ...idea, progress: 0 };
    state.availableIdeas = state.availableIdeas.filter(i => i.id != id);
    state.modal = null;
    addLog("Started project: " + idea.title);
    render();
};
window.workProject = () => {
    if(!state.activeProject) return;
    if(state.stats.energy < 15) return;
    state.stats.energy -= 15;
    state.activeProject.progress += 15;
    addLog("Made progress on project.");
    if(state.activeProject.progress >= 100) addLog("Project ready!", 'success');
    render();
};

async function generateIdea() {
    state.loading = true; render();
    const idea = await generateResearchTopic("Physics");
    state.availableIdeas.push({ ...idea, id: Date.now() });
    state.loading = false;
    addLog("New Idea: " + idea.title, 'success');
    render();
}

// --- RENDERERS ---
function renderSetup() {
    return `
        <div class="max-w-4xl mx-auto p-8 mt-10 bg-white rounded-xl shadow-xl">
            <h1 class="serif text-4xl font-bold mb-6">Setup Character</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="font-bold mb-2 flex items-center gap-2"><i data-lucide="user"></i> Background</h3>
                    <div class="space-y-3">
                        ${BACKGROUND_POOL.map(b => `
                            <div onclick="window.selectBackground('${b.id}')" class="p-4 border rounded-xl cursor-pointer transition-all ${state.background?.id===b.id?'border-indigo-600 bg-indigo-50 shadow-md':'hover:border-indigo-300 bg-white'}">
                                <div class="font-bold text-slate-800">${b.name}</div>
                                <div class="text-xs text-slate-500 mb-1">${b.education}</div>
                                <div class="text-xs text-slate-600 italic">"${b.description}"</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <h3 class="font-bold mb-2 flex items-center gap-2"><i data-lucide="user-check"></i> Supervisor</h3>
                    <div class="space-y-3">
                        ${SUPERVISOR_POOL.map(s => `
                            <div onclick="window.selectSupervisor('${s.id}')" class="p-4 border rounded-xl cursor-pointer transition-all ${state.supervisor?.id===s.id?'border-indigo-600 bg-indigo-50 shadow-md':'hover:border-indigo-300 bg-white'}">
                                <div class="flex justify-between items-start">
                                    <div class="font-bold text-slate-800">${s.name}</div>
                                    <div class="text-[10px] bg-slate-200 px-2 py-1 rounded font-bold">Rep: ${s.reputation}</div>
                                </div>
                                <div class="text-xs text-slate-500 mb-1">${s.institution}</div>
                                <div class="text-xs text-slate-600 italic">"${s.description}"</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="mt-8 flex justify-end">
                <button onclick="window.startGame()" class="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2" ${(!state.background||!state.supervisor)?'disabled':''}>
                    Start Journey <i data-lucide="arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

function renderGame() {
    const { stats, maxStats } = state;
    return `
        <div class="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
            <!-- HEADER -->
            <div class="lg:col-span-12 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                <div>
                    <h1 class="serif text-xl font-bold text-slate-900">Publish or Perish</h1>
                    <div class="text-sm text-slate-500">Week ${state.turn} • ${state.background.name}</div>
                </div>
                <div class="flex items-center gap-6">
                    <div class="text-right">
                        <div class="text-xs text-slate-400 uppercase font-bold">Funds</div>
                        <div class="font-mono font-bold text-xl ${stats.funds<0?'text-red-500':'text-emerald-600'}">$${stats.funds}</div>
                    </div>
                    <button onclick="window.nextWeek()" class="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 shadow-sm transition-colors">
                        Next Week <i data-lucide="calendar-clock"></i>
                    </button>
                </div>
            </div>
            
            <!-- LEFT: STATS -->
            <div class="lg:col-span-3 space-y-4">
                <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h3 class="font-bold border-b pb-2 mb-4 text-slate-700">Vitals</h3>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between text-xs font-bold text-slate-600 mb-1"><span>Energy</span><span>${Math.round(stats.energy)}/${maxStats.energy}</span></div>
                            <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-yellow-400" style="width:${(stats.energy/maxStats.energy)*100}%"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-xs font-bold text-slate-600 mb-1"><span>Stress</span><span>${Math.round(stats.physiological.stress)}%</span></div>
                            <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-rose-500" style="width:${(stats.physiological.stress/maxStats.physiological.stress)*100}%"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-xs font-bold text-slate-600 mb-1"><span>Sanity</span><span>${Math.round(stats.physiological.sanity)}%</span></div>
                            <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-indigo-500" style="width:${(stats.physiological.sanity/maxStats.physiological.sanity)*100}%"></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MID: WORKSPACE -->
            <div class="lg:col-span-6 space-y-6">
                <!-- ACTIVE PROJECT -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[200px]">
                    ${state.activeProject ? `
                        <div class="border-l-4 border-indigo-600 pl-4">
                            <div class="text-xs font-bold text-indigo-600 uppercase mb-1">Active Research</div>
                            <h3 class="serif text-xl font-bold mb-3 text-slate-900">${state.activeProject.title}</h3>
                            <div class="mb-4">
                                <div class="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Progress</span><span>${Math.round(state.activeProject.progress)}%</span></div>
                                <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div class="bg-indigo-600 h-full transition-all duration-500" style="width:${state.activeProject.progress}%"></div></div>
                            </div>
                            <button onclick="window.workProject()" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                <i data-lucide="microscope"></i> Conduct Research (-15 En)
                            </button>
                        </div>
                    ` : `
                        <div class="flex flex-col items-center justify-center h-full py-8 text-slate-400">
                            <i data-lucide="flask-conical" class="mb-3" width="40" height="40"></i>
                            <p>No Active Project. Select an idea from your notebook.</p>
                        </div>
                    `}
                </div>

                <!-- NOTEBOOK -->
                <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h3 class="font-bold mb-4 text-slate-700 flex items-center gap-2"><i data-lucide="book"></i> Idea Notebook</h3>
                    <div class="space-y-3 max-h-60 overflow-y-auto pr-2">
                        ${state.availableIdeas.map(i => `
                            <div onclick="window.inspectIdea(${i.id})" class="p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all group">
                                <div class="font-bold text-sm text-slate-800 group-hover:text-indigo-700">${i.title}</div>
                                <div class="flex gap-2 mt-2">
                                    <span class="text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-500">Pot: ${i.potential}</span>
                                    <span class="text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-500">Diff: ${i.difficulty}</span>
                                </div>
                            </div>
                        `).join('')}
                        ${state.availableIdeas.length===0 ? '<div class="text-sm text-slate-400 italic">Read papers or attend seminars to generate ideas.</div>' : ''}
                    </div>
                </div>

                <!-- LOGS -->
                <div class="bg-slate-900 text-slate-300 p-4 rounded-xl h-48 overflow-y-auto text-xs font-mono shadow-inner custom-scrollbar">
                    ${state.logs.map(l => `<div class="mb-1.5 leading-relaxed ${l.type === 'danger' ? 'text-red-400' : l.type === 'success' ? 'text-emerald-400' : ''}"><span class="opacity-40 mr-2">[W${l.turn}]</span> ${l.msg}</div>`).join('')}
                </div>
            </div>

            <!-- RIGHT: ACTIONS -->
            <div class="lg:col-span-3">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] flex flex-col overflow-hidden">
                    <div class="flex text-[10px] font-bold border-b bg-slate-50">
                        ${['ACADEMICS','LIFE','SOCIAL','SELF_IMPROVEMENT'].map(t => `
                            <button onclick="window.setTab('${t}')" class="flex-1 py-3 hover:bg-white transition-colors ${state.activeTab===t?'text-indigo-600 border-b-2 border-indigo-600 bg-white':'text-slate-400'}">
                                ${t.slice(0,4)}
                            </button>
                        `).join('')}
                    </div>
                    <div class="flex-1 overflow-y-auto p-2 space-y-2">
                        ${(() => {
                            const all = [...Object.values(ACTIONS_DATA)];
                            if(state.background.exclusiveActions) all.push(...state.background.exclusiveActions);
                            if(state.supervisor.exclusiveActions) all.push(...state.supervisor.exclusiveActions);
                            return all.filter(a => a.category === state.activeTab).map(a => `
                                <button onclick="window.handleAction('${a.id}')" class="w-full text-left p-3 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group">
                                    <div class="font-bold text-sm text-slate-700 group-hover:text-indigo-700">${a.label}</div>
                                    <div class="text-[10px] text-slate-500 my-1 leading-tight">${a.description}</div>
                                    <div class="text-[10px] font-mono font-bold text-slate-400 flex justify-end gap-2 mt-1">
                                        ${a.cost.energy ? `<span>-${a.cost.energy} En</span>` : ''} 
                                        ${a.cost.funds ? `<span>-$${a.cost.funds}</span>` : ''}
                                    </div>
                                </button>
                            `).join('');
                        })()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderModal() {
    if(!state.modal) {
        modalContainer.classList.remove('active');
        return;
    }
    modalContainer.classList.add('active');
    const { type, data } = state.modal;
    let html = '';
    
    if(type === 'EVENT') {
        html = `
            <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full transform scale-100 transition-transform">
                <h2 class="serif font-bold text-2xl mb-2 ${data.type === 'good' ? 'text-emerald-600' : 'text-red-600'}">${data.title}</h2>
                <p class="text-slate-600 mb-6 leading-relaxed">${data.description}</p>
                <button onclick="window.closeModal()" class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">Okay</button>
            </div>
        `;
    } else if (type === 'IDEA') {
        html = `
            <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
                <h2 class="serif font-bold text-2xl mb-2 text-slate-900">${data.title}</h2>
                <p class="text-slate-600 italic mb-6 text-sm">"${data.description}"</p>
                <div class="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600 mb-6">
                    <div class="bg-slate-100 p-3 rounded-lg flex justify-between"><span>Difficulty</span> <span>${data.difficulty}</span></div>
                    <div class="bg-slate-100 p-3 rounded-lg flex justify-between"><span>Potential</span> <span>${data.potential}</span></div>
                    <div class="bg-slate-100 p-3 rounded-lg flex justify-between"><span>Novelty</span> <span>${data.novelty}</span></div>
                    <div class="bg-slate-100 p-3 rounded-lg flex justify-between"><span>Feasibility</span> <span>${data.feasibility}</span></div>
                </div>
                <div class="flex gap-3">
                    <button onclick="window.closeModal()" class="flex-1 border-2 border-slate-200 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onclick="window.startProject(${data.id})" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Start (-20 En)</button>
                </div>
            </div>
        `;
    }
    modalContainer.innerHTML = html;
}

function render() {
    app.innerHTML = state.phase === GamePhase.SETUP ? renderSetup() : renderGame();
    renderModal();
    if(window.lucide) window.lucide.createIcons();
}

// Init
render();
