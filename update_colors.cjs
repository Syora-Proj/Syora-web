const fs = require('fs');
let css = fs.readFileSync('src/App.css', 'utf8');

// Mapping old colors to new CSS variables
const replacements = [
  [/var\(--warm-white\)/g, 'var(--bg-primary)'],
  [/var\(--cream\)/g, 'var(--bg-secondary)'],
  [/var\(--lilac\)/g, 'var(--bg-secondary)'],
  [/var\(--mauve\)/g, 'var(--brand-primary)'],
  [/var\(--deep-mauve\)/g, 'var(--brand-primary)'],
  [/var\(--grey-lilac\)/g, 'var(--border-color)'],
  [/var\(--dark\)/g, 'var(--text-main)'],
  [/var\(--muted\)/g, 'var(--text-muted)'],
  
  // Hardcoded hex colors
  [/#1A1A1A/gi, 'var(--text-main)'],
  [/#333\b/g, 'var(--text-muted)'],
  [/#3A1F24/gi, 'var(--brand-primary)'],
  [/#2A1519/gi, 'var(--brand-primary)'],
  [/#F8F5F0/gi, 'var(--bg-primary)'],
  [/#FAF7F2/gi, 'var(--bg-primary)'],
  
  // Adjust glassmorphism background to match new #F5E6D2 (245, 230, 210)
  [/rgba\(250, 247, 242, 0.7\)/g, 'rgba(245, 230, 210, 0.75)'],
];

replacements.forEach(([regex, replacement]) => {
  css = css.replace(regex, replacement);
});

fs.writeFileSync('src/App.css', css);
console.log('App.css updated successfully.');
