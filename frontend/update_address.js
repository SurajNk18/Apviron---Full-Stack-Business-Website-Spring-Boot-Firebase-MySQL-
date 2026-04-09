const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/HP BENCH/Desktop/project/frontend';
const newAddressLines = "Shree Ganesh Tower, Unit E, Office No. 104,<br>Sector No. 4, Moshi Pradhikaran,<br>Moshi, Pune – 412105, Maharashtra, India";
const newAddressSingleLine = "Shree Ganesh Tower, Unit E, Office No. 104, Sector No. 4, Moshi Pradhikaran, Moshi, Pune – 412105";

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update footer
    content = content.replace(/<div class="footer__contact-item">\s*<span class="footer__contact-icon">(?:&#128205;|📍)<\/span>\s*<span>India<\/span>\s*<\/div>/g, 
        `<div class="footer__contact-item" style="align-items: flex-start;">\n            <span class="footer__contact-icon" style="margin-top: 4px;">📍</span>\n            <span>Shree Ganesh Tower, Unit E, Office No. 104,<br>Sector No. 4, Moshi Pradhikaran,<br>Moshi, Pune – 412105</span>\n          </div>`);

    // For files where it's formatted differently
    content = content.replace(/<span class="footer__contact-icon">(?:.*?📍.*?)<\/span>\s*<span>India<\/span>/g,
        `<span class="footer__contact-icon" style="margin-top: 4px;">📍</span>\n            <span>Shree Ganesh Tower, Unit E, Office No. 104,<br>Sector No. 4, Moshi Pradhikaran,<br>Moshi, Pune – 412105</span>`);
    content = content.replace(/<span class="footer__contact-icon">(?:.*?&#128205;.*?)<\/span>\s*<span>India<\/span>/g,
        `<span class="footer__contact-icon" style="margin-top: 4px;">📍</span>\n            <span>Shree Ganesh Tower, Unit E, Office No. 104,<br>Sector No. 4, Moshi Pradhikaran,<br>Moshi, Pune – 412105</span>`);

    if (file === 'contact.html') {
        // Update contact method
        content = content.replace(/<p>123 Innovation Drive<br>Tech Hub City, 411014, India<\/p>/g,
            `<p>Shree Ganesh Tower, Unit E, Office No. 104,<br>Sector No. 4, Moshi Pradhikaran,<br>Moshi, Pune – 412105</p>`);

        // Update location card
        content = content.replace(/<p class="ct-loc-card__text">123 Innovation Drive<br>Tech Hub City, Pune<br>Maharashtra, 411014<\/p>/g,
            `<p class="ct-loc-card__text">Shree Ganesh Tower, Unit E, Office No. 104,<br>Sector No. 4, Moshi Pradhikaran,<br>Moshi, Pune – 412105</p>`);
            
        // Update iframe
        content = content.replace(/src="https:\/\/www\.google\.com\/maps\/embed\?pb=[^"]*"/g,
            `src="https://maps.google.com/maps?q=Shree%20Ganesh%20Tower,%20Sector%20No.%204,%20Moshi%20Pradhikaran,%20Moshi,%20Pune%20%E2%80%93%20412105&t=&z=13&ie=UTF8&iwloc=&output=embed"`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
});
