let currentCompanyId = null;
let allApplications = [];
let filteredApplications = [];
let currentPage = 1;
const applicationsPerPage = 10;

// Get company data from session storage
function getCurrentCompany() {
  const companyData = sessionStorage.getItem('companyData');
  if (companyData) {
    const company = JSON.parse(companyData);
    currentCompanyId = company.id;
    return company;
  }
  // Redirect to login if no company data
  window.location.href = 'Admin_Login.html';
  return null;
}

// Load applications from database
async function loadApplications() {
  if (!currentCompanyId) return;
  
  try {
    const response = await fetch(`/api/admin/applications/${currentCompanyId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }
    
    allApplications = await response.json();
    loadInternshipOptions();
    applyFilters();
  } catch (error) {
    console.error('Error loading applications:', error);
    document.getElementById('loadingMessage').textContent = 'Error loading applications. Please try again.';
  }
}

// Load internship options for filter
function loadInternshipOptions() {
  const internshipFilter = document.getElementById('internshipFilter');
  const internships = [...new Set(allApplications.map(app => app.internship_title))];
  
  // Clear existing options except "All Internships"
  internshipFilter.innerHTML = '<option value="all">All Internships</option>';
  
  internships.forEach(title => {
    const option = document.createElement('option');
    option.value = title;
    option.textContent = title;
    internshipFilter.appendChild(option);
  });
}

// Apply filters
function applyFilters() {
  const statusFilter = document.getElementById('statusFilter').value;
  const internshipFilter = document.getElementById('internshipFilter').value;
  const searchInput = document.getElementById('searchInput').value.toLowerCase();
  
  filteredApplications = allApplications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesInternship = internshipFilter === 'all' || app.internship_title === internshipFilter;
    const matchesSearch = searchInput === '' || app.student_name.toLowerCase().includes(searchInput);
    
    return matchesStatus && matchesInternship && matchesSearch;
  });
  
  currentPage = 1;
  displayApplications();
}

// Display applications in table
function displayApplications() {
  const tableBody = document.getElementById('applications-tbody');
  const loadingMessage = document.getElementById('loadingMessage');
  const noApplications = document.getElementById('noApplications');
  
  loadingMessage.style.display = 'none';
  
  if (filteredApplications.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No applications found matching your criteria.</td></tr>';
    noApplications.style.display = 'block';
    updatePagination();
    return;
  }
  
  noApplications.style.display = 'none';
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * applicationsPerPage;
  const endIndex = startIndex + applicationsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);
  
  tableBody.innerHTML = '';
  
  paginatedApplications.forEach(application => {
    const row = document.createElement('tr');
    const appliedDate = new Date(application.applied_date).toLocaleDateString();
    const statusClass = getStatusClass(application.status);
    
    row.innerHTML = `
      <td>${application.student_name}</td>
      <td>${application.student_email}</td>
      <td>${application.internship_title}</td>
      <td>${appliedDate}</td>
      <td><span class="status ${statusClass}">${capitalizeFirst(application.status)}</span></td>
      <td>
        <div class="actions">
          ${getActionButtons(application)}
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
  
  updatePagination();
}

// Get status class for styling
function getStatusClass(status) {
  switch(status) {
    case 'pending': return 'pending';
    case 'accepted': return 'accepted';
    case 'rejected': return 'rejected';
    default: return 'pending';
  }
}

// Capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get appropriate action buttons for application
function getActionButtons(application) {
  if (application.status === 'pending') {
    return `
      <button class="accept-btn" onclick="updateApplicationStatus(${application.id}, 'accepted')">Accept</button>
      <button class="reject-btn" onclick="updateApplicationStatus(${application.id}, 'rejected')">Reject</button>
    `;
  } else {
    return `
      <button class="accept-btn" ${application.status === 'accepted' ? 'disabled' : ''} onclick="updateApplicationStatus(${application.id}, 'accepted')">Accept</button>
      <button class="reject-btn" ${application.status === 'rejected' ? 'disabled' : ''} onclick="updateApplicationStatus(${application.id}, 'rejected')">Reject</button>
    `;
  }
}

// Update application status
async function updateApplicationStatus(applicationId, newStatus) {
  if (!confirm(`Are you sure you want to ${newStatus} this application?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/admin/application/${applicationId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: newStatus,
        companyId: currentCompanyId
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert(`Application ${newStatus} successfully!`);
      loadApplications(); // Reload to update the list
    } else {
      alert(result.message || `Failed to ${newStatus} application.`);
    }
  } catch (error) {
    console.error(`Error updating application status:`, error);
    alert(`Failed to ${newStatus} application. Please try again.`);
  }
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Pagination event handlers
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    displayApplications();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayApplications();
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  getCurrentCompany();
  loadApplications();
  
  // Add event listeners for filters
  document.getElementById('statusFilter').addEventListener('change', applyFilters);
  document.getElementById('internshipFilter').addEventListener('change', applyFilters);
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  
  // Add pagination event listeners
  document.getElementById('prevBtn').addEventListener('click', previousPage);
  document.getElementById('nextBtn').addEventListener('click', nextPage);
}); 