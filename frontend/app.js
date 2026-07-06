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

    async verifyOTP(email, otp) {
        const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Verification failed');
        }
        return await res.json();
    },

    async forgotPassword(email) {
        const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to send reset link');
        }
        return await res.json();
    },

    async resetPassword(token, newPassword) {
        const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, new_password: newPassword })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Reset failed');
        }
        return await res.json();
    },

    async googleLogin(credential) {
        const res = await fetch(`${API_BASE}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Google Login failed');
        }
        const data = await res.json();
        const user = data.user || null;
        this.setAuth(data.access_token, user);
        return user;
    },

    async microsoftLogin(accessToken) {
        const res = await fetch(`${API_BASE}/api/auth/microsoft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: accessToken })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Microsoft Login failed');
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
        showNotification('Registration successful! Logging you in...');
        await Auth.login(email, password);
        closeModal();
        window.location.href = '/dashboard';
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'google-login') {
        const email = event.data.email;
        const name = event.data.name;
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(JSON.stringify({ 
            sub: "mock-google-id-" + Date.now(), 
            email: email, 
            name: name, 
            aud: "mock-client-id", 
            iss: "https://accounts.google.com" 
        }));
        const mockToken = `mock_${header}.${payload}.signature`;
        
        try {
            showNotification('Logging in with Google...');
            await Auth.googleLogin(mockToken);
            showNotification('Google Login Successful!');
            closeModal();
            window.location.href = '/dashboard';
        } catch (err) {
            showNotification(err.message, 'error');
        }
    } else if (event.data && event.data.type === 'microsoft-login') {
        try {
            showNotification('Logging in with Windows...');
            await Auth.microsoftLogin("mock_microsoft_token");
            showNotification('Microsoft Login Successful!');
            closeModal();
            window.location.href = '/dashboard';
        } catch (err) {
            showNotification(err.message, 'error');
        }
    }
});

