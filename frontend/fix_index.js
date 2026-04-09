const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const regex = /<script>\s*\/\/ Simple listener[\s\S]*?<\/script>/;

const replacement = `<script>
    // Outsourcing form API integration
    const outForm = document.getElementById('outsourcingForm');
    if (outForm) {
      const msgDiv = document.createElement('div');
      msgDiv.style.marginTop = '15px';
      msgDiv.style.fontSize = '14px';
      msgDiv.style.fontWeight = '600';
      msgDiv.style.textAlign = 'center';
      outForm.appendChild(msgDiv);

      outForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        
        btn.textContent = 'Sending...';
        btn.disabled = true;
        msgDiv.textContent = '';
        msgDiv.style.color = '';

        const name = document.getElementById('outName').value.trim();
        const email = document.getElementById('outEmail').value.trim();
        const serviceSelect = document.getElementById('outService');
        const service = serviceSelect.options[serviceSelect.selectedIndex].text;

        const payload = {
          name: name,
          email: email,
          subject: "Resource Outsourcing Inquiry",
          message: "Interested in hiring for: " + service
        };

        fetch('http://localhost:8081/api/contact/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        .then(response => {
          if (!response.ok) throw new Error('Server returned ' + response.status);
          return response.json();
        })
        .then(data => {
          msgDiv.style.color = '#10b981';
          msgDiv.textContent = 'Inquiry sent successfully! We will contact you shortly.';
          outForm.reset();
        })
        .catch(err => {
          console.error('Submission Error:', err);
          msgDiv.style.color = '#ef4444';
          msgDiv.textContent = 'Failed to submit inquiry. Please try again or email us directly.';
        })
        .finally(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        });
      });
    }
  </script>`;

if (regex.test(c)) {
   fs.writeFileSync('index.html', c.replace(regex, replacement), 'utf8');
   console.log('Successfully updated index.html');
} else {
   console.log('Target not found in index.html');
}
