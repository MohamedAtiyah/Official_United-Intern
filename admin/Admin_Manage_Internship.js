document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('internship-tbody');
  const addBtn = document.querySelector('.add-btn');
  let currentCompany = null;

  // Get company data from session storage
  function getCurrentCompany() {
    const companyData = sessionStorage.getItem('companyData');
    if (companyData) {
      currentCompany = JSON.parse(companyData);
      return currentCompany;
    }
    // Redirect to login if no company data
    window.location.href = 'Admin_Login.html';
    return null;
  }

  // Fetch and render internships for current company
  async function loadInternships() {
    if (!currentCompany) return;
    
    tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';
    try {
      const res = await fetch(`/api/internships/company/${currentCompany.id}`);
      const internships = await res.json();
      if (!internships.length) {
        tbody.innerHTML = '<tr><td colspan="8">No internships found. Click "Add New Internship" to create one.</td></tr>';
        return;
      }
      tbody.innerHTML = '';
      internships.forEach(internship => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${internship.company_name}</td>
          <td>${internship.title}</td>
          <td>${internship.location}</td>
          <td>${internship.duration}</td>
          <td>${internship.type}</td>
          <td><span class="status ${internship.status.toLowerCase()}">${internship.status}</span></td>
          <td>${internship.applications}</td>
          <td class="actions">
            <button class="edit-btn" data-id="${internship.id}">Edit</button>
            <button class="delete-btn" data-id="${internship.id}">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error loading internships:', err);
      tbody.innerHTML = '<tr><td colspan="8">Failed to load internships.</td></tr>';
    }
  }

  // Add button handler with automatic company assignment
  addBtn.addEventListener('click', async () => {
    if (!currentCompany) {
      alert('Please log in to add internships.');
      return;
    }

    const title = prompt('Internship Title:');
    if (!title) return;
    
    const description = prompt('Job Description:');
    if (!description) return;
    
    const location = prompt('Location:');
    if (!location) return;
    
    const duration = prompt('Duration (e.g., 3 months):');
    if (!duration) return;
    
    const type = prompt('Type (Full-time/Part-time):');
    if (!type) return;
    
    const requirements = prompt('Requirements:');
    if (!requirements) return;
    
    const status = prompt('Status (Active/Closed):', 'Active');
    if (!status) return;
    
    try {
      const res = await fetch('/api/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          location, 
          duration, 
          type, 
          requirements,
          status,
          companyId: currentCompany.id // Automatically use logged-in company
        })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        alert('Internship added successfully!');
        loadInternships();
      } else {
        alert(result.message || 'Failed to add internship.');
      }
    } catch (error) {
      console.error('Error adding internship:', error);
      alert('Failed to add internship.');
    }
  });

  // Delegate actions for edit and delete
  tbody.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    
    if (e.target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this internship?')) {
        try {
          const res = await fetch(`/api/internships/${id}`, { method: 'DELETE' });
          const result = await res.json();
          
          if (res.ok) {
            alert('Internship deleted successfully!');
            loadInternships();
          } else {
            alert(result.message || 'Failed to delete internship.');
          }
        } catch (error) {
          console.error('Error deleting internship:', error);
          alert('Failed to delete internship.');
        }
      }
    } else if (e.target.classList.contains('edit-btn')) {
      // For editing, get current values from the row
      const row = e.target.closest('tr').children;
      
      const title = prompt('Edit Title:', row[1].textContent);
      if (!title) return;
      
      const location = prompt('Edit Location:', row[2].textContent);
      if (!location) return;
      
      const duration = prompt('Edit Duration:', row[3].textContent);
      if (!duration) return;
      
      const type = prompt('Edit Type:', row[4].textContent);
      if (!type) return;
      
      const status = prompt('Edit Status:', row[5].textContent.trim());
      if (!status) return;

      const description = prompt('Edit Description:') || '';
      const requirements = prompt('Edit Requirements:') || '';
      
      try {
        const res = await fetch(`/api/internships/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title, 
            location, 
            duration, 
            type, 
            status,
            description,
            requirements
          })
        });
        
        const result = await res.json();
        
        if (res.ok) {
          alert('Internship updated successfully!');
          loadInternships();
        } else {
          alert(result.message || 'Failed to update internship.');
        }
      } catch (error) {
        console.error('Error updating internship:', error);
        alert('Failed to update internship.');
      }
    }
  });

  // Filter functionality
  const statusFilter = document.getElementById('statusFilter');
  const searchInput = document.getElementById('searchInput');
  
  let allInternships = [];
  
  // Modified loadInternships to store all internships
  async function loadInternshipsWithFilter() {
    if (!currentCompany) return;
    
    tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';
    try {
      const res = await fetch(`/api/internships/company/${currentCompany.id}`);
      allInternships = await res.json();
      filterInternships();
    } catch (err) {
      console.error('Error loading internships:', err);
      tbody.innerHTML = '<tr><td colspan="8">Failed to load internships.</td></tr>';
    }
  }
  
  // Filter internships
  function filterInternships() {
    const statusValue = statusFilter?.value || 'all';
    const searchValue = searchInput?.value?.toLowerCase() || '';
    
    let filteredInternships = allInternships.filter(internship => {
      const matchesStatus = statusValue === 'all' || internship.status.toLowerCase() === statusValue;
      const matchesSearch = internship.title.toLowerCase().includes(searchValue) ||
                           internship.location.toLowerCase().includes(searchValue) ||
                           internship.type.toLowerCase().includes(searchValue);
      
      return matchesStatus && matchesSearch;
    });
    
    if (!filteredInternships.length) {
      tbody.innerHTML = '<tr><td colspan="8">No internships found. Click "Add New Internship" to create one.</td></tr>';
      return;
    }
    
    tbody.innerHTML = '';
    filteredInternships.forEach(internship => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${internship.company_name}</td>
        <td>${internship.title}</td>
        <td>${internship.location}</td>
        <td>${internship.duration}</td>
        <td>${internship.type}</td>
        <td><span class="status ${internship.status.toLowerCase()}">${internship.status}</span></td>
        <td>${internship.applications}</td>
        <td class="actions">
          <button class="edit-btn" data-id="${internship.id}">Edit</button>
          <button class="delete-btn" data-id="${internship.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  // Add filter event listeners
  if (statusFilter) {
    statusFilter.addEventListener('change', filterInternships);
  }
  if (searchInput) {
    searchInput.addEventListener('input', filterInternships);
  }
  
  // Update loadInternships to use the new filter version
  loadInternships = loadInternshipsWithFilter;

  // Initialize page
  getCurrentCompany();
  if (currentCompany) {
    loadInternships();
  }
}); 