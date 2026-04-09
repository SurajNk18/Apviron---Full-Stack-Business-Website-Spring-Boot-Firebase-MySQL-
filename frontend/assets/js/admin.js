/**
 * Apviron — Admin Dashboard Controller
 * Fetches and displays contact inquiries from the Spring Boot API.
 */
(function () {
  'use strict';

  var API_URL = 'http://localhost:8081/api/contact';

  document.addEventListener('DOMContentLoaded', function () {
    var tableBody = document.getElementById('inquiryTableBody');
    var totalCount = document.getElementById('totalInquiries');
    var refreshBtn = document.getElementById('refreshBtn');
    var emptyState = document.getElementById('emptyState');

    if (!tableBody) return;

    // Load data on page load
    loadInquiries();

    // Refresh button
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        loadInquiries();
        showToast('Data refreshed successfully.', 'info');
      });
    }

    function loadInquiries() {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-text-muted);">Loading inquiries...</td></tr>';

      fetch(API_URL)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.status);
          }
          return response.json();
        })
        .then(function (data) {
          renderTable(data);
        })
        .catch(function (err) {
          console.error('Admin fetch error:', err);
          tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-red);">Failed to load data. Make sure the backend is running at ' + API_URL + '</td></tr>';
          if (totalCount) totalCount.textContent = '0';
        });
    }

    function renderTable(inquiries) {
      if (!inquiries || inquiries.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (totalCount) totalCount.textContent = '0';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';
      if (totalCount) totalCount.textContent = inquiries.length;

      tableBody.innerHTML = '';

      inquiries.forEach(function (inquiry) {
        var row = document.createElement('tr');
        row.innerHTML =
          '<td>' + escapeHtml(String(inquiry.id || '')) + '</td>' +
          '<td>' + escapeHtml(inquiry.fullName || '') + '</td>' +
          '<td>' + escapeHtml(inquiry.email || '') + '</td>' +
          '<td>' + escapeHtml(inquiry.phone || '') + '</td>' +
          '<td>' + escapeHtml(inquiry.companyName || '') + '</td>' +
          '<td>' + escapeHtml(inquiry.serviceRequired || '') + '</td>' +
          '<td title="' + escapeHtml(inquiry.message || '') + '">' + truncate(escapeHtml(inquiry.message || ''), 60) + '</td>';
        tableBody.appendChild(row);
      });
    }

    function escapeHtml(text) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(text));
      return div.innerHTML;
    }

    function truncate(str, maxLen) {
      if (str.length <= maxLen) return str;
      return str.substring(0, maxLen) + '...';
    }
  });
})();
