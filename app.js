const API_BASE = window.location.origin;

// ============ Auth Module ============
const Auth = {
    token: localStorage.getItem('vf_token'),
    user: JSON.parse(localStorage.getItem('vf_user') || 'null'),

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('vf_token', token);
        localStorage.setItem('vf_user', JSON.stringify(user));
        this.updateUI();
    },

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('vf_token');
        localStorage.removeItem('vf_user');
        this.updateUI();
    },

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
        return headers;
    },

    async register(email, password, fullName, companyName) {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name: fullName, company_name: companyName })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Registration failed');
        }
        return await res.json();
    },

    async login(email, password) {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Login failed');
        }
        const data = await res.json();
        const user = data.user || null;
        this.setAuth(data.access_token, user);
        return user;
    },

    updateUI() {
        const authBtns = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const mobileAuth = document.getElementById('mobile-auth');
        const mobileUser = document.getElementById('mobile-user');
        if (this.user && authBtns && userMenu) {
            authBtns.style.display = 'none';
            userMenu.style.display = 'flex';
            userMenu.style.alignItems = 'center';
            userMenu.style.gap = '12px';
            if (mobileAuth) mobileAuth.classList.add('hidden');
            if (mobileUser) mobileUser.classList.remove('hidden');
            const nameEl = document.getElementById('user-name');
            if (nameEl) nameEl.textContent = this.user.full_name || this.user.email;
        } else if (authBtns && userMenu) {
            authBtns.style.display = 'flex';
            authBtns.style.alignItems = 'center';
            authBtns.style.gap = '12px';
            userMenu.style.display = 'none';
            if (mobileAuth) mobileAuth.classList.remove('hidden');
            if (mobileUser) mobileUser.classList.add('hidden');
        }
    }
};

