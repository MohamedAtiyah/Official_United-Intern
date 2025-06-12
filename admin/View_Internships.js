document.addEventListener('DOMContentLoaded', () => {
  const internshipsContainer = document.getElementById('internshipsContainer');
  const statusFilter = document.getElementById('statusFilter');
  const searchInput = document.getElementById('searchInput');


  let allInternships = [];
  let currentCompany = null;

  // Get current company info
  async function getCurrentCompany() {
    const companyData = sessionStorage.getItem('companyData') || localStorage.getItem('companyData');
    if (companyData) {
      return JSON.parse(companyData);
    }
    return null;
  }

  // Load all internships from all companies
  async function loadInternships() {
    try {
      currentCompany = await getCurrentCompany();
      if (!currentCompany) {
        internshipsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Please log in to view internships.</div>';
        return;
      }

      console.log('Loading all internships from all companies');
      const response = await fetch('/api/internships');
      if (response.ok) {
        allInternships = await response.json();
        console.log('Loaded internships:', allInternships);
        // Map the company_name field to company for display
        allInternships = allInternships.map(internship => ({
          ...internship,
          company: internship.company_name || internship.company || '[Company Name]'
        }));
        displayInternships(allInternships);
      } else {
        console.error('Failed to fetch internships, status:', response.status);
        internshipsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #dc3545;">Failed to load internships.</div>';
      }
    } catch (error) {
      console.error('Error loading internships:', error);
      internshipsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #dc3545;">Failed to load internships. Please try again later.</div>';
    }
  }

  // Display internships in the container
  function displayInternships(internships) {
    if (internships.length === 0) {
      internshipsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666; font-style: italic;">Internships are currently not listed due to no registration.</div>';
      return;
    }

    internshipsContainer.innerHTML = `
      <div style="padding: 20px;">
        <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #ddd;">
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #333; border-right: 1px solid #ddd;">Company</th>
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #333; border-right: 1px solid #ddd;">Title</th>
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #333; border-right: 1px solid #ddd;">Location</th>
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #333; border-right: 1px solid #ddd;">Duration</th>
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #333; border-right: 1px solid #ddd;">Type</th>
              <th style="padding: 12px; text-align: center; font-weight: 600; color: #333; border-right: 1px solid #ddd;">Status</th>
              <th style="padding: 12px; text-align: center; font-weight: 600; color: #333;">Applications</th>
            </tr>
          </thead>
          <tbody>
            ${internships.map(internship => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 12px; border-right: 1px solid #ddd; color: #333;">${internship.company}</td>
                <td style="padding: 12px; border-right: 1px solid #ddd; color: #333;">${internship.title}</td>
                <td style="padding: 12px; border-right: 1px solid #ddd; color: #333;">${internship.location}</td>
                <td style="padding: 12px; border-right: 1px solid #ddd; color: #333;">${internship.duration}</td>
                <td style="padding: 12px; border-right: 1px solid #ddd; color: #333;">${internship.type}</td>
                <td style="padding: 12px; text-align: center; border-right: 1px solid #ddd;">
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${internship.status === 'Active' ? '#d4edda' : '#f8d7da'}; color: ${internship.status === 'Active' ? '#155724' : '#721c24'};">${internship.status}</span>
                </td>
                <td style="padding: 12px; text-align: center; color: #333;">${internship.applications || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Filter internships based on selected filters and search
  function filterInternships() {
    const statusValue = statusFilter.value;
    const searchValue = searchInput.value.toLowerCase();

    let filteredInternships = allInternships.filter(internship => {
      const matchesStatus = statusValue === 'all' || internship.status.toLowerCase() === statusValue;
      const matchesSearch = internship.title.toLowerCase().includes(searchValue) ||
                           internship.location.toLowerCase().includes(searchValue) ||
                           internship.type.toLowerCase().includes(searchValue) ||
                           (internship.company || '[Company Name]').toLowerCase().includes(searchValue);

      return matchesStatus && matchesSearch;
    });

    displayInternships(filteredInternships);
  }



  // Event listeners
  statusFilter.addEventListener('change', filterInternships);
  searchInput.addEventListener('input', filterInternships);



  // Initial load
  loadInternships();
}); 