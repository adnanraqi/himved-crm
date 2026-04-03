// Himved Herbals CRM - Main JavaScript

// ==================== DATA STORE ====================
const DB = {
    leads: [],
    agents: [],
    currentUser: null,
    
    // Initialize with default admin if no data exists
    init() {
        const storedLeads = localStorage.getItem('himved_leads');
        const storedAgents = localStorage.getItem('himved_agents');
        
        if (storedAgents) {
            this.agents = JSON.parse(storedAgents);
        } else {
            // Create default admin
            this.agents = [{
                id: 'admin',
                name: 'Admin',
                phone: '9999999999',
                loginId: 'admin',
                password: 'admin123',
                status: 'active',
                role: 'admin',
                createdAt: new Date().toISOString(),
                leadsHandled: 0,
                conversions: 0
            }];
            this.saveAgents();
        }
        
        if (storedLeads) {
            this.leads = JSON.parse(storedLeads);
        }
    },
    
    saveLeads() {
        localStorage.setItem('himved_leads', JSON.stringify(this.leads));
    },
    
    saveAgents() {
        localStorage.setItem('himved_agents', JSON.stringify(this.agents));
    }
};

// ==================== PRODUCTS BY CATEGORY ====================
const PRODUCTS = {
    'Psoriasis': ['Psocare Oil', 'Psocare Capsules', 'Psocare Soap', 'Psocare Combo'],
    'Sexual Wellness': ['Shilajit Gold', 'Ashwagandha Plus', 'Safed Musli', 'Confidence Kit']
};

// ==================== PIPELINE STAGES ====================
const STAGES = ['New', 'Attempted', 'Connected', 'Interested', 'Follow-up', 'Converted', 'Closed'];

// ==================== UTILITY FUNCTIONS ====================
function generateId() {
    return 'LEAD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function validatePhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function confirmDelete(message = 'Are you sure you want to delete?') {
    return window.confirm(message);
}

// ==================== AUTHENTICATION ====================
function login(loginId, password) {
    const agent = DB.agents.find(a => a.loginId === loginId && a.password === password);
    
    if (!agent) {
        showToast('Invalid login credentials', 'error');
        return null;
    }
    
    if (agent.status !== 'active') {
        showToast('Your account is deactivated. Contact admin.', 'error');
        return null;
    }
    
    DB.currentUser = agent;
    sessionStorage.setItem('himved_user', JSON.stringify(agent));
    return agent;
}

function logout() {
    DB.currentUser = null;
    sessionStorage.removeItem('himved_user');
    showScreen('login-screen');
}

function checkAuth() {
    const storedUser = sessionStorage.getItem('himved_user');
    if (storedUser) {
        DB.currentUser = JSON.parse(storedUser);
        return true;
    }
    return false;
}

function isAdmin() {
    return DB.currentUser && DB.currentUser.role === 'admin';
}

// ==================== SCREEN MANAGEMENT ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewId) {
            item.classList.add('active');
        }
    });
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'pipeline': 'Pipeline',
        'leads': 'Leads',
        'followups': 'Follow-ups',
        'agents': 'Agent Management',
        'reports': 'Reports'
    };
    document.getElementById('page-title').textContent = titles[viewId] || 'Dashboard';
    
    // Load view data
    loadViewData(viewId);
}

// ==================== VIEW DATA LOADING ====================
function loadViewData(viewId) {
    switch(viewId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'pipeline':
            loadPipeline();
            break;
        case 'leads':
            loadLeadsTable();
            break;
        case 'followups':
            loadFollowups('today');
            break;
        case 'agents':
            if (isAdmin()) loadAgents();
            break;
        case 'reports':
            if (isAdmin()) loadReports();
            break;
    }
}

// ==================== DASHBOARD ====================
function loadDashboard() {
    const today = getTodayDate();
    
    // Filter leads based on user role
    let filteredLeads = DB.leads;
    if (!isAdmin()) {
        filteredLeads = DB.leads.filter(l => l.assignedAgent === DB.currentUser.id);
    }
    
    // Calculate stats
    const totalLeads = filteredLeads.length;
    const conversions = filteredLeads.filter(l => l.status === 'Converted').length;
    const revenue = conversions * 2500; // Assuming average order value
    
    const todayFollowups = filteredLeads.filter(l => {
        return l.followUpDate && l.followUpDate <= today && l.status !== 'Converted' && l.status !== 'Closed';
    }).length;
    
    // Update dashboard stats
    document.getElementById('total-leads').textContent = totalLeads;
    document.getElementById('total-conversions').textContent = conversions;
    document.getElementById('total-revenue').textContent = `₹${revenue.toLocaleString('en-IN')}`;
    document.getElementById('today-followups').textContent = todayFollowups;
    
    // Show/hide admin stats
    const adminStats = document.getElementById('admin-stats');
    if (!isAdmin()) {
        adminStats.style.display = 'grid';
    }
    
    // Agent performance (admin only)
    if (isAdmin()) {
        loadAgentPerformance();
    }
    
    // Recent activity
    loadRecentActivity();
}