// ============ Leads Module ============
const Leads = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/api/leads/?${query}`, {
            headers: Auth.getHeaders()
        });
        return await res.json();
    },

    async create(data) {
        const res = await fetch(`${API_BASE}/api/leads/`, {
            method: 'POST',
            headers: Auth.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to create lead');
        }
        return await res.json();
    },

    async update(id, data) {
        const res = await fetch(`${API_BASE}/api/leads/${id}`, {
            method: 'PUT',
            headers: Auth.getHeaders(),
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    async delete(id) {
        const res = await fetch(`${API_BASE}/api/leads/${id}`, {
            method: 'DELETE',
            headers: Auth.getHeaders()
        });
        return await res.json();
    },

    async bulkImport(leads) {
        const res = await fetch(`${API_BASE}/api/leads/bulk`, {
            method: 'POST',
            headers: Auth.getHeaders(),
            body: JSON.stringify({ leads })
        });
        return await res.json();
    },

    async getStats() {
        const res = await fetch(`${API_BASE}/api/leads/stats/summary`, {
            headers: Auth.getHeaders()
        });
        return await res.json();
    }
};

// ============ Campaigns Module ============
const Campaigns = {
    async getAll() {
        const res = await fetch(`${API_BASE}/api/campaigns/`, {
            headers: Auth.getHeaders()
        });
        return await res.json();
    },

    async create(data) {
        const res = await fetch(`${API_BASE}/api/campaigns/`, {
            method: 'POST',
            headers: Auth.getHeaders(),
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    async update(id, data) {
        const res = await fetch(`${API_BASE}/api/campaigns/${id}`, {
            method: 'PUT',
            headers: Auth.getHeaders(),
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    async send(id) {
        const res = await fetch(`${API_BASE}/api/campaigns/${id}/send`, {
            method: 'POST',
            headers: Auth.getHeaders()
        });
        return await res.json();
    },

    async getStats(id) {
        const res = await fetch(`${API_BASE}/api/campaigns/${id}/stats`, {
            headers: Auth.getHeaders()
        });
        return await res.json();
    }
};

// ============ AI Module ============
const AI = {
    async generateEmail(leadId, campaignId, tone = 'professional', context = '') {
        const res = await fetch(`${API_BASE}/api/ai/generate-email`, {
            method: 'POST',
            headers: Auth.getHeaders(),
            body: JSON.stringify({
                lead_id: leadId,
                campaign_id: campaignId,
                tone,
                additional_context: context
            })
        });
        return await res.json();
    },

    async generateBulk(leadIds, campaignId, tone = 'professional') {
        const res = await fetch(`${API_BASE}/api/ai/generate-bulk`, {
            method: 'POST',
            headers: Auth.getHeaders(),
            body: JSON.stringify({ lead_ids: leadIds, campaign_id: campaignId, tone })
        });
        return await res.json();
    }
};

// ============ Mailboxes Module ============
const Mailboxes = {
    async getAll() {
        const res = await fetch(`${API_BASE}/api/mailboxes/`, {
            headers: Auth.getHeaders()
        });
        return await res.json();
    },

    async create(data) {
        const res = await fetch(`${API_BASE}/api/mailboxes/`, {
            method: 'POST',
            headers: Auth.getHeaders(),
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    async startWarmup(id) {
        const res = await fetch(`${API_BASE}/api/mailboxes/${id}/warmup`, {
            method: 'POST',
            headers: Auth.getHeaders()
        });
        return await res.json();
    },

    async getStats() {
        const res = await fetch(`${API_BASE}/api/mailboxes/stats/overview`, {
            headers: Auth.getHeaders()
        });
        return await res.json();
    }
};

// ============ Dashboard Module ============
const Dashboard = {
    async getStats() {
        const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
            headers: Auth.getHeaders()
        });
        return await res.json();
    },

    async getRecentActivity() {
        const res = await fetch(`${API_BASE}/api/dashboard/recent-activity`, {
            headers: Auth.getHeaders()
        });
        return await res.json();
    },

    async getPerformance() {
        const res = await fetch(`${API_BASE}/api/dashboard/performance`, {
            headers: Auth.getHeaders()
        });
        return await res.json();
    }
};

// ============ CRM Module ============
const CRM = {
    async getStatus() {
        const res = await fetch(`${API_BASE}/api/crm/status`, {
            headers: Auth.getHeaders()
        });
        return await res.json();
    },

    async syncToHubspot(leadIds) {
        const res = await fetch(`${API_BASE}/api/crm/hubspot/sync`, {
            method: 'POST',
            headers: Auth.getHeaders(),
            body: JSON.stringify(leadIds)
        });
        return await res.json();
    },

    async syncToZoho(leadIds) {
        const res = await fetch(`${API_BASE}/api/crm/zoho/sync`, {
            method: 'POST',
            headers: Auth.getHeaders(),
            body: JSON.stringify(leadIds)
        });
        return await res.json();
    }
};

// ============ UI Helpers ============
function showNotification(message, type = 'success') {
    const existing = document.getElementById('notification');
    if (existing) existing.remove();

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    const div = document.createElement('div');
    div.id = 'notification';
    div.className = `fixed top-4 right-4 z-50 ${colors[type]} text-white px-6 py-3 rounded-xl shadow-lg transition-all transform translate-x-0`;
    div.textContent = message;
    document.body.appendChild(div);

    setTimeout(() => {
        div.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

function showModal(title, content) {
    let modal = document.getElementById('app-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'app-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden';
        modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold font-jakarta">${title}</h3>
                <button onclick="this.closest('#app-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div id="modal-content">${content}</div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('app-modal');
    if (modal) modal.classList.add('hidden');
}

// ============ Form Handlers ============
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const user = await Auth.login(email, password);
        showNotification(`Welcome back, ${user.full_name || user.email}!`);
        closeModal();
        window.location.href = '/dashboard';
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const name = document.getElementById('reg-name').value;
    const company = document.getElementById('reg-company').value;

    try {
        await Auth.register(email, password, name, company);
        await Auth.login(email, password);
        showNotification('Account created successfully!');
        closeModal();
        window.location.href = '/dashboard';
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

async function handleAddLead(e) {
    e.preventDefault();
    const data = {
        first_name: document.getElementById('lead-firstname').value,
        last_name: document.getElementById('lead-lastname').value,
        email: document.getElementById('lead-email').value,
        company: document.getElementById('lead-company').value,
        job_title: document.getElementById('lead-jobtitle').value,
    };

    try {
        await Leads.create(data);
        showNotification('Lead added successfully!');
        closeModal();
        loadLeads();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

async function handleAddCampaign(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('campaign-name').value,
        description: document.getElementById('campaign-desc').value,
        subject_template: document.getElementById('campaign-subject').value,
        body_template: document.getElementById('campaign-body').value,
    };

    try {
        await Campaigns.create(data);
        showNotification('Campaign created!');
        closeModal();
        loadCampaigns();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

async function handleAddMailbox(e) {
    e.preventDefault();
    const data = {
        email_address: document.getElementById('mailbox-email').value,
        provider: document.getElementById('mailbox-provider').value,
    };

    try {
        await Mailboxes.create(data);
        showNotification('Mailbox added!');
        closeModal();
        loadMailboxes();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

// ============ Page Loaders ============
async function loadDashboard() {
    if (!Auth.token) return;

    try {
        const stats = await Dashboard.getStats();
        updateDashboardUI(stats);
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

function updateDashboardUI(stats) {
    const els = {
        'stat-leads': stats.total_leads,
        'stat-campaigns': stats.active_campaigns,
        'stat-sent': stats.emails_sent,
        'stat-opened': stats.emails_opened,
        'stat-replied': stats.emails_replied,
        'stat-meetings': stats.meetings_booked,
        'stat-open-rate': stats.open_rate + '%',
        'stat-reply-rate': stats.reply_rate + '%',
    };

    for (const [id, value] of Object.entries(els)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

async function loadLeads() {
    if (!Auth.token) return;

    try {
        const leads = await Leads.getAll();
        renderLeads(leads);
    } catch (err) {
        console.error('Leads load error:', err);
    }
}

function renderLeads(leads) {
    const container = document.getElementById('leads-list');
    if (!container) return;

    if (leads.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No leads yet. Add your first lead!</p>';
        return;
    }

    container.innerHTML = leads.map(lead => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-semibold text-sm">
                    ${(lead.first_name || '?')[0]}${(lead.last_name || '?')[0]}
                </div>
                <div>
                    <div class="font-semibold text-sm">${lead.first_name} ${lead.last_name}</div>
                    <div class="text-xs text-gray-500">${lead.email}</div>
                    <div class="text-xs text-gray-400">${lead.company || ''} ${lead.job_title ? '- ' + lead.job_title : ''}</div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                ${lead.is_qualified ? '<span class="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Qualified</span>' : ''}
                <button onclick="deleteLead(${lead.id})" class="text-gray-400 hover:text-red-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </div>
        </div>
    `).join('');
}

