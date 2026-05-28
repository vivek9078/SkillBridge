(function() {

    // ========== BACKEND API BASE URL ==========
    const API_BASE = "https://skillbridge-backend-lehj.onrender.com/api";
    
    // ========== STORAGE KEYS (Only for session, NOT for data) ==========
    const STORAGE_SESSION = "workhub_session_final";
    const STORAGE_CERTIFICATES = "workhub_certificates_final"; // Certificates remain local as they're generated

    // ========== API FUNCTIONS ==========
    async function apiFetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Fetch Error (${endpoint}):`, error);
            throw error;
        }
    }
    
    // ========== USER API ==========
    async function getUsers() {
        try {
            return await apiFetch('/users');
        } catch (error) {
            console.error("Failed to fetch users:", error);
            return [];
        }
    }
    
    async function getUserByEmail(email) {
        try {
            return await apiFetch(`/users/email/${email}`);
        } catch (error) {
            return null;
        }
    }
    
    async function createUser(userData) {
        return await apiFetch('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    async function updateUserByEmail(email, updates) {
        return await apiFetch(`/users/email/${email}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }
    
    // ========== PROJECT API ==========
    async function getProjects() {
        try {
            return await apiFetch('/projects');
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            return [];
        }
    }
    
    async function getProjectsByOwner(ownerEmail) {
        try {
            return await apiFetch(`/projects/owner/${ownerEmail}`);
        } catch (error) {
            return [];
        }
    }
    
    async function getProjectsByContributor(email) {
        try {
            return await apiFetch(`/projects/contributor/${email}`);
        } catch (error) {
            return [];
        }
    }
    
    async function createProjectAPI(projectData) {
        return await apiFetch('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }
    
    async function addContributorToProject(projectId, email) {
        return await apiFetch(`/projects/${projectId}/contributors`, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }
    
    async function removeContributorFromProject(projectId, email) {
        return await apiFetch(`/projects/${projectId}/contributors/${email}`, {
            method: 'DELETE'
        });
    }
    
    async function updateProjectStatus(projectId, status) {
        return await apiFetch(`/projects/${projectId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
    
    // ========== TASK API ==========
    async function getTasks() {
        try {
            return await apiFetch('/tasks');
        } catch (error) {
            return [];
        }
    }
    
    async function getTasksByProject(projectId) {
        try {
            return await apiFetch(`/tasks/project/${projectId}`);
        } catch (error) {
            return [];
        }
    }
    
    async function getTasksByAssignee(email) {
        try {
            return await apiFetch(`/tasks/assignee/${email}`);
        } catch (error) {
            return [];
        }
    }
    
    async function createTaskAPI(taskData) {
        return await apiFetch('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }
    
    async function updateTaskStatusAPI(taskId, status, submissionLink = '', feedback = '') {
        return await apiFetch(`/tasks/${taskId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, submissionLink, feedback })
        });
    }
    
    async function updateTaskAPI(taskId, taskData) {
        return await apiFetch(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    }
    
    async function deleteTaskAPI(taskId) {
        return await apiFetch(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }
    
    // ========== INVITATION API ==========
    async function getInvitations() {
        try {
            return await apiFetch('/invitations');
        } catch (error) {
            return [];
        }
    }
    
    async function getInvitationsByFreelancer(email) {
        try {
            return await apiFetch(`/invitations/freelancer/${email}`);
        } catch (error) {
            return [];
        }
    }
    
    async function getInvitationsByClient(email) {
        try {
            return await apiFetch(`/invitations/client/${email}`);
        } catch (error) {
            return [];
        }
    }
    
    async function createInvitationAPI(invitationData) {
        return await apiFetch('/invitations', {
            method: 'POST',
            body: JSON.stringify(invitationData)
        });
    }
    
    async function updateInvitationStatusAPI(invitationId, status) {
        return await apiFetch(`/invitations/${invitationId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
    
    // Helper to get invitations by project
    async function getInvitationsByProject(projectId) {
        try {
            return await apiFetch(`/invitations/project/${projectId}`);
        } catch {
            return [];
        }
    }
    
    // ========== SESSION MANAGEMENT ==========
    function getSession() { 
        return JSON.parse(localStorage.getItem(STORAGE_SESSION) || "null"); 
    }
    
    function setSession(email, role) { 
        localStorage.setItem(STORAGE_SESSION, JSON.stringify({ email, role })); 
    }
    
    function clearSession() { 
        localStorage.removeItem(STORAGE_SESSION); 
    }
    
    // ========== CERTIFICATE FUNCTIONS (Local only - generated data) ==========
    function getCertificates() { 
        return JSON.parse(localStorage.getItem(STORAGE_CERTIFICATES) || "[]"); 
    }
    
    function saveCertificates(certificates) { 
        localStorage.setItem(STORAGE_CERTIFICATES, JSON.stringify(certificates)); 
    }
    
    function generateCertificate(project, contributorEmail, contributor, tasks) {
        const projectId = project.id || project._id;
        const approvedTasks = tasks.filter(t => t.status === 'approved').length;
        const contributionScore = tasks.length > 0 ? Math.round((approvedTasks / tasks.length) * 100) : 0;
        
        const allTasksApproved = tasks.length > 0 && tasks.every(t => t.status === 'approved');
        
        if (!allTasksApproved) {
            return null;
        }
        
        const certificates = getCertificates();
        const existingCert = certificates.find(c => c.projectId === projectId && c.contributorEmail === contributorEmail);
        
        if (existingCert) return existingCert;
        
        const newCertificate = {
            id: "cert_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
            projectId: projectId,
            projectName: project.projectName,
            contributorEmail: contributorEmail,
            contributorName: contributor.name,
            contributorRole: contributor.skills || contributor.category || 'Contributor',
            completedTasks: approvedTasks,
            totalTasks: tasks.length,
            contributionPercentage: contributionScore,
            issueDate: Date.now(),
            certificateCode: "SB-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase()
        };
        
        certificates.push(newCertificate);
        saveCertificates(certificates);
        return newCertificate;
    }
    
    function viewCertificate(projectId, contributorEmail, project, contributor, tasks) {
        const certificate = generateCertificate(project, contributorEmail, contributor, tasks);
        if (!certificate) {
            alert("Certificate not available yet. Complete and get approval for all assigned tasks first!");
            return null;
        }
        return certificate;
    }
    
    function verifyCertificate(certificateCode) {
        const certificates = getCertificates();
        const certificate = certificates.find(c => c.certificateCode === certificateCode);
        
        if (!certificate) {
            alert("Certificate not found! Please check the certificate code and try again.");
            return null;
        }
        
        return certificate;
    }
    
    // ========== HELPER FUNCTIONS ==========
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address (e.g., name@example.com)");
            return false;
        }
        return true;
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            alert("Please enter a valid 10-digit Indian mobile number starting with 6,7,8, or 9");
            return false;
        }
        return true;
    }
    
    // ========== TASK HELPERS ==========
    function getProjectTaskProgress(tasks) {
        if (tasks.length === 0) return 0;
        const approvedTasks = tasks.filter(t => t.status === 'approved').length;
        return Math.round((approvedTasks / tasks.length) * 100);
    }
    
    function getFreelancerTaskProgress(tasks, freelancerEmail) {
        const userTasks = tasks.filter(t => t.assignedTo === freelancerEmail);
        if (userTasks.length === 0) return 0;
        const approvedTasks = userTasks.filter(t => t.status === 'approved').length;
        return Math.round((approvedTasks / userTasks.length) * 100);
    }
    
    // ========== SUBMISSION FUNCTIONS ==========
    const STORAGE_SUBMISSIONS = "workhub_submissions_final";
    
    function getSubmissions() { 
        return JSON.parse(localStorage.getItem(STORAGE_SUBMISSIONS) || "[]"); 
    }
    
    function saveSubmissions(submissions) { 
        localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(submissions)); 
    }
    
    async function submitWork(projectId, freelancerEmail, taskId, milestone, description, fileUrl) {
        // Check for existing pending submission
        const submissions = getSubmissions();
        const existingSubmission = submissions.find(s => s.taskId === taskId && s.status === 'pending');
        if (existingSubmission) {
            alert("You already have a pending submission for this task. Wait for review.");
            return false;
        }
        
        // Save submission to localStorage for history/transparency
        const newSubmission = {
            id: Date.now(),
            projectId: projectId,
            freelancerEmail: freelancerEmail,
            taskId: taskId,
            milestone: milestone,
            description: description,
            fileUrl: fileUrl || "work_sample.pdf",
            status: "pending",
            feedback: null,
            submittedAt: Date.now()
        };
        submissions.push(newSubmission);                 
        saveSubmissions(submissions);
        
        // CRITICAL FIX: Save submission data to the task's submissionLink field in MongoDB
        // This makes it visible to the project owner
        try {
            await updateTaskStatusAPI(taskId, 'submitted', fileUrl || "work_sample.pdf", description);
            return true;
        } catch (error) {
            console.error("Failed to update task with submission:", error);
            alert("Failed to submit work. Please try again.");
            return false;
        }
    }
    
    // ========== LOGIN & REGISTRATION ==========
    function renderLogin() {
        const container = document.getElementById("app");
        container.innerHTML = `
            <div class="glass-card login-card">
                <div style="text-align: center;">
                    <h1>SkillBridge</h1>
                    <p style="color: #4a5568; margin-top: 0.5rem;">Student Collaboration Platform</p>
                </div>
                <div class="role-buttons">
                    <button onclick="window.showClientLogin()" class="btn btn-primary">📋 I'm a Project Owner</button>
                    <button onclick="window.showFreelancerLogin()" class="btn btn-outline">💼 I'm a Contributor</button>
                </div>
                <div id="loginForm"></div>
                <div style="text-align: center; margin-top: 1rem;">
                    <button onclick="window.showCertificateVerifier()" class="btn btn-outline btn-sm">🔍 Verify Certificate</button>
                </div>
            </div>
        `;
    }
    
    window.showClientLogin = function() {
        const formDiv = document.getElementById("loginForm");
        formDiv.innerHTML = `
            <div class="form-group"><label>Full Name</label><input type="text" id="clientName" placeholder="Enter your name"></div>
            <div class="form-group"><label>Email</label><input type="email" id="clientEmail" placeholder="projectowner@example.com"></div>
            <button onclick="window.handleClientLogin()" class="btn btn-primary" style="width:100%">Continue →</button>
        `;
    };
    
    window.handleClientLogin = async function() {
        const name = document.getElementById("clientName").value.trim();
        const email = document.getElementById("clientEmail").value.trim().toLowerCase();
        
        if (!name || !email) {
            return alert("Please fill all fields");
        }
        
        if (!isValidEmail(email)) {
            return;
        }
        
        try {
            // Check if user exists
            let user = await getUserByEmail(email);
            
            if (!user) {
                // Create new user
                user = await createUser({ 
                    name, 
                    email, 
                    role: "project-owner",
                    phone: "",
                    skills: ""
                });
            } else if (user.role !== "project-owner") {
                // Update role if needed
                user = await updateUserByEmail(email, { ...user, role: "project-owner" });
            }
            
            setSession(email, "project-owner");
            await renderClientDashboard(email);
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed. Please try again.");
        }
    };
    
    window.showFreelancerLogin = function() {
        const formDiv = document.getElementById("loginForm");
        formDiv.innerHTML = `
            <div class="form-group"><label>Email</label><input type="email" id="freelancerEmail" placeholder="contributor@example.com"></div>
            <button onclick="window.checkFreelancer()" class="btn btn-primary" style="width:100%">Check / Register →</button>
            <div id="regForm" style="display:none; margin-top:1.5rem;"></div>
        `;
    };
    
    window.checkFreelancer = async function() {
        const email = document.getElementById("freelancerEmail").value.trim().toLowerCase();
        if (!email) return alert("Enter email");
        
        if (!isValidEmail(email)) {
            return;
        }
        
        try {
            const existing = await getUserByEmail(email);
            
            if (existing && existing.role === "contributor") {
                setSession(email, "contributor");
                await renderContributorDashboard(email);
            } else if (existing && existing.role === "project-owner") {
                alert("Email registered as project owner. Please use a different email or login as project owner.");
            } else {
                const regDiv = document.getElementById("regForm");
                regDiv.style.display = "block";
                regDiv.innerHTML = `
                    <h3>📝 Register Contributor</h3>
                    <div class="form-group"><label>Full Name</label><input type="text" id="regName"></div>
                    <div class="form-group"><label>Category (Skills)</label><input type="text" id="regCategory"></div>
                    <div class="form-group"><label>Phone</label><input type="text" id="regPhone"></div>
                    <div class="form-group"><label>Profile Image URL</label><input type="text" id="regImage" placeholder="https://..."></div>
                    <div class="form-group"><label>Skills & Experience</label><textarea id="regExperience" rows="2"></textarea></div>
                    <button onclick="window.completeRegistration('${email}')" class="btn btn-primary" style="width:100%">Register →</button>
                `;
            }
        } catch (error) {
            console.error("Check freelancer error:", error);
            alert("Error checking user. Please try again.");
        }
    };
    
    window.completeRegistration = async function(email) {
        const name = document.getElementById("regName").value.trim();
        const category = document.getElementById("regCategory").value.trim();
        const phone = document.getElementById("regPhone").value.trim();
        const image = document.getElementById("regImage").value.trim();
        const experience = document.getElementById("regExperience").value.trim();
        
        if (!name || !category || !phone || !image || !experience) {
            return alert("Please fill all fields");
        }
        
        if (!isValidEmail(email)) {
            return;
        }
        
        if (!isValidPhone(phone)) {
            return;
        }
        
        try {
            await createUser({
                name: name,
                email: email,
                role: "contributor",
                phone: phone,
                skills: category,
                image: image,
                pastExperience: experience
            });
            
            setSession(email, "contributor");
            await renderContributorDashboard(email);
        } catch (error) {
            console.error("Contributor registration failed:", error);
            alert("Failed to save contributor to database: " + error.message);
        }
    };
    
    // ========== CONTRIBUTOR DASHBOARD ==========
    async function renderContributorDashboard(email) {
        try {
            const user = await getUserByEmail(email);
            if (!user) {
                renderLogin();
                return;
            }
            
            // Fetch all data from backend
            const allProjects = await getProjects();
            const userProjects = allProjects.filter(p => 
                p.contributors && p.contributors.some(c => c.email === email)
            );
            
            const allTasks = await getTasks();
            const userTasks = allTasks.filter(t => t.assignedTo === email);
            
            const invitations = await getInvitationsByFreelancer(email);
            const pendingInvitations = invitations.filter(i => i.status === 'pending');
            
            const container = document.getElementById("app");
            
            container.innerHTML = `
                <div class="glass-card">
                    <div class="flex-between">
                        <h2>💼 Contributor Dashboard</h2>
                        <div>
                            <button onclick="window.showCertificateVerifier()" class="btn btn-outline btn-sm" style="margin-right:0.5rem;">🔍 Verify Certificate</button>
                            <button onclick="window.showEditProfileForm('${email}')" class="btn btn-outline btn-sm" style="margin-right:0.5rem;">✏️ Edit Profile</button>
                            <button onclick="window.logout()" class="logout-btn">Logout</button>
                        </div>
                    </div>
                    
                    <div class="freelancer-profile">
                        <img class="profile-img" src="${escapeHtml(user.image || 'https://via.placeholder.com/70')}" onerror="this.src='https://via.placeholder.com/70'">
                        <div>
                            <strong>${escapeHtml(user.name)}</strong><br>
                            📌 ${escapeHtml(user.skills || user.category || 'No skills listed')} | 📞 ${escapeHtml(user.phone || 'N/A')}<br>
                            🎓 ${escapeHtml(user.pastExperience || 'No experience listed')}
                        </div>
                    </div>
                    
                    <h3>📨 Project Invitations</h3>
                    <div id="invitations">
                        ${pendingInvitations.length === 0 ? '<div class="message">No pending invitations.</div>' :
                            pendingInvitations.map(inv => `
                                <div class="project-card">
                                    <div class="flex-between">
                                        <strong>📌 Project Invitation</strong>
                                        <span class="badge badge-pending">PENDING</span>
                                    </div>
                                    <div><strong>Project ID:</strong> ${escapeHtml(inv.projectId)}</div>
                                    <div><strong>From:</strong> ${escapeHtml(inv.clientEmail)}</div>
                                    <div style="margin-top: 1rem;">
                                        <button onclick="window.respondToInvitation('${inv.id || inv._id}', 'accept', '${email}', '${inv.projectId}')" class="btn btn-success btn-sm">✅ Accept</button>
                                        <button onclick="window.respondToInvitation('${inv.id || inv._id}', 'reject', '${email}', '${inv.projectId}')" class="btn btn-danger btn-sm">❌ Reject</button>
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                    
                    <h3>⚡ My Projects</h3>
                    <div id="activeProjects">
                        ${userProjects.length === 0 ? '<div class="message">No projects yet. Accept invitations to get started!</div>' :
                            await Promise.all(userProjects.map(async (proj) => {
                                const projectTasks = allTasks.filter(t => t.projectId === (proj.id || proj._id) && t.assignedTo === email);
                                const completedTasks = projectTasks.filter(t => t.status === 'approved').length;
                                const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
                                const projectId = proj.id || proj._id;
                                
                                return `
                                    <div class="project-card">
                                        <div class="flex-between">
                                            <strong>📌 ${escapeHtml(proj.projectName)}</strong>
                                            <span class="badge badge-hired">🏆 Progress: ${progress}%</span>
                                        </div>
                                        <div><strong>Owner:</strong> ${escapeHtml(proj.ownerEmail)}</div>
                                        <div><strong>Domain:</strong> ${escapeHtml(proj.domain)} | <strong>Difficulty:</strong> ${escapeHtml(proj.difficulty)}</div>
                                        <div><strong>Description:</strong> ${escapeHtml(proj.description)}</div>
                                        <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
                                        
                                        <h4>📋 My Tasks (${projectTasks.length})</h4>
                                        ${projectTasks.length === 0 ? '<div class="message">No tasks assigned yet.</div>' :
                                            projectTasks.map(task => `
                                                <div class="submission-card" style="background:${task.status === 'approved' ? '#c6f6d5' : task.status === 'submitted' ? '#fefcbf' : task.status === 'rejected' ? '#fed7d7' : '#edf2f7'}">
                                                    <div class="flex-between">
                                                        <strong>${escapeHtml(task.title)}</strong>
                                                        <span class="badge ${task.status === 'approved' ? 'badge-approved' : task.status === 'submitted' ? 'badge-pending' : 'badge-available'}">${task.status.toUpperCase()}</span>
                                                    </div>
                                                    <div>📝 ${escapeHtml(task.description)}</div>
                                                    ${task.status === 'rejected' && task.feedback ? `<div class="feedback-note" style="color:#e53e3e;">❌ Feedback: ${escapeHtml(task.feedback)}</div>` : ''}
                                                    ${task.status === 'todo' ? `<button class="btn btn-primary btn-sm" onclick="window.updateTask('${task._id}', 'in-progress', '${email}')">▶️ Start Task</button>` : ''}
                                                    ${task.status === 'rejected' ? `<button class="btn btn-primary btn-sm" onclick="window.updateTask('${task._id}', 'in-progress', '${email}')">🔄 Resubmit</button>` : ''}
                                                    ${task.status === 'submitted' ? '<div class="feedback-note">⏳ Waiting for approval...</div>' : ''}
                                                </div>
                                            `).join('')
                                        }
                                        
                                        <h4>📤 Submit Work</h4>
                                        <div class="grid-2">
                                            <select id="task-select-${projectId}">
                                                <option value="">Select task...</option>
                                                ${projectTasks.filter(t => t.status === 'in-progress').map(task => `
                                                    <option value="${task._id}">${escapeHtml(task.title)}</option>
                                                `).join('')}
                                            </select>
                                            <input type="text" id="fileUrl-${projectId}" placeholder="File name or link (optional)">
                                            <textarea id="workDesc-${projectId}" placeholder="Describe your work..." rows="2" style="grid-column: span 2;"></textarea>
                                        </div>
                                        <button onclick="window.submitWorkForProject('${projectId}', '${email}')" class="btn btn-primary btn-sm">📎 Submit</button>
                                        
                                        <button onclick="window.handleLeaveProject('${projectId}', '${email}')" class="btn btn-outline btn-sm" style="margin-top: 1rem;">🚪 Leave Project</button>
                                    </div>
                                `;
                            })).then(results => results.join(''))
                        }
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Render contributor dashboard error:", error);
            const container = document.getElementById("app");
            container.innerHTML = `<div class="glass-card"><div class="message">Error loading dashboard. Please refresh.</div><button onclick="window.logout()" class="btn btn-primary">Back to Login</button></div>`;
        }
    }
    
    // ========== PROJECT OWNER DASHBOARD ==========
    async function renderClientDashboard(email) {
        try {
            const user = await getUserByEmail(email);
            if (!user) {
                renderLogin();
                return;
            }
            
            const userProjects = await getProjectsByOwner(email);
            const allTasks = await getTasks();
            const allUsers = await getUsers();
            
            const container = document.getElementById("app");
            
            container.innerHTML = `
                <div class="glass-card">
                    <div class="flex-between">
                        <h2>📋 Project Owner Dashboard</h2>
                        <div>
                            <button onclick="window.showCertificateVerifier()" class="btn btn-outline btn-sm" style="margin-right:0.5rem;">🔍 Verify Certificate</button>
                            <button onclick="window.logout()" class="logout-btn">Logout</button>
                        </div>
                    </div>
                    <div class="message">✅ Welcome, ${escapeHtml(email)}</div>
                    
                    <h3>➕ Create New Project</h3>
                    <div class="grid-2">
                        <input type="text" id="projectName" placeholder="Project Name *">
                        <input type="text" id="domain" placeholder="Domain (e.g., Web Development) *">
                        <select id="difficulty">
                            <option value="Beginner">Difficulty: Beginner</option>
                            <option value="Intermediate">Difficulty: Intermediate</option>
                            <option value="Advanced">Difficulty: Advanced</option>
                        </select>
                        <textarea id="description" placeholder="Project Description *" rows="2"></textarea>
                        <textarea id="details" placeholder="Technical Details *" rows="2"></textarea>
                        <input type="number" id="deadline" placeholder="Deadline (days)">
                    </div>
                    <button onclick="window.createProject('${email}')" class="btn btn-primary" style="width:100%; margin-bottom:1.5rem;">✨ Create Project</button>
                    
                    <h3>📌 My Projects</h3>
                    <div id="myProjects">
                        ${userProjects.length === 0 ? '<div class="message">No projects created yet.</div>' : 
                            await Promise.all(userProjects.map(async (p) => {
                                const projectId = p.id || p._id;
                                const projectTasks = allTasks.filter(t => t.projectId === projectId);
                                const completedTasks = projectTasks.filter(t => t.status === 'approved').length;
                                const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
                                const memberCount = p.contributors ? p.contributors.length : 0;
                                
                                return `
                                    <div class="project-card">
                                        <div class="flex-between">
                                            <strong>${escapeHtml(p.projectName)}</strong>
                                            <span class="badge ${p.status === 'available' ? 'badge-available' : 'badge-hired'}">${p.status === 'available' ? 'Available' : 'In Progress'}</span>
                                        </div>
                                        <div>🏷️ ${escapeHtml(p.domain)} | 📊 ${escapeHtml(p.difficulty)}</div>
                                        <div>📝 ${escapeHtml(p.description)}</div>
                                        <div>👥 ${memberCount} member(s) | Progress: ${progress}%</div>
                                        <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
                                        <button onclick="window.showFreelancersForHire('${projectId}', '${escapeHtml(p.projectName)}')" class="btn btn-primary btn-sm">👥 ${memberCount > 0 ? 'Manage Team' : 'Invite Contributors'}</button>
                                        <button onclick="window.showCreateTaskForm('${projectId}', '${escapeHtml(p.projectName)}')" class="btn btn-outline btn-sm">📋 Create Task</button>
                                    </div>
                                `;
                            })).then(results => results.join(''))
                        }
                    </div>
                    
                    <h3>⚡ Tasks Overview</h3>
                    <div id="activeProjects">
                        ${userProjects.length === 0 ? '<div class="message">No projects to show.</div>' :
                            await Promise.all(userProjects.map(async (proj) => {
                                const projectId = proj.id || proj._id;
                                const projectTasks = allTasks.filter(t => t.projectId === projectId);
                                const members = proj.contributors || [];
                                
                                return `
                                    <div class="project-card">
                                        <strong>📌 ${escapeHtml(proj.projectName)}</strong>
                                        <h4>📋 Tasks (${projectTasks.length})</h4>
                                        ${projectTasks.length === 0 ? '<div class="message">No tasks yet.</div>' :
                                            projectTasks.map(task => {
                                                const assigneeUser = allUsers.find(u => u.email === task.assignedTo);
                                                const isSubmitted = task.status === 'submitted';
                                                
                                                return `
                                                    <div class="submission-card" style="background:${task.status === 'approved' ? '#c6f6d5' : task.status === 'submitted' ? '#fefcbf' : '#edf2f7'}">
                                                        <div class="flex-between">
                                                            <strong>${escapeHtml(task.title)}</strong>
                                                            <span class="badge ${task.status === 'approved' ? 'badge-approved' : task.status === 'submitted' ? 'badge-pending' : 'badge-available'}">${task.status.toUpperCase()}</span>
                                                        </div>
                                                        <div>📝 ${escapeHtml(task.description)}</div>
                                                        <div>👤 Assigned to: ${escapeHtml(assigneeUser?.name || task.assignedTo)}</div>
                                                        
                                                        ${isSubmitted ? `
                                                            <div style="margin-top: 0.8rem; padding: 0.8rem; background: #fff; border-radius: 0.5rem; border-left: 3px solid #ed8936;">
                                                                <strong>📎 Submitted Work:</strong><br>
                                                                ${task.submissionLink ? `<div>🔗 File/Link: <a href="${escapeHtml(task.submissionLink)}" target="_blank" style="color: #667eea;">${escapeHtml(task.submissionLink)}</a></div>` : '<div>No file/link provided</div>'}
                                                                ${task.feedback && task.feedback !== 'No feedback provided' ? `<div>📝 Description: ${escapeHtml(task.feedback)}</div>` : '<div>📝 Work submitted, pending review</div>'}
                                                                <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem;">
                                                                    <button class="btn btn-success btn-sm" onclick="window.approveTaskSubmission('${task._id}', '${task.assignedTo}')">✅ Approve</button>
                                                                    <button class="btn btn-danger btn-sm" onclick="window.rejectTaskSubmission('${task._id}', '${task.assignedTo}')">❌ Reject & Request Changes</button>
                                                                </div>
                                                            </div>
                                                        ` : ''}
                                                        
                                                        <div style="margin-top: 0.5rem;">
                                                            <button class="btn btn-outline btn-sm" onclick="window.showEditTaskForm('${task._id}', '${escapeHtml(task.title)}', '${escapeHtml(task.description)}', '${task.assignedTo}')">✏️ Edit</button>
                                                            <button class="btn btn-danger btn-sm" onclick="window.handleDeleteTask('${task._id}')">🗑️ Delete</button>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')
                                        }
                                        
                                        <h4>👥 Team Members</h4>
                                        ${members.length === 0 ? '<div class="message">No members yet.</div>' :
                                            members.map(m => {
                                                const memberUser = allUsers.find(u => u.email === m.email);
                                                const memberProgress = getFreelancerTaskProgress(projectTasks, m.email);
                                                return `<div class="flex-between">• ${escapeHtml(memberUser?.name || m.email)} - 🏆 ${memberProgress}% contribution
                                                    <button onclick="window.handleRemoveFreelancer('${projectId}', '${m.email}')" class="btn btn-danger btn-sm">Remove</button>
                                                    <button onclick="window.showCertificate('${projectId}', '${m.email}')" class="btn btn-outline btn-sm">🎓 View Certificate</button>
                                                </div>`;
                                            }).join('')
                                        }
                                    </div>
                                `;
                            })).then(results => results.join(''))
                        }
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Render client dashboard error:", error);
            const container = document.getElementById("app");
            container.innerHTML = `<div class="glass-card"><div class="message">Error loading dashboard. Please refresh.</div><button onclick="window.logout()" class="btn btn-primary">Back to Login</button></div>`;
        }
    }
    
    // ========== PROJECT CREATION ==========
    window.createProject = async function(clientEmail) {
        const projectName = document.getElementById("projectName").value.trim();
        const domain = document.getElementById("domain").value.trim();
        const difficulty = document.getElementById("difficulty").value;
        const description = document.getElementById("description").value.trim();
        const details = document.getElementById("details").value.trim();
        const deadline = document.getElementById("deadline").value;
        
        if (!projectName || !domain || !description || !details) {
            return alert("Please fill all fields!");
        }
        
        try {
            const newProject = {
                projectName: projectName,
                domain: domain,
                difficulty: difficulty,
                description: description,
                ownerEmail: clientEmail,
                status: "available"
            };
            
            await createProjectAPI(newProject);
            alert("Project created successfully!");
            await renderClientDashboard(clientEmail);
        } catch (error) {
            console.error("Create project error:", error);
            alert("Failed to create project: " + error.message);
        }
    };
    
    // ========== INVITATION RESPONSE ==========
    window.respondToInvitation = async function(invitationId, response, freelancerEmail, projectId) {
        try {
            if (response === 'accept') {
                await updateInvitationStatusAPI(invitationId, 'accepted');
                await addContributorToProject(projectId, freelancerEmail);
                
                // Update project status if needed
                const project = await apiFetch(`/projects/${projectId}`);
                if (project && project.status === 'available') {
                    await updateProjectStatus(projectId, 'in-progress');
                }
                
                alert("You've joined the team! The project owner will assign tasks for you to complete.");
            } else {
                await updateInvitationStatusAPI(invitationId, 'rejected');
                alert("Invitation rejected.");
            }
            
            await renderContributorDashboard(freelancerEmail);
        } catch (error) {
            console.error("Respond to invitation error:", error);
            alert("Failed to process invitation: " + error.message);
        }
    };
    
    // ========== SHOW FREELANCERS FOR HIRE ==========
    window.showFreelancersForHire = async function(projectId, projectName) {
        try {
            const allUsers = await getUsers();
            const freelancers = allUsers.filter(u => u.role === "contributor");
            
            const project = await apiFetch(`/projects/${projectId}`);
            const currentMembers = project?.contributors || [];
            const availableFreelancers = freelancers.filter(f => !currentMembers.some(m => m.email === f.email));
            
            const container = document.getElementById("app");
            
            container.innerHTML = `
                <div class="glass-card">
                    <div class="flex-between">
                        <h2>👥 Manage Team for: ${escapeHtml(projectName)}</h2>
                        <button onclick="window.goBackToClient()" class="btn btn-outline">← Back to Dashboard</button>
                    </div>
                    
                    <div class="message">
                        <strong>Current Team Members: ${currentMembers.length}</strong>
                        ${currentMembers.map(m => {
                            const f = allUsers.find(u => u.email === m.email);
                            return `<div>• ${escapeHtml(f?.name)} (${escapeHtml(f?.skills)})</div>`;
                        }).join('')}
                    </div>
                    
                    <h3>📨 Invite New Contributors</h3>
                    <div class="grid-3">
                        ${availableFreelancers.length === 0 ? '<div class="message">No more contributors available to invite!</div>' :
                            availableFreelancers.map(f => `
                            <div class="freelancer-card">
                                <img class="profile-img" src="${escapeHtml(f.image)}" style="width:60px; height:60px;" onerror="this.src='https://via.placeholder.com/60'">
                                <h3>${escapeHtml(f.name)}</h3>
                                <div><strong>📌 Skills:</strong> ${escapeHtml(f.skills)}</div>
                                <div><strong>📞 Phone:</strong> ${escapeHtml(f.phone)}</div>
                                <div><strong>🎓 Experience:</strong> ${escapeHtml(f.pastExperience || 'N/A')}</div>
                                <button onclick="window.sendInvitation('${projectId}', '${f.email}')" class="btn btn-primary" style="width:100%; margin-top:1rem;">📨 Invite to Project</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Show freelancers error:", error);
            alert("Failed to load contributors: " + error.message);
        }
    };
    
    // ========== SEND INVITATION ==========
    window.sendInvitation = async function(projectId, freelancerEmail) {
        const session = getSession();
        if (!session) return;
        
        try {
            // Check if invitation already exists
            const existingInvitations = await getInvitationsByProject(projectId);
            const existing = existingInvitations.find(i => i.freelancerEmail === freelancerEmail && i.status === 'pending');
            
            if (existing) {
                alert("Invitation already sent to this contributor!");
                return;
            }
            
            const newInvitation = {
                projectId: projectId,
                clientEmail: session.email,
                freelancerEmail: freelancerEmail,
                status: "pending",
                sentAt: Date.now()
            };
            
            await createInvitationAPI(newInvitation);
            alert("Invitation sent successfully!");
            await renderClientDashboard(session.email);
        } catch (error) {
            console.error("Send invitation error:", error);
            alert("Failed to send invitation: " + error.message);
        }
    };
    
    // ========== TASK MANAGEMENT ==========
    window.showCreateTaskForm = async function(projectId, projectName) {
        try {
            const project = await apiFetch(`/projects/${projectId}`);
            const members = project?.contributors || [];
            const allUsers = await getUsers();
            
            const container = document.getElementById("app");
            container.innerHTML = `
                <div class="glass-card">
                    <div class="flex-between">
                        <h2>📋 Create New Task for: ${escapeHtml(projectName)}</h2>
                        <button onclick="window.goBackToClient()" class="btn btn-outline">← Back to Dashboard</button>
                    </div>
                    
                    <div class="form-group">
                        <label>Task Title</label>
                        <input type="text" id="taskTitle" placeholder="e.g., Design Homepage">
                    </div>
                    <div class="form-group">
                        <label>Task Description</label>
                        <textarea id="taskDescription" rows="3" placeholder="Detailed description of the task..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Assign To</label>
                        <select id="taskAssignee">
                            <option value="">Select contributor...</option>
                            ${members.map(m => {
                                const freelancer = allUsers.find(u => u.email === m.email);
                                return `<option value="${m.email}">${escapeHtml(freelancer?.name)} (${escapeHtml(freelancer?.skills)})</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <button onclick="window.createNewTask('${projectId}')" class="btn btn-primary" style="width:100%">✨ Create Task</button>
                </div>
            `;
        } catch (error) {
            console.error("Show create task form error:", error);
            alert("Failed to load form: " + error.message);
        }
    };
    
    window.createNewTask = async function(projectId) {
        const title = document.getElementById("taskTitle").value.trim();
        const description = document.getElementById("taskDescription").value.trim();
        const assignedTo = document.getElementById("taskAssignee").value;
        
        if (!title || !description || !assignedTo) {
            alert("Please fill all fields and assign to a contributor!");
            return;
        }
        
        try {
            await createTaskAPI({
                title,
                description,
                assignedTo,
                projectId,
                status: "todo"
            });
            
            alert("Task created successfully!");
            
            const session = getSession();
            if (session && session.email) {
                await renderClientDashboard(session.email);
            }
        } catch (error) {
            console.error("Create task error:", error);
            alert("Failed to create task: " + error.message);
        }
    };
    
    window.updateTask = async function(taskId, newStatus, freelancerEmail) {
        try {
            await updateTaskStatusAPI(taskId, newStatus);
            alert(`Task marked as ${newStatus}!`);
            await renderContributorDashboard(freelancerEmail);
        } catch (error) {
            console.error("Update task error:", error);
            alert("Failed to update task: " + error.message);
        }
    };
    
    window.showEditTaskForm = async function(taskId, currentTitle, currentDescription, currentAssignee) {
        const session = getSession();
        
        try {
            const task = await apiFetch(`/tasks/${taskId}`);
            if (!task) return;
            
            const project = await apiFetch(`/projects/${task.projectId}`);
            const members = project?.contributors || [];
            const allUsers = await getUsers();
            
            const container = document.getElementById("app");
            container.innerHTML = `
                <div class="glass-card">
                    <div class="flex-between">
                        <h2>✏️ Edit Task</h2>
                        <button onclick="window.goBackToClient()" class="btn btn-outline">Cancel</button>
                    </div>
                    
                    <div class="form-group">
                        <label>Task Title</label>
                        <input type="text" id="editTaskTitle" value="${escapeHtml(currentTitle)}">
                    </div>
                    <div class="form-group">
                        <label>Task Description</label>
                        <textarea id="editTaskDescription" rows="3">${escapeHtml(currentDescription)}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Assign To</label>
                        <select id="editTaskAssignee">
                            <option value="">Unassigned</option>
                            ${members.map(m => {
                                const freelancer = allUsers.find(u => u.email === m.email);
                                const selected = m.email === currentAssignee ? 'selected' : '';
                                return `<option value="${m.email}" ${selected}>${escapeHtml(freelancer?.name)} (${escapeHtml(freelancer?.skills)})</option>`;
                            }).join('')}
                        </select>
                    </div>
                    
                    <button onclick="window.saveTaskEdit('${taskId}')" class="btn btn-primary" style="width:100%">💾 Save Changes</button>
                </div>
            `;
        } catch (error) {
            console.error("Show edit task error:", error);
            alert("Failed to load task: " + error.message);
        }
    };
    
    window.saveTaskEdit = async function(taskId) {
        const title = document.getElementById("editTaskTitle").value.trim();
        const description = document.getElementById("editTaskDescription").value.trim();
        const assignee = document.getElementById("editTaskAssignee").value;
        const session = getSession();
        
        if (!title || !description) {
            alert("Please fill all fields!");
            return;
        }
        
        try {
            await updateTaskAPI(taskId, { title, description, assignedTo: assignee });
            alert("Task updated successfully!");
            await renderClientDashboard(session.email);
        } catch (error) {
            console.error("Save task edit error:", error);
            alert("Failed to update task: " + error.message);
        }
    };
    
    window.handleDeleteTask = async function(taskId) {
        if (!confirm("Are you sure you want to delete this task?")) return;
        
        const session = getSession();
        try {
            await deleteTaskAPI(taskId);
            alert("Task deleted successfully!");
            await renderClientDashboard(session.email);
        } catch (error) {
            console.error("Delete task error:", error);
            alert("Failed to delete task: " + error.message);
        }
    };
    
    // ========== TASK APPROVAL/REJECTION FOR MENTOR ==========
    window.approveTaskSubmission = async function(taskId, contributorEmail) {
        if (!confirm("Approve this submission? This will mark the task as completed.")) return;
        
        try {
            await updateTaskStatusAPI(taskId, 'approved', '', 'Task approved by project owner');
            alert("Task approved successfully! Contributor will receive certificate upon completing all tasks.");
            
            const session = getSession();
            if (session && session.email) {
                await renderClientDashboard(session.email);
            }
        } catch (error) {
            console.error("Approve task error:", error);
            alert("Failed to approve task: " + error.message);
        }
    };
    
    window.rejectTaskSubmission = async function(taskId, contributorEmail) {
        const feedback = prompt("Please provide feedback for revision (what needs to be fixed):");
        if (!feedback) {
            alert("Feedback is required when rejecting a submission.");
            return;
        }
        
        if (!confirm("Reject this submission? The contributor will need to resubmit with requested changes.")) return;
        
        try {
            await updateTaskStatusAPI(taskId, 'rejected', '', feedback);
            alert("Task rejected. Feedback has been sent to the contributor.");
            
            const session = getSession();
            if (session && session.email) {
                await renderClientDashboard(session.email);
            }
        } catch (error) {
            console.error("Reject task error:", error);
            alert("Failed to reject task: " + error.message);
        }
    };
    
    // ========== SUBMISSION FUNCTIONS ==========
    window.submitWorkForProject = async function(projectId, freelancerEmail) {
        const taskSelect = document.getElementById(`task-select-${projectId}`);
        if (!taskSelect) {
            alert("Please select a task to submit!");
            return;
        }
        
        const taskId = taskSelect.value;
        if (!taskId) {
            alert("Please select a task to submit!");
            return;
        }
        
        const fileUrl = document.getElementById(`fileUrl-${projectId}`).value.trim();
        const description = document.getElementById(`workDesc-${projectId}`).value.trim();
        
        if (!description) {
            alert("Please fill work description!");
            return;
        }
        
        try {
            const task = await apiFetch(`/tasks/${taskId}`);
            
            if (!task) {
                alert("Task not found!");
                return;
            }
            
            if (task.status !== 'in-progress') {
                alert("You can only submit work for tasks that are 'in-progress'!");
                return;
            }
            
            // Use the updated submitWork function which saves to task.submissionLink
            const success = await submitWork(projectId, freelancerEmail, taskId, task.title, description, fileUrl || "work_sample.pdf");
            
            if (success) {
                alert("Contribution submitted! Waiting for project owner approval.");
                await renderContributorDashboard(freelancerEmail);
            }
        } catch (error) {
            console.error("Submit work error:", error);
            alert("Failed to submit work: " + error.message);
        }
    };
    
    // ========== PROFILE MANAGEMENT ==========
    window.showEditProfileForm = async function(freelancerEmail) {
        try {
            const freelancer = await getUserByEmail(freelancerEmail);
            if (!freelancer) return;
            
            const container = document.getElementById("app");
            
            container.innerHTML = `
                <div class="glass-card">
                    <div class="flex-between">
                        <h2>✏️ Edit Profile</h2>
                        <button onclick="window.cancelEditProfile('${freelancerEmail}')" class="btn btn-outline">Cancel</button>
                    </div>
                    
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="editName" value="${escapeHtml(freelancer.name)}">
                    </div>
                    <div class="form-group">
                        <label>Category (Skills)</label>
                        <input type="text" id="editCategory" value="${escapeHtml(freelancer.skills || '')}">
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="text" id="editPhone" value="${escapeHtml(freelancer.phone || '')}">
                    </div>
                    <div class="form-group">
                        <label>Profile Image URL</label>
                        <input type="text" id="editImage" value="${escapeHtml(freelancer.image || '')}">
                    </div>
                    <div class="form-group">
                        <label>Skills & Experience</label>
                        <textarea id="editExperience" rows="3">${escapeHtml(freelancer.pastExperience || '')}</textarea>
                    </div>
                    
                    <button onclick="window.saveProfileEdit('${freelancerEmail}')" class="btn btn-primary" style="width:100%">💾 Save Changes</button>
                </div>
            `;
        } catch (error) {
            console.error("Show edit profile error:", error);
            alert("Failed to load profile: " + error.message);
        }
    };
    
    window.cancelEditProfile = function(email) {
        renderContributorDashboard(email);
    };
    
    window.saveProfileEdit = async function(email) {
        const updates = {
            name: document.getElementById("editName").value.trim(),
            skills: document.getElementById("editCategory").value.trim(),
            phone: document.getElementById("editPhone").value.trim(),
            image: document.getElementById("editImage").value.trim(),
            pastExperience: document.getElementById("editExperience").value.trim()
        };
        
        if (!updates.name || !updates.skills || !updates.phone || !updates.image || !updates.pastExperience) {
            alert("Please fill all fields!");
            return;
        }
        
        if (!isValidPhone(updates.phone)) {
            return;
        }
        
        try {
            await updateUserByEmail(email, updates);
            alert("Profile updated successfully!");
            await renderContributorDashboard(email);
        } catch (error) {
            console.error("Save profile error:", error);
            alert("Failed to update profile: " + error.message);
        }
    };
    
    // ========== TEAM MANAGEMENT ==========
    window.handleRemoveFreelancer = async function(projectId, freelancerEmail) {
        const session = getSession();
        if (session && confirm(`Are you sure you want to remove ${freelancerEmail} from this project?`)) {
            try {
                await removeContributorFromProject(projectId, freelancerEmail);
                alert("Contributor removed successfully!");
                await renderClientDashboard(session.email);
            } catch (error) {
                console.error("Remove freelancer error:", error);
                alert("Failed to remove contributor: " + error.message);
            }
        }
    };
    
    window.handleLeaveProject = async function(projectId, freelancerEmail) {
        if (confirm("Are you sure you want to leave this project?")) {
            try {
                await removeContributorFromProject(projectId, freelancerEmail);
                alert("You have left the project.");
                await renderContributorDashboard(freelancerEmail);
            } catch (error) {
                console.error("Leave project error:", error);
                alert("Failed to leave project: " + error.message);
            }
        }
    };
    
    // ========== CERTIFICATE FUNCTIONS ==========
    window.showCertificateVerifier = function() {
        const container = document.getElementById("app");
        
        container.innerHTML = `
            <div class="glass-card">
                <div class="flex-between">
                    <h2>🔍 Verify Certificate</h2>
                    <button onclick="window.goBackToVerifier()" class="btn btn-outline">← Back</button>
                </div>
                
                <div class="form-group">
                    <label>Enter Certificate Code</label>
                    <input type="text" id="certCode" placeholder="e.g., SB-XXXXXXXX-XXXX">
                </div>
                <button onclick="window.verifyAndShowCertificate()" class="btn btn-primary" style="width:100%">🔍 Verify Certificate</button>
                
                <div id="verificationResult" style="margin-top: 2rem;"></div>
            </div>
        `;
    };
    
    window.verifyAndShowCertificate = function() {
        const certCode = document.getElementById("certCode").value.trim().toUpperCase();
        if (!certCode) {
            alert("Please enter a certificate code!");
            return;
        }
        
        const certificate = verifyCertificate(certCode);
        const resultDiv = document.getElementById("verificationResult");
        
        if (certificate) {
            resultDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; border: 2px solid #48bb78; border-radius: 1rem; background: #f0fff4;">
                    <h3 style="color: #22543d;">✓ Valid Certificate</h3>
                    <div style="margin-top: 1rem; text-align: left;">
                        <p><strong>Certificate Code:</strong> ${certificate.certificateCode}</p>
                        <p><strong>Presented to:</strong> ${escapeHtml(certificate.contributorName)}</p>
                        <p><strong>Role:</strong> ${escapeHtml(certificate.contributorRole)}</p>
                        <p><strong>Project:</strong> ${escapeHtml(certificate.projectName)}</p>
                        <p><strong>Contribution:</strong> ${certificate.contributionPercentage}% (${certificate.completedTasks}/${certificate.totalTasks} tasks)</p>
                        <p><strong>Issue Date:</strong> ${new Date(certificate.issueDate).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; border: 2px solid #f56565; border-radius: 1rem; background: #fff5f5;">
                    <h3 style="color: #9b2c2c;">✗ Invalid Certificate</h3>
                    <p>The certificate code you entered could not be found.</p>
                </div>
            `;
        }
    };
    
    window.showCertificate = async function(projectId, contributorEmail) {
        try {
            const project = await apiFetch(`/projects/${projectId}`);
            const contributor = await getUserByEmail(contributorEmail);
            const tasks = await getTasksByProject(projectId);
            const userTasks = tasks.filter(t => t.assignedTo === contributorEmail);
            
            const certificate = viewCertificate(projectId, contributorEmail, project, contributor, userTasks);
            
            if (certificate) {
                const container = document.getElementById("app");
                
                container.innerHTML = `
                    <div class="glass-card" id="certificateContainer">
                        <div class="flex-between" style="margin-bottom: 1rem;">
                            <h2>🎓 Certificate of Completion</h2>
                            <div>
                                <button onclick="window.printCertificate()" class="btn btn-primary">🖨️ Print / Save as PDF</button>
                                <button onclick="window.goBackToContributor('${contributorEmail}')" class="btn btn-outline">← Back to Dashboard</button>
                            </div>
                        </div>
                        
                        <div id="certificate" style="text-align: center; padding: 3rem; border: 10px double #667eea; border-radius: 1rem; margin: 1rem 0; background: white;">
                            <h1 style="font-size: 2.5rem; color: #667eea; margin-bottom: 0.5rem;">SkillBridge</h1>
                            <p style="color: #4a5568; font-size: 1rem; margin-bottom: 2rem;">Student Collaboration Platform</p>
                            
                            <div style="width: 100px; height: 2px; background: linear-gradient(90deg, #667eea, #764ba2); margin: 1rem auto;"></div>
                            
                            <h2 style="font-size: 1.8rem; color: #2d3748; margin: 1rem 0;">Certificate of Contribution</h2>
                            
                            <p style="font-size: 1.1rem; color: #4a5568; margin: 1rem 0;">This certificate is proudly presented to</p>
                            
                            <h3 style="font-size: 2rem; margin: 1rem 0; color: #2d3748;">${escapeHtml(certificate.contributorName)}</h3>
                            
                            <p style="font-size: 1rem; margin: 1rem 0;">for successfully contributing to the project</p>
                            
                            <h4 style="font-size: 1.3rem; margin: 0.5rem 0; color: #667eea;">"${escapeHtml(certificate.projectName)}"</h4>
                            
                            <p style="margin: 0.5rem 0;">as a <strong>${escapeHtml(certificate.contributorRole)}</strong></p>
                            
                            <div style="background: #f7fafc; padding: 1rem; border-radius: 0.5rem; margin: 1.5rem 0; display: inline-block; min-width: 300px;">
                                <p><strong>Tasks Completed:</strong> ${certificate.completedTasks} / ${certificate.totalTasks}</p>
                                <p><strong>Contribution Score:</strong> ${certificate.contributionPercentage}%</p>
                                <p><strong>Issue Date:</strong> ${new Date(certificate.issueDate).toLocaleDateString()}</p>
                                <p><strong>Certificate Code:</strong> ${certificate.certificateCode}</p>
                            </div>
                            
                            <div style="margin-top: 2rem;">
                                <div style="border-top: 1px solid #e2e8f0; margin: 1rem 0;"></div>
                                <p style="font-size: 0.8rem; color: #a0aec0;">SkillBridge - Building Future Professionals</p>
                            </div>
                        </div>
                        
                        <div class="message" style="margin-top: 1rem; text-align: center;">
                            💡 <strong>Tip:</strong> Use the "Print / Save as PDF" button to download your certificate.
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Show certificate error:", error);
            alert("Failed to load certificate: " + error.message);
        }
    };
    
    window.printCertificate = function() {
        const certificateElement = document.getElementById('certificate');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>SkillBridge Certificate</title>
                    <style>
                        body {
                            font-family: system-ui, 'Segoe UI', -apple-system, sans-serif;
                            padding: 2rem;
                            margin: 0;
                        }
                        @media print {
                            body {
                                padding: 0;
                                margin: 0;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${certificateElement.outerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };
    
    window.goBackToVerifier = function() {
        const session = getSession();
        if (session && session.email) {
            (async () => {
                const user = await getUserByEmail(session.email);
                if (user && user.role === "project-owner") {
                    await renderClientDashboard(session.email);
                } else if (user && user.role === "contributor") {
                    await renderContributorDashboard(session.email);
                } else {
                    renderLogin();
                }
            })();
        } else {
            renderLogin();
        }
    };
    
    window.goBackToContributor = function(email) {
        renderContributorDashboard(email);
    };
    
    window.goBackToClient = async function() {
        const session = getSession();
        if (session && session.email) {
            await renderClientDashboard(session.email);
        }
    };
    
    window.logout = function() {
        clearSession();
        renderLogin();
    };
    
    // ========== START APP ==========
    (async function() {
        renderLogin();
    })();
})();