function loadAgentPerformance() {
    const container = document.getElementById('agent-performance-table');
    const activeAgents = DB.agents.filter(a => a.status === 'active' && a.role !== 'admin');
    
    if (activeAgents.length === 0) {
        container.innerHTML = '<p class="empty-state">No agents found</p>';
        return;
    }
    
    const html = activeAgents.map(agent => {
        const agentLeads = DB.leads.filter(l => l.assignedAgent === agent.id);
        const conversions = agentLeads.filter(l => l.status === 'Converted').length;
        const conversionRate = agentLeads.length > 0 ? ((conversions / agentLeads.length) * 100).toFixed(1) : 0;
        
        return `
            <div class="agent-card">
                <h3>${agent.name}</h3>
                <p>📞 ${agent.phone}</p>
                <div class="agent-stats">
                    <div class="agent-stat">
                        <strong>${agentLeads.length}</strong>
                        <span>Leads</span>
                    </div>
                    <div class="agent-stat">
                        <strong>${conversions}</strong>
                        <span>Conversions</span>
                    </div>
                    <div class="agent-stat">
                        <strong>${conversionRate}%</strong>
                        <span>Conversion Rate</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    const recentLeads = DB.leads
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
    
    if (recentLeads.length === 0) {
        container.innerHTML = '<p class="empty-state">No recent activity</p>';
        return;
    }
    
    const html = recentLeads.map(lead => {
        const agent = DB.agents.find(a => a.id === lead.assignedAgent);
        return `
            <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                <strong>${lead.name || 'Lead #' + lead.phone.slice(-4)}</strong>
                <br>
                <small class="text-muted">${lead.status} • ${formatDateTime(lead.updatedAt)}</small>
                ${agent ? `<br><small>Agent: ${agent.name}</small>` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// ==================== PIPELINE (KANBAN) ====================
function loadPipeline() {
    const container = document.getElementById('pipeline-board');
    
    // Filter leads based on user role
    let filteredLeads = DB.leads;
    if (!isAdmin()) {
        filteredLeads = DB.leads.filter(l => l.assignedAgent === DB.currentUser.id);
    }
    
    const html = STAGES.map(stage => {
        const stageLeads = filteredLeads.filter(l => l.status === stage);
        
        return `
            <div class="pipeline-column" data-status="${stage}" ondragover="allowDrop(event)" ondrop="drop(event, '${stage}')">
                <div class="column-header">
                    <h3>${stage}</h3>
                    <span class="column-count">${stageLeads.length}</span>
                </div>
                <div class="column-content">
                    ${stageLeads.map(lead => createLeadCard(lead)).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function createLeadCard(lead) {
    const agent = DB.agents.find(a => a.id === lead.assignedAgent);
    return `
        <div class="lead-card" draggable="true" ondragstart="drag(event)" data-lead-id="${lead.id}">
            <h4>${lead.name || 'Lead #' + lead.phone.slice(-4)}</h4>
            <p>📞 ${lead.phone}</p>
            <p>${lead.category}</p>
            <span class="product-tag">${lead.product}</span>
            ${agent && agent.role !== 'admin' ? `<p style="margin-top: 0.5rem; font-size: 0.75rem;">Agent: ${agent.name}</p>` : ''}
            ${lead.followUpDate && lead.status === 'Follow-up' ? `<p style="margin-top: 0.5rem; color: var(--danger-color);">Follow-up: ${formatDate(lead.followUpDate)}</p>` : ''}
        </div>
    `;
}

// Drag and Drop functions
let draggedLeadId = null;

function drag(ev) {
    draggedLeadId = ev.target.dataset.leadId;
    ev.dataTransfer.setData("text", ev.target.dataset.leadId);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev, newStatus) {
    ev.preventDefault();
    const leadId = ev.dataTransfer.getData("text");
    updateLeadStatus(leadId, newStatus);
}

function updateLeadStatus(leadId, newStatus) {
    const lead = DB.leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const oldStatus = lead.status;
    lead.status = newStatus;
    lead.updatedAt = new Date().toISOString();
    
    // Add timeline entry
    lead.timeline = lead.timeline || [];
    lead.timeline.push({
        type: 'status-change',
        from: oldStatus,
        to: newStatus,
        timestamp: new Date().toISOString(),
        user: DB.currentUser.name
    });
    
    // Auto actions based on status
    if (newStatus === 'Converted') {
        lead.convertedAt = new Date().toISOString();
        // Update agent conversions
        const agent = DB.agents.find(a => a.id === lead.assignedAgent);
        if (agent) {
            agent.conversions = (agent.conversions || 0) + 1;
        }
    }
    
    DB.saveLeads();
    DB.saveAgents();
    
    showToast(`Lead moved to ${newStatus}`, 'success');
    loadPipeline();
}

// ==================== LEADS TABLE ====================
function loadLeadsTable() {
    const tbody = document.getElementById('leads-table-body');
    
    // Get filter values
    const search = document.getElementById('search-leads').value.toLowerCase();
    const filterAgent = document.getElementById('filter-agent').value;
    const filterStatus = document.getElementById('filter-status').value;
    const filterProduct = document.getElementById('filter-product').value;
    
    // Filter leads
    let filteredLeads = DB.leads;
    
    if (!isAdmin()) {
        filteredLeads = filteredLeads.filter(l => l.assignedAgent === DB.currentUser.id);
    }
    
    if (search) {
        filteredLeads = filteredLeads.filter(l => 
            (l.name && l.name.toLowerCase().includes(search)) || 
            l.phone.includes(search)
        );
    }
    
    if (filterAgent) {
        filteredLeads = filteredLeads.filter(l => l.assignedAgent === filterAgent);
    }
    
    if (filterStatus) {
        filteredLeads = filteredLeads.filter(l => l.status === filterStatus);
    }
    
    if (filterProduct) {
        filteredLeads = filteredLeads.filter(l => l.product === filterProduct);
    }
    
    // Sort by updated date
    filteredLeads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    if (filteredLeads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No leads found</td></tr>';
        return;
    }
    
    const html = filteredLeads.map(lead => {
        const agent = DB.agents.find(a => a.id === lead.assignedAgent);
        return `
            <tr>
                <td>${lead.name || 'Lead #' + lead.phone.slice(-4)}</td>
                <td>${lead.phone}</td>
                <td>${lead.product}</td>
                <td>${agent ? agent.name : '-'}</td>
                <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
                <td>${formatDate(lead.followUpDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="openLeadDetail('${lead.id}')">View</button>
                        <a href="https://wa.me/91${lead.phone}" target="_blank" class="btn btn-sm whatsapp-btn">WhatsApp</a>
                        ${isAdmin() ? `<button class="btn btn-sm btn-danger" onclick="deleteLead('${lead.id}')">Delete</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = html;
}

// ==================== LEAD DETAIL ====================
let currentLeadId = null;

function openLeadDetail(leadId) {
    currentLeadId = leadId;
    const lead = DB.leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const agent = DB.agents.find(a => a.id === lead.assignedAgent);
    
    document.getElementById('lead-detail-title').textContent = lead.name || 'Lead #' + lead.phone.slice(-4);
    
    // Basic info
    document.getElementById('lead-basic-info').innerHTML = `
        <p><strong>Name:</strong> ${lead.name || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${lead.phone}</p>
        <p><strong>Category:</strong> ${lead.category}</p>
        <p><strong>Product:</strong> ${lead.product}</p>
        <p><strong>Source:</strong> ${lead.source || 'Not specified'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${lead.status}">${lead.status}</span></p>
        <p><strong>Assigned Agent:</strong> ${agent ? agent.name : 'Not assigned'}</p>
        <p><strong>Created:</strong> ${formatDateTime(lead.createdAt)}</p>
        <p><strong>Follow-up Date:</strong> ${formatDate(lead.followUpDate)}</p>
        <div style="margin-top: 1rem;">
            <a href="https://wa.me/91${lead.phone}?text=Hi, this is Himved Herbals" target="_blank" class="whatsapp-btn">
                💬 Open WhatsApp Chat
            </a>
        </div>
    `;
    
    // Load timeline
    loadTimeline(lead);
    
    // Reset call form
    document.getElementById('call-status').value = '';
    document.getElementById('call-remark').value = '';
    document.getElementById('followup-date-container').style.display = 'none';
    document.getElementById('followup-date').value = '';
    
    // Show modal
    document.getElementById('lead-detail-modal').classList.add('active');
}

function loadTimeline(lead) {
    const container = document.getElementById('activity-timeline');
    const timeline = lead.timeline || [];
    
    if (timeline.length === 0) {
        container.innerHTML = '<p class="empty-state">No activity yet</p>';
        return;
    }
    
    const sortedTimeline = timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const html = sortedTimeline.map(item => {
        let text = '';
        let typeClass = item.type;
        
        if (item.type === 'call') {
            text = `<strong>Call:</strong> ${item.status} - ${item.remark || 'No remark'}`;
        } else if (item.type === 'status-change') {
            text = `<strong>Status changed:</strong> ${item.from} → ${item.to} by ${item.user}`;
        } else if (item.type === 'followup') {
            text = `<strong>Follow-up scheduled:</strong> ${formatDate(item.date)} - ${item.remark || 'No remark'}`;
        } else if (item.type === 'created') {
            text = `<strong>Lead created</strong> by ${item.user}`;
        }
        
        return `
            <div class="timeline-item ${typeClass}">
                <div class="timeline-content">
                    <div class="timeline-time">${formatDateTime(item.timestamp)}</div>
                    <div class="timeline-text">${text}</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Call status change handler
document.addEventListener('DOMContentLoaded', () => {
    const callStatusSelect = document.getElementById('call-status');
    if (callStatusSelect) {
        callStatusSelect.addEventListener('change', (e) => {
            const followupContainer = document.getElementById('followup-date-container');
            const followupDate = document.getElementById('followup-date');
            
            if (e.target.value === 'Not Picked' || e.target.value === 'Busy') {
                followupContainer.style.display = 'block';
                // Auto set to next day
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                followupDate.value = tomorrow.toISOString().split('T')[0];
            } else if (e.target.value === 'Interested') {
                followupContainer.style.display = 'none';
            } else if (e.target.value === 'Not Interested') {
                followupContainer.style.display = 'none';
            } else {
                followupContainer.style.display = 'none';
            }
        });
    }
});

// Save call log
document.getElementById('save-call-btn')?.addEventListener('click', () => {
    const callStatus = document.getElementById('call-status').value;
    const remark = document.getElementById('call-remark').value;
    const followupDate = document.getElementById('followup-date').value;
    
    if (!callStatus) {
        showToast('Please select call status', 'error');
        return;
    }
    
    const lead = DB.leads.find(l => l.id === currentLeadId);
    if (!lead) return;
    
    // Add call to timeline
    lead.timeline = lead.timeline || [];
    lead.timeline.push({
        type: 'call',
        status: callStatus,
        remark: remark,
        timestamp: new Date().toISOString(),
        user: DB.currentUser.name
    });
    
    // Auto actions based on call status
    if (callStatus === 'Not Picked' || callStatus === 'Busy') {
        lead.status = 'Attempted';
        if (followupDate) {
            lead.followUpDate = followupDate;
            lead.timeline.push({
                type: 'followup',
                date: followupDate,
                remark: 'Auto-created from call',
                timestamp: new Date().toISOString()
            });
        }
    } else if (callStatus === 'Interested') {
        lead.status = 'Interested';
    } else if (callStatus === 'Not Interested') {
        lead.status = 'Closed';
    } else if (callStatus === 'Picked') {
        lead.status = 'Connected';
    }
    
    lead.updatedAt = new Date().toISOString();
    DB.saveLeads();
    
    showToast('Call log saved', 'success');
    loadTimeline(lead);
    
    // Reset form
    document.getElementById('call-status').value = '';
    document.getElementById('call-remark').value = '';
    document.getElementById('followup-date-container').style.display = 'none';
    document.getElementById('followup-date').value = '';
});

// ==================== FOLLOW-UPS ====================
function loadFollowups(tab) {
    // Update active tab
    document.querySelectorAll('.followup-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    const container = document.getElementById('followups-list');
    const today = getTodayDate();
    
    // Filter leads based on user role
    let filteredLeads = DB.leads.filter(l => l.followUpDate && l.status !== 'Converted' && l.status !== 'Closed');
    
    if (!isAdmin()) {
        filteredLeads = filteredLeads.filter(l => l.assignedAgent === DB.currentUser.id);
    }
    
    let followupLeads = [];
    
    if (tab === 'today') {
        followupLeads = filteredLeads.filter(l => l.followUpDate === today);
    } else if (tab === 'overdue') {
        followupLeads = filteredLeads.filter(l => l.followUpDate < today);
    } else if (tab === 'upcoming') {
        followupLeads = filteredLeads.filter(l => l.followUpDate > today);
    }
    
    if (followupLeads.length === 0) {
        container.innerHTML = '<p class="empty-state">No follow-ups found</p>';
        return;
    }
    
    const html = followupLeads.map(lead => {
        const agent = DB.agents.find(a => a.id === lead.assignedAgent);
        const isOverdue = lead.followUpDate < today;
        
        return `
            <div class="followup-item ${isOverdue ? 'overdue' : ''}">
                <div class="followup-info">
                    <h4>${lead.name || 'Lead #' + lead.phone.slice(-4)}</h4>
                    <p>📞 ${lead.phone} | ${lead.product}</p>
                    <p>Follow-up: ${formatDate(lead.followUpDate)} ${isOverdue ? '(Overdue)' : ''}</p>
                    ${agent ? `<p>Agent: ${agent.name}</p>` : ''}
                </div>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="openLeadDetail('${lead.id}')">View</button>
                    <button class="btn btn-sm btn-success" onclick="markFollowupDone('${lead.id}')">Mark Done</button>
                    <button class="btn btn-sm btn-secondary" onclick="rescheduleFollowup('${lead.id}')">Reschedule</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function markFollowupDone(leadId) {
    const lead = DB.leads.find(l => l.id === leadId);
    if (!lead) return;
    
    lead.followUpDate = null;
    lead.updatedAt = new Date().toISOString();
    DB.saveLeads();
    
    showToast('Follow-up marked as done', 'success');
    loadFollowups(document.querySelector('.followup-tabs .tab-btn.active').dataset.tab);
}

function rescheduleFollowup(leadId) {
    const lead = DB.leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const newDate = prompt('Enter new follow-up date (YYYY-MM-DD):', lead.followUpDate);
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        lead.followUpDate = newDate;
        lead.updatedAt = new Date().toISOString();
        DB.saveLeads();
        showToast('Follow-up rescheduled', 'success');
        loadFollowups(document.querySelector('.followup-tabs .tab-btn.active').dataset.tab);
    } else if (newDate) {
        showToast('Invalid date format. Use YYYY-MM-DD', 'error');
    }
}

// ==================== AGENT MANAGEMENT ====================
function loadAgents() {
    const container = document.getElementById('agents-grid');
    const agents = DB.agents.filter(a => a.role !== 'admin');
    
    if (agents.length === 0) {
        container.innerHTML = '<p class="empty-state">No agents found. Add your first agent!</p>';
        return;
    }
    
    const html = agents.map(agent => {
        const agentLeads = DB.leads.filter(l => l.assignedAgent === agent.id);
        const conversions = agentLeads.filter(l => l.status === 'Converted').length;
        
        return `
            <div class="agent-card">
                <h3>${agent.name}</h3>
                <p>📞 ${agent.phone}</p>
                <p>Login ID: ${agent.loginId}</p>
                <span class="agent-status ${agent.status}">${agent.status.toUpperCase()}</span>
                <div class="agent-stats">
                    <div class="agent-stat">
                        <strong>${agentLeads.length}</strong>
                        <span>Leads</span>
                    </div>
                    <div class="agent-stat">
                        <strong>${conversions}</strong>
                        <span>Conversions</span>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editAgent('${agent.id}')">Edit</button>
                    <button class="btn btn-sm ${agent.status === 'active' ? 'btn-danger' : 'btn-success'}" onclick="toggleAgentStatus('${agent.id}')">
                        ${agent.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function editAgent(agentId) {
    const agent = DB.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    document.getElementById('agent-modal-title').textContent = 'Edit Agent';
    document.getElementById('agent-id').value = agent.id;
    document.getElementById('agent-name').value = agent.name;
    document.getElementById('agent-phone').value = agent.phone;
    document.getElementById('agent-login-id').value = agent.loginId;
    document.getElementById('agent-password').value = agent.password;
    document.getElementById('agent-status').value = agent.status;
    
    document.getElementById('agent-modal').classList.add('active');
}

function toggleAgentStatus(agentId) {
    const agent = DB.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    agent.status = agent.status === 'active' ? 'inactive' : 'active';
    DB.saveAgents();
    loadAgents();
    showToast(`Agent ${agent.status}`, 'success');
}

// ==================== ADD/EDIT LEAD ====================
function updateProductOptions() {
    const category = document.getElementById('lead-category').value;
    const productSelect = document.getElementById('lead-product');
    
    productSelect.innerHTML = '<option value="">Select Product</option>';
    
    if (category && PRODUCTS[category]) {
        PRODUCTS[category].forEach(product => {
            const option = document.createElement('option');
            option.value = product;
            option.textContent = product;
            productSelect.appendChild(option);
        });
    }
}

function openAddLeadModal() {
    document.getElementById('lead-modal-title').textContent = 'Add Lead';
    document.getElementById('lead-form').reset();
    document.getElementById('lead-id').value = '';
    document.getElementById('lead-product').innerHTML = '<option value="">Select Product</option>';
    
    // Pre-fill agent for non-admin users
    if (!isAdmin()) {
        document.getElementById('lead-agent').value = DB.currentUser.id;
        document.getElementById('lead-agent').disabled = true;
    } else {
        document.getElementById('lead-agent').disabled = false;
    }
    
    document.getElementById('lead-modal').classList.add('active');
}

function openEditLeadModal(leadId) {
    const lead = DB.leads.find(l => l.id === leadId);
    if (!lead) return;
    
    document.getElementById('lead-modal-title').textContent = 'Edit Lead';
    document.getElementById('lead-id').value = lead.id;
    document.getElementById('lead-phone').value = lead.phone;
    document.getElementById('lead-name').value = lead.name || '';
    document.getElementById('lead-category').value = lead.category;
    updateProductOptions();
    document.getElementById('lead-product').value = lead.product;
    document.getElementById('lead-source').value = lead.source || 'Website';
    document.getElementById('lead-agent').value = lead.assignedAgent;
    document.getElementById('lead-status').value = lead.status;
    
    document.getElementById('lead-modal').classList.add('active');
}

// ==================== BULK UPLOAD ====================
function openBulkUploadModal() {
    document.getElementById('bulk-upload-modal').classList.add('active');
    populateAgentDropdowns();
}

function processBulkUpload() {
    const assignType = document.getElementById('bulk-assign-type').value;
    const selectedAgent = document.getElementById('bulk-agent').value;
    const uploadTab = document.querySelector('[data-upload-tab].active').dataset.uploadTab;
    
    let phones = [];
    
    if (uploadTab === 'paste') {
        const text = document.getElementById('paste-numbers').value;
        phones = text.split(/[\n,]+/).map(p => p.trim()).filter(p => p);
    } else {
        showToast('CSV upload coming soon! Please use paste option.', 'warning');
        return;
    }
    
    // Validate and clean
    const validPhones = [];
    const invalidPhones = [];
    const duplicatePhones = [];
    
    phones.forEach(phone => {
        // Remove any non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        if (!validatePhone(cleanPhone)) {
            invalidPhones.push(phone);
        } else if (DB.leads.some(l => l.phone === cleanPhone)) {
            duplicatePhones.push(cleanPhone);
        } else {
            validPhones.push(cleanPhone);
        }
    });
    
    if (validPhones.length === 0) {
        showToast('No valid phone numbers to upload', 'error');
        return;
    }
    
    // Show preview
    const preview = document.getElementById('bulk-preview');
    preview.innerHTML = `
        <p><strong>Valid:</strong> ${validPhones.length} | <strong>Invalid:</strong> ${invalidPhones.length} | <strong>Duplicates:</strong> ${duplicatePhones.length}</p>
        <p>Ready to upload ${validPhones.length} leads</p>
    `;
    
    // Create leads
    let agentIndex = 0;
    const activeAgents = DB.agents.filter(a => a.status === 'active' && a.role !== 'admin');
    
    validPhones.forEach(phone => {
        let assignedAgent = selectedAgent;
        
        if (assignType === 'roundrobin' && activeAgents.length > 0) {
            assignedAgent = activeAgents[agentIndex % activeAgents.length].id;
            agentIndex++;
        }
        
        const lead = {
            id: generateId(),
            phone: phone,
            name: `Lead #${phone.slice(-4)}`,
            category: 'Psoriasis',
            product: 'Psocare Oil',
            source: 'Bulk Upload',
            assignedAgent: assignedAgent || (isAdmin() ? null : DB.currentUser.id),
            status: 'New',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            timeline: [{
                type: 'created',
                user: DB.currentUser.name,
                timestamp: new Date().toISOString()
            }]
        };
        
        DB.leads.push(lead);
    });
    
    DB.saveLeads();
    
    showToast(`Successfully uploaded ${validPhones.length} leads`, 'success');
    document.getElementById('bulk-upload-modal').classList.remove('active');
    document.getElementById('paste-numbers').value = '';
    document.getElementById('bulk-preview').innerHTML = '';
    
    loadLeadsTable();
}

// ==================== REPORTS ====================
function loadReports() {
    populateAgentDropdowns();
    document.getElementById('report-results').innerHTML = '<p class="empty-state">Select filters and click "Generate Report"</p>';
}

function generateReport() {
    const agentId = document.getElementById('report-agent').value;
    const fromDate = document.getElementById('report-from-date').value;
    const toDate = document.getElementById('report-to-date').value;
    
    let filteredLeads = DB.leads;
    
    if (agentId) {
        filteredLeads = filteredLeads.filter(l => l.assignedAgent === agentId);
    }
    
    if (fromDate) {
        filteredLeads = filteredLeads.filter(l => l.createdAt >= fromDate);
    }
    
    if (toDate) {
        const toDateEnd = new Date(toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        filteredLeads = filteredLeads.filter(l => new Date(l.createdAt) <= toDateEnd);
    }
    
    const totalLeads = filteredLeads.length;
    const conversions = filteredLeads.filter(l => l.status === 'Converted').length;
    const conversionRate = totalLeads > 0 ? ((conversions / totalLeads) * 100).toFixed(2) : 0;
    const revenue = conversions * 2500;
    
    // Status breakdown
    const statusBreakdown = STAGES.map(stage => {
        const count = filteredLeads.filter(l => l.status === stage).length;
        return { stage, count };
    });
    
    const html = `
        <h3>Report Summary</h3>
        <div class="stats-grid" style="margin: 1.5rem 0;">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <h3>${totalLeads}</h3>
                    <p>Total Leads</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-info">
                    <h3>${conversions}</h3>
                    <p>Conversions</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                    <h3>${conversionRate}%</h3>
                    <p>Conversion Rate</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                    <h3>₹${revenue.toLocaleString('en-IN')}</h3>
                    <p>Revenue</p>
                </div>
            </div>
        </div>
        
        <h4>Status Breakdown</h4>
        <table class="leads-table" style="margin-top: 1rem;">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                ${statusBreakdown.map(s => `
                    <tr>
                        <td><span class="status-badge status-${s.stage}">${s.stage}</span></td>
                        <td>${s.count}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('report-results').innerHTML = html;
}

// ==================== HELPER FUNCTIONS ====================
function populateAgentDropdowns() {
    const selects = [
        document.getElementById('filter-agent'),
        document.getElementById('lead-agent'),
        document.getElementById('bulk-agent'),
        document.getElementById('report-agent')
    ];
    
    const agents = DB.agents.filter(a => a.status === 'active');
    
    selects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        const isAdminField = select.classList.contains('admin-only-field');
        
        select.innerHTML = '<option value="">Select Agent</option>';
        
        agents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent.id;
            option.textContent = agent.name;
            select.appendChild(option);
        });
        
        select.value = currentValue;
    });
}

function populateProductFilter() {
    const select = document.getElementById('filter-product');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">All Products</option>';
    
    Object.values(PRODUCTS).flat().forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function deleteLead(leadId) {
    if (!confirmDelete('Are you sure you want to delete this lead?')) return;
    
    DB.leads = DB.leads.filter(l => l.id !== leadId);
    DB.saveLeads();
    showToast('Lead deleted successfully', 'success');
    loadLeadsTable();
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DB
    DB.init();
    
    // Check auth
    if (checkAuth()) {
        initializeApp();
    } else {
        showScreen('login-screen');
    }
    
    // Login form
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const loginId = document.getElementById('login-id').value;
        const password = document.getElementById('password').value;
        
        const user = login(loginId, password);
        if (user) {
            initializeApp();
        }
    });
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.dataset.view;
            showView(viewId);
        });
    });
    
    // Add lead button
    document.getElementById('add-lead-btn')?.addEventListener('click', openAddLeadModal);
    
    // Bulk upload button
    document.getElementById('bulk-upload-btn')?.addEventListener('click', openBulkUploadModal);
    
    // Add agent button
    document.getElementById('add-agent-btn')?.addEventListener('click', () => {
        document.getElementById('agent-modal-title').textContent = 'Add Agent';
        document.getElementById('agent-form').reset();
        document.getElementById('agent-id').value = '';
        document.getElementById('agent-modal').classList.add('active');
    });
    
    // Lead form submit
    document.getElementById('lead-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const leadId = document.getElementById('lead-id').value;
        const phone = document.getElementById('lead-phone').value;
        const name = document.getElementById('lead-name').value.trim();
        const category = document.getElementById('lead-category').value;
        const product = document.getElementById('lead-product').value;
        const source = document.getElementById('lead-source').value;
        const assignedAgent = document.getElementById('lead-agent').value;
        const status = document.getElementById('lead-status').value;
        
        // Validate phone
        if (!validatePhone(phone)) {
            showToast('Phone number must be exactly 10 digits', 'error');
            return;
        }
        
        // Check for duplicates (only when adding new lead)
        if (!leadId && DB.leads.some(l => l.phone === phone)) {
            showToast('This phone number already exists in the system', 'error');
            return;
        }
        
        if (leadId) {
            // Edit existing lead
            const lead = DB.leads.find(l => l.id === leadId);
            if (lead) {
                lead.phone = phone;
                lead.name = name || `Lead #${phone.slice(-4)}`;
                lead.category = category;
                lead.product = product;
                lead.source = source;
                lead.assignedAgent = assignedAgent;
                lead.status = status;
                lead.updatedAt = new Date().toISOString();
                
                showToast('Lead updated successfully', 'success');
            }
        } else {
            // Create new lead
            const lead = {
                id: generateId(),
                phone: phone,
                name: name || `Lead #${phone.slice(-4)}`,
                category: category,
                product: product,
                source: source,
                assignedAgent: assignedAgent || (isAdmin() ? null : DB.currentUser.id),
                status: status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                timeline: [{
                    type: 'created',
                    user: DB.currentUser.name,
                    timestamp: new Date().toISOString()
                }]
            };
            
            DB.leads.push(lead);
            showToast('Lead created successfully', 'success');
        }
        
        DB.saveLeads();
        document.getElementById('lead-modal').classList.remove('active');
        loadLeadsTable();
    });
    
    // Agent form submit
    document.getElementById('agent-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const agentId = document.getElementById('agent-id').value;
        const name = document.getElementById('agent-name').value;
        const phone = document.getElementById('agent-phone').value;
        const loginId = document.getElementById('agent-login-id').value;
        const password = document.getElementById('agent-password').value;
        const status = document.getElementById('agent-status').value;
        
        // Validate phone
        if (!validatePhone(phone)) {
            showToast('Phone number must be exactly 10 digits', 'error');
            return;
        }
        
        if (agentId) {
            // Edit existing agent
            const agent = DB.agents.find(a => a.id === agentId);
            if (agent) {
                agent.name = name;
                agent.phone = phone;
                agent.loginId = loginId;
                agent.password = password;
                agent.status = status;
                
                showToast('Agent updated successfully', 'success');
            }
        } else {
            // Check if login ID already exists
            if (DB.agents.some(a => a.loginId === loginId)) {
                showToast('Login ID already exists', 'error');
                return;
            }
            
            // Create new agent
            const agent = {
                id: 'AGENT_' + Date.now(),
                name: name,
                phone: phone,
                loginId: loginId,
                password: password,
                status: status,
                role: 'agent',
                createdAt: new Date().toISOString(),
                leadsHandled: 0,
                conversions: 0
            };
            
            DB.agents.push(agent);
            showToast('Agent created successfully', 'success');
        }
        
        DB.saveAgents();
        document.getElementById('agent-modal').classList.remove('active');
        loadAgents();
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Bulk upload tabs
    document.querySelectorAll('[data-upload-tab]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-upload-tab]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tab = this.dataset.uploadTab;
            document.querySelectorAll('.upload-panel').forEach(panel => {
                panel.classList.toggle('active', panel.id === `${tab}-upload`);
            });
        });
    });
    
    // Process bulk upload
    document.getElementById('process-bulk-btn')?.addEventListener('click', processBulkUpload);
    
    // Followup tabs
    document.querySelectorAll('.followup-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            loadFollowups(this.dataset.tab);
        });
    });
    
    // Search and filters
    document.getElementById('search-leads')?.addEventListener('input', loadLeadsTable);
    document.getElementById('filter-agent')?.addEventListener('change', loadLeadsTable);
    document.getElementById('filter-status')?.addEventListener('change', loadLeadsTable);
    document.getElementById('filter-product')?.addEventListener('change', loadLeadsTable);
    
    // Generate report
    document.getElementById('generate-report-btn')?.addEventListener('click', generateReport);
    
    // Populate initial dropdowns
    populateAgentDropdowns();
    populateProductFilter();
});

// ==================== APP INITIALIZATION ====================
function initializeApp() {
    showScreen('app-screen');
    
    // Set user name
    document.getElementById('user-name-display').textContent = `${DB.currentUser.name} (${DB.currentUser.role})`;
    
    // Show/hide admin elements
    const adminElements = document.querySelectorAll('.admin-only, .admin-only-field');
    adminElements.forEach(el => {
        el.classList.toggle('admin-visible', isAdmin());
    });
    
    // Hide bulk upload for non-admin
    const bulkUploadBtn = document.getElementById('bulk-upload-btn');
    if (bulkUploadBtn) {
        bulkUploadBtn.style.display = isAdmin() ? 'inline-flex' : 'none';
    }
    
    // Load dashboard
    showView('dashboard');
}

// Export for global access
window.openLeadDetail = openLeadDetail;
window.deleteLead = deleteLead;
window.editAgent = editAgent;
window.toggleAgentStatus = toggleAgentStatus;
window.markFollowupDone = markFollowupDone;
window.rescheduleFollowup = rescheduleFollowup;
window.updateProductOptions = updateProductOptions;
window.allowDrop = allowDrop;
window.drag = drag;
window.drop = drop;
