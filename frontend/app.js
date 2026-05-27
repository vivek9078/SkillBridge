(function() {

    // ========== BACKEND API BASE URL ==========
    const API_BASE = "http://localhost:5000/api";
    
    // ========== STORAGE KEYS ==========
    const STORAGE_USERS = "workhub_users_final";
    const STORAGE_PROJECTS = "workhub_projects_final";
    const STORAGE_INVITATIONS = "workhub_invitations_final";
    const STORAGE_PROJECT_MEMBERS = "workhub_project_members_final";
    const STORAGE_SUBMISSIONS = "workhub_submissions_final";
    const STORAGE_SESSION = "workhub_session_final";
    const STORAGE_TASKS = "workhub_tasks_final";
    const STORAGE_CERTIFICATES = "workhub_certificates_final";

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
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Fetch Error (${endpoint}):`, error);
            return null;
        }
    }
    
    // User API functions
    async function createUser(userData) {
        return await apiFetch('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    async function getUsersFromAPI() {
        return await apiFetch('/users');
    }
    
    async function getUserByEmail(email) {
        return await apiFetch(`/users/${email}`);
    }
    
    // Project API functions
    async function createProjectAPI(projectData) {
        return await apiFetch('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }
    
    async function getProjectsFromAPI() {
        return await apiFetch('/projects');
    }
    
    async function getProjectsByOwner(ownerEmail) {
        return await apiFetch(`/projects/owner/${ownerEmail}`);
    }
    
    // Task API functions
    async function createTaskAPI(taskData) {
        return await apiFetch('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }
    
    async function getTasksFromAPI() {
        return await apiFetch('/tasks');
    }
    
    async function getTasksByProjectAPI(projectId) {
        return await apiFetch(`/tasks/project/${projectId}`);
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

    // ========== INITIALIZE STORAGE ==========
    async function initializeStorage() {
        // Load users from backend if not in localStorage
        let users = JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
        if (users.length === 0) {
            const backendUsers = await getUsersFromAPI();
            if (backendUsers && backendUsers.length > 0) {
                localStorage.setItem(STORAGE_USERS, JSON.stringify(backendUsers));
            } else {
                const defaultUsers = [
                    { email: "client@demo.com",role: "project-owner", name: "John Project Owner", registered: true },
                    { email: "alice@dev.com", role: "contributor", name: "Alice Johnson", category: "Full Stack Developer", phone: "+1234567890", image: "https://randomuser.me/api/portraits/women/1.jpg", pastExperience: "7 years in React, Node.js, Python" }
                ];
                localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
                // Also save to backend
                for (const user of defaultUsers) {
                    await createUser(user);
                }
            }
        }
        
        // Load projects from backend
        const backendProjects = await getProjectsFromAPI();
        if (backendProjects && backendProjects.length > 0) {
            localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(backendProjects));
        } else if (!localStorage.getItem(STORAGE_PROJECTS)) {
            localStorage.setItem(STORAGE_PROJECTS, JSON.stringify([]));
        }
        
        // Load tasks from backend
        const backendTasks = await getTasksFromAPI();
        if (backendTasks && backendTasks.length > 0) {
            localStorage.setItem(STORAGE_TASKS, JSON.stringify(backendTasks));
        } else if (!localStorage.getItem(STORAGE_TASKS)) {
            localStorage.setItem(STORAGE_TASKS, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(STORAGE_INVITATIONS)) localStorage.setItem(STORAGE_INVITATIONS, JSON.stringify([]));
        if (!localStorage.getItem(STORAGE_PROJECT_MEMBERS)) localStorage.setItem(STORAGE_PROJECT_MEMBERS, JSON.stringify([]));
        if (!localStorage.getItem(STORAGE_SUBMISSIONS)) localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify([]));
        if (!localStorage.getItem(STORAGE_CERTIFICATES)) localStorage.setItem(STORAGE_CERTIFICATES, JSON.stringify([]));
        
        migrateOldHiredData();
    }
    
    function migrateOldHiredData() {
        const oldHired = localStorage.getItem("workhub_hired_final");
        const currentMembers = localStorage.getItem(STORAGE_PROJECT_MEMBERS);
        
        if (oldHired && JSON.parse(oldHired).length > 0 && (!currentMembers || JSON.parse(currentMembers).length === 0)) {
            const hired = JSON.parse(oldHired);
            const membersByProject = {};
            
            hired.forEach(h => {
                if (!membersByProject[h.projectId]) {
                    membersByProject[h.projectId] = [];
                }
                membersByProject[h.projectId].push({
                    freelancerEmail: h.freelancerEmail,
                    joinedAt: h.hiredAt || Date.now()
                });
            });
            
            const newMembers = Object.entries(membersByProject).map(([projectId, members]) => ({
                projectId,
                members
            }));
            
            localStorage.setItem(STORAGE_PROJECT_MEMBERS, JSON.stringify(newMembers));
        }
    }

    // ========== HELPER FUNCTIONS ==========
    function getUsers() { return JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]"); }
    async function saveUsers(users) { 
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
        // Sync with backend - save each user
       // for (const user of users) {
          //  await createUser(user);
       // }
    }
    
    function getProjects() { return JSON.parse(localStorage.getItem(STORAGE_PROJECTS) || "[]"); }
    async function saveProjects(projects) { 
        localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(projects));
        // Sync with backend - save each project
        //for (const project of projects) {
         //   await createProjectAPI(project);
        //}
    }
    
    function getInvitations() { return JSON.parse(localStorage.getItem(STORAGE_INVITATIONS) || "[]"); }
    function saveInvitations(invitations) { localStorage.setItem(STORAGE_INVITATIONS, JSON.stringify(invitations)); }
    function getProjectMembers() { return JSON.parse(localStorage.getItem(STORAGE_PROJECT_MEMBERS) || "[]"); }
    function saveProjectMembers(members) { localStorage.setItem(STORAGE_PROJECT_MEMBERS, JSON.stringify(members)); }
    function getSubmissions() { return JSON.parse(localStorage.getItem(STORAGE_SUBMISSIONS) || "[]"); }
    function saveSubmissions(submissions) { localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(submissions)); }
    function getSession() { return JSON.parse(localStorage.getItem(STORAGE_SESSION) || "null"); }
    function setSession(email, role) { localStorage.setItem(STORAGE_SESSION, JSON.stringify({ email, role })); }
    function clearSession() { localStorage.removeItem(STORAGE_SESSION); }
    function getCertificates() { return JSON.parse(localStorage.getItem(STORAGE_CERTIFICATES) || "[]"); }
    function saveCertificates(certificates) { localStorage.setItem(STORAGE_CERTIFICATES, JSON.stringify(certificates)); }
    
    // ========== VALIDATION FUNCTIONS ==========
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
    
    // ========== TASK MANAGEMENT FUNCTIONS ==========
    function getTasks() { return JSON.parse(localStorage.getItem(STORAGE_TASKS) || "[]"); }
    async function saveTasks(tasks) { 
        localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
        // Sync with backend - save each task
       // for (const task of tasks) {
        //    await createTaskAPI(task);
      //  }
    }
    
    function getTasksByProject(projectId) {
        const tasks = getTasks();
        return tasks.filter(t => t.projectId === projectId);
    }
    
    function getTasksByFreelancer(projectId, freelancerEmail) {
        const tasks = getTasks();
        return tasks.filter(t => t.projectId === projectId && t.assignedTo === freelancerEmail);
    }
    
    function resetTasksForFreelancer(projectId, freelancerEmail) {
        let tasks = getTasks();
        let updated = false;
        
        tasks = tasks.map(task => {
            if (task.projectId === projectId && task.assignedTo === freelancerEmail && task.status !== "approved") {
                updated = true;
                return {
                    ...task,
                    assignedTo: null,
                    status: "todo",
                    completedAt: null
                };
            }
            return task;
        });
        
        if (updated) {
            saveTasks(tasks);
        }
        return updated;
    }
    
    function canAssignToProject(projectId, freelancerEmail) {
        const members = getProjectMembersByProject(projectId);
        return members.some(m => m.freelancerEmail === freelancerEmail);
    }
    
    async function createTask(projectId, assignedTo, title, description) {
        const members = getProjectMembersByProject(projectId);
        const isValidAssignee = members.some(m => m.freelancerEmail === assignedTo);
        
        if (!isValidAssignee) {
            throw new Error("Task can only be assigned to team members!");
        }
        
        const tasks = getTasks();
        const newTask = {
            id: "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
            projectId: projectId,
            title: title,
            description: description,
            assignedTo: assignedTo,
            status: "todo",
            createdAt: Date.now(),
            completedAt: null,
            submissionId: null
        };
        tasks.push(newTask);
        await saveTasks(tasks);
        // Also save to backend
        await createTaskAPI({
            title, description, assignedTo, projectId, status: "todo"
        });
        return newTask;
    }
    
    async function updateTaskStatus(taskId, newStatus, requestingEmail) {
        let tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            alert("Task not found!");
            return false;
        }
        
        const task = tasks[taskIndex];
        
        if (task.assignedTo !== requestingEmail) {
            alert("You can only update tasks assigned to you!");
            return false;
        }
        
        const validTransitions = {
            'todo': ['in-progress'],
            'in-progress': ['submitted'],
            'submitted': [],
            'approved': [],
            'rejected': ['in-progress']
        };
        
        if (!validTransitions[task.status].includes(newStatus)) {
            alert(`Cannot change from ${task.status} to ${newStatus}`);
            return false;
        }
        
        task.status = newStatus;
        if (newStatus === 'approved') {
            task.completedAt = Date.now();
        } else if (newStatus === 'rejected') {
            task.completedAt = null;
        }
        
        tasks[taskIndex] = task;
        await saveTasks(tasks);
        // Update in backend
        await updateTaskStatusAPI(taskId, newStatus);
        return true;
    }
    
    async function editTask(taskId, updatedTitle, updatedDescription, updatedAssignee, clientEmail) {
        let tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            alert("Task not found!");
            return false;
        }
        
        const task = tasks[taskIndex];
        const project = getProjects().find(p => p.id === task.projectId);
        
        if (!project || project.clientEmail !== clientEmail) {
            alert("Only the project owner can edit tasks!");
            return false;
        }
        
        if (updatedAssignee !== task.assignedTo) {
            const isValidAssignee = canAssignToProject(task.projectId, updatedAssignee);
            if (!isValidAssignee) {
                alert("Can only reassign to team members!");
                return false;
            }
        }
        
        task.title = updatedTitle;
        task.description = updatedDescription;
        task.assignedTo = updatedAssignee;
        
        tasks[taskIndex] = task;
        await saveTasks(tasks);
        // Update in backend
        await updateTaskAPI(taskId, { title: updatedTitle, description: updatedDescription, assignedTo: updatedAssignee });
        return true;
    }
    
    async function deleteTask(taskId, clientEmail) {
        let tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            alert("Task not found!");
            return false;
        }
        
        const task = tasks[taskIndex];
        const project = getProjects().find(p => p.id === task.projectId);
        
        if (!project || project.clientEmail !== clientEmail) {
            alert("Only the project owner can delete tasks!");
            return false;
        }
        
        if (confirm(`Are you sure you want to delete task: "${task.title}"?`)) {
            tasks.splice(taskIndex, 1);
            await saveTasks(tasks);
            // Delete in backend
            await deleteTaskAPI(taskId);
            return true;
        }
        return false;
    }
    
    // ========== TEAM MANAGEMENT FUNCTIONS ==========
    function removeFreelancer(projectId, freelancerEmail, clientEmail) {
        const projects = getProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (!project || project.clientEmail !== clientEmail) {
            alert("You don't have permission to remove members from this project!");
            return false;
        }
        
        const tasks = getTasksByFreelancer(projectId, freelancerEmail);
        const hasCompletedTasks = tasks.some(t => t.status === 'approved');
        
        if (hasCompletedTasks) {
            alert("Cannot remove member with approved tasks. Please handle approved tasks first.");
            return false;
        }
        
        const hasPendingTasks = tasks.some(t => t.status !== 'approved' && t.status !== 'todo');
        
        if (hasPendingTasks) {
            const confirm = window.confirm("This contributor has pending tasks. These tasks will be reset and unassigned. Continue?");
            if (!confirm) return false;
            
            resetTasksForFreelancer(projectId, freelancerEmail);
        }
        
        let membersList = getProjectMembers();
        const projectMembersIndex = membersList.findIndex(pm => pm.projectId === projectId);
        
        if (projectMembersIndex !== -1) {
            const memberIndex = membersList[projectMembersIndex].members.findIndex(
                m => m.freelancerEmail === freelancerEmail
            );
            
            if (memberIndex !== -1) {
                membersList[projectMembersIndex].members.splice(memberIndex, 1);
                saveProjectMembers(membersList);
                alert(`Contributor has been removed from the project.`);
                return true;
            }
        }
        
        alert("Contributor not found in project members!");
        return false;
    }
    
    function leaveProject(projectId, freelancerEmail) {
        const members = getProjectMembersByProject(projectId);
        const isMember = members.some(m => m.freelancerEmail === freelancerEmail);
        
        if (!isMember) {
            alert("You are not a member of this project!");
            return false;
        }
        
        const tasks = getTasksByFreelancer(projectId, freelancerEmail);
        const hasPendingTasks = tasks.some(t => t.status !== 'approved');
        
        if (hasPendingTasks) {
            const confirm = window.confirm("You have pending tasks. If you leave, these tasks will be reset and unassigned. Continue?");
            if (!confirm) return false;
            
            resetTasksForFreelancer(projectId, freelancerEmail);
        }
        
        let membersList = getProjectMembers();
        const projectMembersIndex = membersList.findIndex(pm => pm.projectId === projectId);
        
        if (projectMembersIndex !== -1) {
            const memberIndex = membersList[projectMembersIndex].members.findIndex(
                m => m.freelancerEmail === freelancerEmail
            );
            
            if (memberIndex !== -1) {
                membersList[projectMembersIndex].members.splice(memberIndex, 1);
                saveProjectMembers(membersList);
                alert(`You have left the project.`);
                return true;
            }
        }
        
        alert("Failed to leave project!");
        return false;
    }
    
    // ========== TASK-BASED PROGRESS CALCULATIONS ==========
    function getFreelancerTaskProgress(projectId, freelancerEmail) {
        const tasks = getTasksByFreelancer(projectId, freelancerEmail);
        if (tasks.length === 0) return 0;
        const approvedTasks = tasks.filter(t => t.status === 'approved').length;
        return Math.round((approvedTasks / tasks.length) * 100);
    }
    
    function getProjectTaskProgress(projectId) {
        const tasks = getTasksByProject(projectId);
        if (tasks.length === 0) return 0;
        const approvedTasks = tasks.filter(t => t.status === 'approved').length;
        return Math.round((approvedTasks / tasks.length) * 100);
    }
    
    // ========== CERTIFICATE FUNCTIONS ==========
    function generateCertificate(projectId, contributorEmail) {
        const project = getProjects().find(p => p.id === projectId);
        const contributor = findUser(contributorEmail);
        const tasks = getTasksByFreelancer(projectId, contributorEmail);
        const approvedTasks = tasks.filter(t => t.status === 'approved').length;
        const contributionScore = tasks.length > 0 ? Math.round((approvedTasks / tasks.length) * 100) : 0;
        
        const allTasksApproved = tasks.length > 0 && tasks.every(t => t.status === 'approved');
        
        if (!allTasksApproved) {
            return null;
        }
        
        const certificates = getCertificates();
        const existingCert = certificates.find(c => c.projectId === projectId && c.contributorEmail === contributorEmail);
        
        if (existingCert) return existingCert;
        
        const submissions = getSubmissions();
        const taskSubmissions = submissions.filter(s => s.taskId && tasks.some(t => t.id === s.taskId));
        const feedbackList = taskSubmissions.filter(s => s.feedback).map(s => s.feedback);
        
        const newCertificate = {
            id: "cert_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
            projectId: projectId,
            projectName: project.projectName,
            contributorEmail: contributorEmail,
            contributorName: contributor.name,
            contributorRole: contributor.category,
            completedTasks: approvedTasks,
            totalTasks: tasks.length,
            contributionPercentage: contributionScore,
            issueDate: Date.now(),
            feedback: feedbackList,
            certificateCode: "SB-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase()
        };
        
        certificates.push(newCertificate);
        saveCertificates(certificates);
        return newCertificate;
    }
    
    function viewCertificate(projectId, contributorEmail) {
        const certificate = generateCertificate(projectId, contributorEmail);
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
    
    // ========== TEAM MEMBER FUNCTIONS ==========
    function getProjectMembersByProject(projectId) {
        const members = getProjectMembers();
        const record = members.find(pm => pm.projectId === projectId);
        return record ? record.members.map(m => ({
            freelancerEmail: m.freelancerEmail,
            joinedAt: m.joinedAt
        })) : [];
    }
    
    function addMemberToProject(projectId, freelancerEmail) {
        let membersList = getProjectMembers();
        let record = membersList.find(pm => pm.projectId === projectId);
        
        if (!record) {
            record = { projectId, members: [] };
            membersList.push(record);
        }
        
        if (!record.members.some(m => m.freelancerEmail === freelancerEmail)) {
            record.members.push({
                freelancerEmail: freelancerEmail,
                joinedAt: Date.now()
            });
            saveProjectMembers(membersList);
        }
        return record;
    }
    
    // ========== CONTRIBUTOR PROFILE FUNCTIONS ==========
    function getFreelancerProfile(email) {
        const users = getUsers();
        return users.find(u => u.email === email && u.role === "freelancer");
    }
    
    async function updateFreelancerProfile(email, updates) {
        let users = getUsers();
        const userIndex = users.findIndex(u => u.email === email && u.role === "freelancer");
        
        if (userIndex === -1) {
            alert("Contributor not found!");
            return false;
        }
        
        const allowedUpdates = ['name', 'category', 'phone', 'image', 'pastExperience'];
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                users[userIndex][field] = updates[field];
            }
        });
        
        await saveUsers(users);
        return true;
    }
    
    function findUser(email) {
        const users = getUsers();
        return users.find(u => u.email === email);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // ========== SUBMISSION FUNCTIONS ==========
    function submitWork(projectId, freelancerEmail, taskId, milestone, description, fileUrl) {
        const submissions = getSubmissions();
        
        const existingSubmission = submissions.find(s => s.taskId === taskId && s.status === 'pending');
        if (existingSubmission) {
            alert("You already have a pending submission for this task. Wait for review.");
            return false;
        }
        
        submissions.push({
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
        });                 
        saveSubmissions(submissions);
        
        let tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = 'submitted';
            tasks[taskIndex].submissionId = submissions[submissions.length - 1].id;
            saveTasks(tasks);
            // Update in backend
            updateTaskStatusAPI(taskId, 'submitted');
        }
        
        return true;
    }
    
    window.approveWork = function(submissionId, projectId, freelancerEmail, clientEmail) {
        let submissions = getSubmissions();
        const submissionIndex = submissions.findIndex(s => s.id == submissionId);
        if (submissionIndex === -1) {
            alert("Submission not found!");
            return;
        }
        
        const submission = submissions[submissionIndex];
        if (submission.status !== "pending") {
            alert("This submission has already been processed.");
            return;
        }
        
        const feedback = prompt("Add feedback for this contribution (optional):", "Great work!");
        
        submission.status = "approved";
        submission.approvedAt = Date.now();
        submission.feedback = feedback || "No feedback provided";
        saveSubmissions(submissions);
        
        let tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t.id === submission.taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = 'approved';
            tasks[taskIndex].completedAt = Date.now();
            saveTasks(tasks);
            // Update in backend
            updateTaskStatusAPI(submission.taskId, 'approved', '', feedback);
        }
        
        alert(`✅ Contribution Approved! ${feedback ? 'Feedback: ' + feedback : ''}`);
        
        const session = getSession();
        if (session && session.email === clientEmail) {
            renderClientDashboard(clientEmail);
        } else if (session && session.email === freelancerEmail) {
            renderFreelancerDashboard(freelancerEmail);
        }
    };
    
    window.rejectWork = function(submissionId, projectId, freelancerEmail, clientEmail) {
        let submissions = getSubmissions();
        const submissionIndex = submissions.findIndex(s => s.id == submissionId);
        if (submissionIndex === -1) {
            alert("Submission not found!");
            return;
        }
        
        const submission = submissions[submissionIndex];
        if (submission.status !== "pending") {
            alert("This submission has already been processed.");
            return;
        }
        
        const feedback = prompt("Provide feedback for revision (required):", "Please fix the following issues...");
        if (!feedback) {
            alert("Feedback is required when rejecting a submission.");
            return;
        }
        
        submission.status = "rejected";
        submission.rejectedAt = Date.now();
        submission.feedback = feedback;
        saveSubmissions(submissions);
        
        let tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t.id === submission.taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = 'rejected';
            tasks[taskIndex].completedAt = null;
            saveTasks(tasks);
            // Update in backend
            updateTaskStatusAPI(submission.taskId, 'rejected', '', feedback);
        }
        
        alert("⚠️ Contribution marked for revision. Feedback: " + feedback);
        
        const session = getSession();
        if (session && session.email === clientEmail) {
            renderClientDashboard(clientEmail);
        } else if (session && session.email === freelancerEmail) {
            renderFreelancerDashboard(freelancerEmail);
        }
    };

    // ========== PROJECT OWNER DASHBOARD ==========
    // [Keep all existing renderClientDashboard code exactly as is]
    // The function remains unchanged - it already uses getProjects(), getTasks(), etc.
    // which now fetch from localStorage that is synced with backend
    
    // ========== CONTRIBUTOR DASHBOARD ==========
    // [Keep all existing renderFreelancerDashboard code exactly as is]
    
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
        
        const projects = getProjects();
        const newProject = {
            id: "proj_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
            clientEmail: clientEmail,
            clientName: clientEmail.split('@')[0],
            projectName: projectName,
            domain: domain,
            difficulty: difficulty,
            description: description,
            details: details,
            deadline: deadline ? `${deadline} days` : "Flexible",
            status: "available",
            createdAt: Date.now()
        };
        
        projects.push(newProject);
        await saveProjects(projects);
        // Save to backend
        await createProjectAPI({
            projectName, domain, difficulty, description, 
            ownerEmail: clientEmail,
            status: "available"
        });
        renderClientDashboard(clientEmail);
    };

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

        // Check if user exists in localStorage or create new
        let users = getUsers();
        let existingUser = users.find(u => u.email === email);
        
        if (!existingUser) {
            // Create new user in localStorage and backend
            const newUser = { email, role: "project-owner", name, registered: true };
            users.push(newUser);
            await saveUsers(users);
            await createUser({ name, email, role: "project-owner", phone: "", skills: "" });
        }
        
        setSession(email, "client");
        renderClientDashboard(email);
    };

    window.showFreelancerLogin = function() {
        const formDiv = document.getElementById("loginForm");
        formDiv.innerHTML = `
            <div class="form-group"><label>Email</label><input type="email" id="freelancerEmail" placeholder="contributor@example.com"></div>
            <button onclick="window.checkFreelancer()" class="btn btn-primary" style="width:100%">Check / Register →</button>
            <div id="regForm" style="display:none; margin-top:1.5rem;"></div>
        `;
    };

    window.checkFreelancer = function() {
        const email = document.getElementById("freelancerEmail").value.trim().toLowerCase();
        if (!email) return alert("Enter email");
        
        if (!isValidEmail(email)) {
            return;
        }
        
        const existing = findUser(email);
        if (existing && existing.role === "freelancer") {
            setSession(email, "freelancer");
            renderFreelancerDashboard(email);
        } else if (existing && existing.role === "client") {
            alert("Email registered as project owner");
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

        const users = getUsers();
        const newUser = {
            email,
            name,
            category,
            phone,
            image,
            pastExperience: experience,
            role: "contributor",
            registered: true
        };
        
        users.push(newUser);
        await saveUsers(users);
        
        // Save to backend
        await createUser({ name, email, role: "contributor", phone, skills: category });

        setSession(email, "freelancer");
        renderFreelancerDashboard(email);
    };

    window.logout = function() {
        clearSession();
        renderLogin();
    };
    
    // ========== CERTIFICATE VERIFICATION FUNCTIONS ==========
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
                        ${certificate.feedback && certificate.feedback.length > 0 ? `<p><strong>Feedback:</strong> ${certificate.feedback.join(', ')}</p>` : ''}
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
    
    window.goBackToVerifier = function() {
        const session = getSession();
        if (session && session.email) {
            const user = findUser(session.email);
            if (user && user.role === "client") {
                renderClientDashboard(session.email);
            } else if (user && user.role === "freelancer") {
                renderFreelancerDashboard(session.email);
            } else {
                renderLogin();
            }
        } else {
            renderLogin();
        }
    };
    
    window.goBackToContributor = function(email) {
        renderFreelancerDashboard(email);
    };
    
    window.submitWorkForProject = function(projectId, freelancerEmail, clientEmail) {
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
        
        const tasks = getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
            alert("Task not found!");
            return;
        }
        
        if (task.status !== 'in-progress') {
            alert("You can only submit work for tasks that are 'in-progress'!");
            return;
        }
        
        const success = submitWork(projectId, freelancerEmail, taskId, task.title, description, fileUrl || "work_sample.pdf");
        
        if (success) {
            alert("Contribution submitted! Waiting for project owner approval.");
            
            const session = getSession();
            if (session && session.email === freelancerEmail) {
                renderFreelancerDashboard(freelancerEmail);
            }
        }
    };
    
    window.handleLeaveProject = function(projectId, freelancerEmail) {
        if (confirm("Are you sure you want to leave this project?")) {
            leaveProject(projectId, freelancerEmail);
            renderFreelancerDashboard(freelancerEmail);
        }
    };
    
    window.updateTask = async function(taskId, newStatus, freelancerEmail) {
        const success = await updateTaskStatus(taskId, newStatus, freelancerEmail);
        if (success) {
            alert(`Task marked as ${newStatus}!`);
            renderFreelancerDashboard(freelancerEmail);
        }
    };
    
    window.showEditProfileForm = function(freelancerEmail) {
        const freelancer = getFreelancerProfile(freelancerEmail);
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
                    <input type="text" id="editCategory" value="${escapeHtml(freelancer.category)}">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="editPhone" value="${escapeHtml(freelancer.phone)}">
                </div>
                <div class="form-group">
                    <label>Profile Image URL</label>
                    <input type="text" id="editImage" value="${escapeHtml(freelancer.image)}">
                </div>
                <div class="form-group">
                    <label>Skills & Experience</label>
                    <textarea id="editExperience" rows="3">${escapeHtml(freelancer.pastExperience)}</textarea>
                </div>
                
                <button onclick="window.saveProfileEdit('${freelancerEmail}')" class="btn btn-primary" style="width:100%">💾 Save Changes</button>
            </div>
        `;
    };
    
    window.cancelEditProfile = function(email) {
        renderFreelancerDashboard(email);
    };
    
    window.saveProfileEdit = async function(email) {
        const updates = {
            name: document.getElementById("editName").value.trim(),
            category: document.getElementById("editCategory").value.trim(),
            phone: document.getElementById("editPhone").value.trim(),
            image: document.getElementById("editImage").value.trim(),
            pastExperience: document.getElementById("editExperience").value.trim()
        };
        
        if (!updates.name || !updates.category || !updates.phone || !updates.image || !updates.pastExperience) {
            alert("Please fill all fields!");
            return;
        }
        
        if (!isValidPhone(updates.phone)) {
            return;
        }
        
        if (await updateFreelancerProfile(email, updates)) {
            alert("Profile updated successfully!");
            renderFreelancerDashboard(email);
        }
    };

    window.respondToInvitation = function(invitationId, response, freelancerEmail, projectId) {
        let invitations = getInvitations();
        const invitationIndex = invitations.findIndex(i => i.id === invitationId);
        
        if (invitationIndex === -1) {
            alert("Invitation not found!");
            return;
        }
        
        if (response === 'accept') {
            invitations[invitationIndex].status = 'accepted';
            saveInvitations(invitations);
            
            addMemberToProject(projectId, freelancerEmail);
            
            let projects = getProjects();
            const projectIndex = projects.findIndex(p => p.id === projectId);
            if (projectIndex !== -1 && projects[projectIndex].status === 'available') {
                projects[projectIndex].status = 'hired';
                saveProjects(projects);
            }
            
            alert("You've joined the team! The project owner will assign tasks for you to complete.");
        } else {
            invitations[invitationIndex].status = 'rejected';
            saveInvitations(invitations);
            alert("Invitation rejected.");
        }
        
        renderFreelancerDashboard(freelancerEmail);
    };

    // [Keep renderClientDashboard function - unchanged but ensure it uses async where needed]
    // [Keep renderFreelancerDashboard function - unchanged]
    // [Keep showCertificate, printCertificate, etc. - unchanged]
    
    // Note: renderClientDashboard and renderFreelancerDashboard are kept exactly as in original
    // They already call getProjects(), getTasks(), etc. which now fetch from synced localStorage

    // ========== START APP ==========
    (async function() {
        await initializeStorage();
        const session = getSession();
        if (session && session.email) {
            const user = findUser(session.email);
            if (user && user.role === "client") {
                renderClientDashboard(session.email);
            } else if (user && user.role === "freelancer") {
                renderFreelancerDashboard(session.email);
            } else {
                renderLogin();
            }
        } else {
            renderLogin();
        }
    })();
})();