function showForgotPasswordModal() {
    showModal('Forgot Password', `
        <form onsubmit="handleForgotPassword(event)">
            <div class="space-y-4">
                <p class="text-sm text-gray-500">Enter your email to receive a reset token.</p>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input id="forgot-email" type="email" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <button type="submit" class="w-full bg-brand-blue text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Send Reset Token</button>
                <p class="text-center text-sm text-gray-500"><a href="#" onclick="showResetPasswordModal()" class="text-brand-blue font-semibold hover:underline">I already have a token</a></p>
                <p class="text-center text-sm text-gray-500"><a href="#" onclick="showLoginModal()" class="text-gray-500 hover:underline">Back to Login</a></p>
            </div>
        </form>
    `);
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    try {
        await Auth.forgotPassword(email);
        showNotification('If registered, a reset token was sent to your email.');
        showResetPasswordModal();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

function showResetPasswordModal() {
    showModal('Reset Password', `
        <form onsubmit="handleResetPassword(event)">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
                    <input id="reset-token" type="text" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input id="reset-new-password" type="password" required minlength="6" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue">
                </div>
                <button type="submit" class="w-full bg-brand-blue text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Update Password</button>
            </div>
        </form>
    `);
}

async function handleResetPassword(e) {
    e.preventDefault();
    const token = document.getElementById('reset-token').value;
    const newPassword = document.getElementById('reset-new-password').value;
    try {
        await Auth.resetPassword(token, newPassword);
        showNotification('Password updated! You can now login.');
        showLoginModal();
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
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <button type="button" onclick="loginWithGoogle()" class="flex-1 flex items-center justify-center border border-gray-200 rounded-xl py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Google
                </button>
                <button type="button" onclick="loginWithMicrosoft()" class="flex-1 flex items-center justify-center border border-gray-200 rounded-xl py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg class="w-4 h-4 mr-2" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#f35022" d="M0 0h11v11H0z"/>
                      <path fill="#80bb0a" d="M12 0h11v11H12z"/>
                      <path fill="#00a1f1" d="M0 12h11v11H0z"/>
                      <path fill="#ffb900" d="M12 12h11v11H12z"/>
                    </svg>
                    Windows
                </button>
            </div>
            
            <div class="relative flex py-1 items-center">
                <div class="flex-grow border-t border-gray-200"></div>
                <span class="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase">Or email</span>
                <div class="flex-grow border-t border-gray-200"></div>
            </div>

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
                    <div class="flex items-center justify-between mt-2">
                        <p class="text-sm text-gray-500">Don't have an account? <a href="#" onclick="showRegisterModal()" class="text-brand-blue font-semibold hover:underline">Sign up</a></p>
                        <a href="#" onclick="showForgotPasswordModal()" class="text-sm font-medium text-gray-500 hover:text-brand-blue hover:underline">Forgot Password?</a>
                    </div>
                </div>
            </form>
        </div>
    `);
}

function showRegisterModal() {
    showModal('Let\'s get you started for FREE', `
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <button type="button" onclick="loginWithGoogle()" class="flex-1 flex items-center justify-center border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Sign up with Google
                </button>
                <button type="button" onclick="loginWithMicrosoft()" class="flex-1 flex items-center justify-center border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg class="w-4 h-4 mr-2" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#f35022" d="M0 0h11v11H0z"/>
                      <path fill="#80bb0a" d="M12 0h11v11H12z"/>
                      <path fill="#00a1f1" d="M0 12h11v11H0z"/>
                      <path fill="#ffb900" d="M12 12h11v11H12z"/>
                    </svg>
                    Sign up with Windows
                </button>
            </div>
            
            <div class="relative flex py-1 items-center">
                <div class="flex-grow border-t border-gray-200"></div>
                <span class="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase">Or email</span>
                <div class="flex-grow border-t border-gray-200"></div>
            </div>

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
                    
                    <p class="text-xs text-gray-400 mt-2 text-center">By continuing, you agree to platform's <a href="#" class="underline hover:text-gray-600">Privacy Policy</a> and <a href="#" class="underline hover:text-gray-600">Terms and Conditions</a></p>
                    
                    <button type="submit" class="w-full bg-brand-blue text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Sign up</button>
                    <p class="text-center text-sm text-gray-500">Already have an account? <a href="#" onclick="showLoginModal()" class="text-brand-blue font-semibold">Login</a></p>
                </div>
            </form>
        </div>
    `);
}

function loginWithGoogle() {
    const width = 500;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    const popup = window.open("", "GoogleSignIn", `width=${width},height=${height},left=${left},top=${top}`);
    popup.document.write(\`
        <html>
        <head>
            <title>Sign in - Google Accounts</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Roboto', sans-serif; }
            </style>
        </head>
        <body class="bg-gray-50 flex items-center justify-center h-full p-6">
            <div class="bg-white rounded-lg shadow-md w-full max-w-md p-8 border border-gray-200">
                <div class="flex flex-col items-center mb-6">
                    <svg class="w-12 h-12 mb-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <h1 class="text-xl font-medium text-gray-900">Sign in with Google</h1>
                    <p class="text-sm text-gray-500 mt-1">to continue to VendFusion</p>
                </div>
                
                <div class="space-y-3">
                    <button onclick="selectAccount('mritunjaykumar77639140@gmail.com', 'Mritunjay Kumar')" class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">MK</div>
                        <div>
                            <div class="text-sm font-medium text-gray-700">Mritunjay Kumar</div>
                            <div class="text-xs text-gray-500">mritunjaykumar77639140@gmail.com</div>
                        </div>
                    </button>
                    <button onclick="selectAccount('demo.google.user@gmail.com', 'Demo Google User')" class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold mr-3">DU</div>
                        <div>
                            <div class="text-sm font-medium text-gray-700">Demo Google User</div>
                            <div class="text-xs text-gray-500">demo.google.user@gmail.com</div>
                        </div>
                    </button>
                </div>
            </div>
            <script>
                function selectAccount(email, name) {
                    window.opener.postMessage({ type: 'google-login', email: email, name: name }, '*');
                    window.close();
                }
            </script>
        </body>
        </html>
    \`);
}

function loginWithMicrosoft() {
    const width = 500;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    const popup = window.open("", "MicrosoftSignIn", \`width=\${width},height=\${height},left=\${left},top=\${top}\`);
    popup.document.write(\`
        <html>
        <head>
            <title>Sign in to your Microsoft account</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 flex items-center justify-center h-full p-6">
            <div class="bg-white shadow-md w-full max-w-md p-8 border border-gray-200" style="border-top: 4px solid #00a1f1;">
                <div class="mb-6">
                    <svg class="w-8 h-8 mb-4" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#f35022" d="M0 0h11v11H0z"/>
                      <path fill="#80bb0a" d="M12 0h11v11H12z"/>
                      <path fill="#00a1f1" d="M0 12h11v11H0z"/>
                      <path fill="#ffb900" d="M12 12h11v11H12z"/>
                    </svg>
                    <h1 class="text-xl font-semibold text-gray-900">Sign in</h1>
                </div>
                <div class="space-y-3">
                    <button onclick="selectAccount('demo.windows.user@outlook.com', 'Demo Windows User')" class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">WU</div>
                        <div>
                            <div class="text-sm font-medium text-gray-700">Demo Windows User</div>
                            <div class="text-xs text-gray-500">demo.windows.user@outlook.com</div>
                        </div>
                    </button>
                </div>
            </div>
            <script>
                function selectAccount(email, name) {
                    window.opener.postMessage({ type: 'microsoft-login', email: email, name: name }, '*');
                    window.close();
                }
            </script>
        </body>
        </html>
    \`);
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