async function deleteLead(id) {
    if (!confirm('Delete this lead?')) return;
    try {
        await Leads.delete(id);
        showNotification('Lead deleted');
        loadLeads();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

async function loadCampaigns() {
    if (!Auth.token) return;

    try {
        const campaigns = await Campaigns.getAll();
        renderCampaigns(campaigns);
    } catch (err) {
        console.error('Campaigns load error:', err);
    }
}

function renderCampaigns(campaigns) {
    const container = document.getElementById('campaigns-list');
    if (!container) return;

    if (campaigns.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No campaigns yet. Create your first campaign!</p>';
        return;
    }

    const statusColors = {
        draft: 'bg-gray-100 text-gray-600',
        active: 'bg-green-100 text-green-600',
        paused: 'bg-yellow-100 text-yellow-600',
        completed: 'bg-blue-100 text-blue-600'
    };

    container.innerHTML = campaigns.map(c => `
        <div class="p-4 bg-gray-50 rounded-xl">
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold">${c.name}</h4>
                <span class="text-xs px-2 py-0.5 rounded-full ${statusColors[c.status] || ''}">${c.status}</span>
            </div>
            <p class="text-sm text-gray-500 mb-3">${c.description || 'No description'}</p>
            <div class="flex items-center gap-4 text-xs text-gray-500">
                <span>Sent: ${c.emails_sent}</span>
                <span>Opened: ${c.emails_opened}</span>
                <span>Replied: ${c.emails_replied}</span>
            </div>
            <div class="flex items-center gap-2 mt-3">
                ${c.status === 'draft' ? `<button onclick="sendCampaign(${c.id})" class="text-xs bg-brand-blue text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Send</button>` : ''}
                <button onclick="generateEmailsForCampaign(${c.id})" class="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">AI Generate</button>
            </div>
        </div>
    `).join('');
}

async function sendCampaign(id) {
    try {
        await Campaigns.send(id);
        showNotification('Campaign sending started!');
        loadCampaigns();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

async function generateEmailsForCampaign(campaignId) {
    try {
        const leads = await Leads.getAll();
        if (leads.length === 0) {
            showNotification('No leads to generate emails for', 'error');
            return;
        }
        const leadIds = leads.slice(0, 5).map(l => l.id);
        const result = await AI.generateBulk(leadIds, campaignId);
        showNotification(`Generated ${result.emails_generated} personalized emails!`);
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

async function loadMailboxes() {
    if (!Auth.token) return;

    try {
        const mailboxes = await Mailboxes.getAll();
        renderMailboxes(mailboxes);
    } catch (err) {
        console.error('Mailboxes load error:', err);
    }
}

function renderMailboxes(mailboxes) {
    const container = document.getElementById('mailboxes-list');
    if (!container) return;

    if (mailboxes.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No mailboxes connected. Add one!</p>';
        return;
    }

    container.innerHTML = mailboxes.map(m => `
        <div class="p-4 bg-gray-50 rounded-xl">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full ${m.is_active ? 'bg-green-400' : 'bg-gray-300'}"></div>
                    <span class="font-semibold text-sm">${m.email_address}</span>
                </div>
                <span class="text-xs text-gray-500">${m.provider || 'Custom'}</span>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-500 mb-2">
                <span>Daily limit: ${m.daily_limit}</span>
                <span>Warmup: ${m.warmup_score}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div class="bg-brand-blue h-1.5 rounded-full" style="width: ${m.warmup_score}%"></div>
            </div>
            <div class="flex items-center gap-2">
                ${!m.is_warmed ? `<button onclick="warmupMailbox(${m.id})" class="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">Warmup</button>` : '<span class="text-xs text-green-600">Warmed</span>'}
            </div>
        </div>
    `).join('');
}

async function warmupMailbox(id) {
    try {
        await Mailboxes.startWarmup(id);
        showNotification('Warmup started!');
        loadMailboxes();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

// ============ Show Forms ============
function showLoginModal() {
    showModal('Login to VendFusion', `
        <form onsubmit="handleLogin(event)">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input id="login-email" type="email" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input id="login-password" type="password" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <button type="submit" class="w-full bg-brand-blue text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Login</button>
                <p class="text-center text-sm text-gray-500">Don't have an account? <a href="#" onclick="showRegisterModal()" class="text-brand-blue font-semibold">Sign up</a></p>
            </div>
        </form>
    `);
}

function showRegisterModal() {
    showModal('Create Account', `
        <form onsubmit="handleRegister(event)">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input id="reg-name" type="text" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input id="reg-company" type="text" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input id="reg-email" type="email" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input id="reg-password" type="password" required minlength="6" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <button type="submit" class="w-full bg-brand-blue text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Create Account</button>
                <p class="text-center text-sm text-gray-500">Already have an account? <a href="#" onclick="showLoginModal()" class="text-brand-blue font-semibold">Login</a></p>
            </div>
        </form>
    `);
}

function showAddLeadModal() {
    showModal('Add New Lead', `
        <form onsubmit="handleAddLead(event)">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input id="lead-firstname" type="text" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input id="lead-lastname" type="text" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input id="lead-email" type="email" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input id="lead-company" type="text" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input id="lead-jobtitle" type="text" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <button type="submit" class="w-full bg-brand-blue text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Add Lead</button>
            </div>
        </form>
    `);
}

function showAddCampaignModal() {
    showModal('Create Campaign', `
        <form onsubmit="handleAddCampaign(event)">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input id="campaign-name" type="text" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input id="campaign-desc" type="text" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email Subject Template</label>
                    <input id="campaign-subject" type="text" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue" placeholder="AI will personalize this">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email Body Template</label>
                    <textarea id="campaign-body" rows="4" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue" placeholder="AI will personalize this"></textarea>
                </div>
                <button type="submit" class="w-full bg-brand-blue text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Create Campaign</button>
            </div>
        </form>
    `);
}

function showAddMailboxModal() {
    showModal('Add Mailbox', `
        <form onsubmit="handleAddMailbox(event)">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input id="mailbox-email" type="email" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                    <select id="mailbox-provider" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                        <option value="gmail">Gmail</option>
                        <option value="outlook">Outlook</option>
                        <option value="custom">Custom SMTP</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-brand-blue text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Add Mailbox</button>
            </div>
        </form>
    `);
}

// ============ Navigation ============
const routes = {
    '': 'home',
    'dashboard': 'dashboard',
    'leads': 'leads',
    'campaigns': 'campaigns',
    'mailboxes': 'mailboxes',
    'integrations': 'integrations',
    'pricing': 'pricing',
};

function navigateTo(path) {
    window.history.pushState({}, '', path);
    handleRoute();
}

function handleRoute() {
    const path = window.location.pathname.replace(/^\//, '').split('/')[0];
    const section = routes[path] || 'home';
    showSection(section);
}

function showSection(section) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`section-${section}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('text-brand-blue', 'font-semibold');
        el.classList.add('text-gray-600');
    });
    const navEl = document.querySelector(`[data-nav="${section}"]`);
    if (navEl) {
        navEl.classList.add('text-brand-blue', 'font-semibold');
        navEl.classList.remove('text-gray-600');
    }

    if (!Auth.token && section !== 'home') {
        showLoginModal();
        return;
    }

    switch(section) {
        case 'dashboard': loadDashboard(); break;
        case 'leads': loadLeads(); break;
        case 'campaigns': loadCampaigns(); break;
        case 'mailboxes': loadMailboxes(); break;
    }
}

// ============ Init ============
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateUI();
    handleRoute();
    window.addEventListener('popstate', handleRoute);
});
