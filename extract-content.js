// Content-Extraktor für hs-straubing.de (alle 22 Seiten)

const https = require('https');
const fs = require('fs');
const path = require('path');

const pages = [
  { slug: 'home', url: 'https://hs-straubing.de/', title: 'Home' },
  { slug: 'heizungsbau', url: 'https://hs-straubing.de/heizungsbau/', title: 'Heizungsbau' },
  { slug: 'luftwaermepumpe', url: 'https://hs-straubing.de/waermepumpe/luftwaermepumpe/', title: 'Luftwärmepumpe' },
  { slug: 'hydraulischer-abgleich', url: 'https://hs-straubing.de/heizungsbau/hydraulischer-abgleich/', title: 'Hydraulischer Abgleich' },
  { slug: '10-jahre-garantie', url: 'https://hs-straubing.de/10-jahre-garantie/', title: '10 Jahre Garantie' },
  { slug: 'heizungswartung', url: 'https://hs-straubing.de/heizungswartung/', title: 'Heizungswartung & Notdienst' },
  { slug: 'kaminoefen', url: 'https://hs-straubing.de/kaminoefen/', title: 'Kaminöfen' },
  { slug: 'heizungsausstellung', url: 'https://hs-straubing.de/kaminoefen/heizungsausstellung/', title: 'Heizungsausstellung' },
  { slug: 'badsanierung', url: 'https://hs-straubing.de/badsanierung/', title: 'Badsanierung' },
  { slug: 'komplettbadsanierung', url: 'https://hs-straubing.de/badsanierung/komplettbadsanierung/', title: 'Komplettbadsanierung' },
  { slug: 'lueftung-wasser', url: 'https://hs-straubing.de/lueftung-wasser/', title: 'Lüftung & Wasser' },
  { slug: 'klimaanlage', url: 'https://hs-straubing.de/klimaanlage/', title: 'Klimaanlage' },
  { slug: 'split-klimaanlage', url: 'https://hs-straubing.de/klimaanlage/split-klimaanlage/', title: 'Split-Klimaanlage' },
  { slug: 'multisplit-klimaanlage', url: 'https://hs-straubing.de/klimaanlage/multisplit-klimaanlage/', title: 'Multisplit-Klimaanlage' },
  { slug: 'ueber-uns', url: 'https://hs-straubing.de/ueber-uns/', title: 'Über uns' },
  { slug: 'jobs', url: 'https://hs-straubing.de/jobs/', title: 'Jobs' },
  { slug: 'kontakt', url: 'https://hs-straubing.de/kontakt/', title: 'Kontakt' },
  { slug: 'impressum', url: 'https://hs-straubing.de/impressum/', title: 'Impressum' },
  { slug: 'datenschutz', url: 'https://hs-straubing.de/datenschutz/', title: 'Datenschutz' },
  { slug: 'cookie-richtlinie', url: 'https://hs-straubing.de/cookie-richtlinie-eu/', title: 'Cookie-Richtlinie' }
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractContent(html) {
  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&') : '';
  
  // Main content (zwischen <main> oder <article>)
  let content = '';
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  
  if (mainMatch) content = mainMatch[1];
  else if (articleMatch) content = articleMatch[1];
  else content = html;
  
  // HTML-Tags entfernen, aber Struktur behalten
  content = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<h1[^>]*>/gi, '\n\n# ')
    .replace(/<\/h1>/gi, '\n')
    .replace(/<h2[^>]*>/gi, '\n\n## ')
    .replace(/<\/h2>/gi, '\n')
    .replace(/<h3[^>]*>/gi, '\n\n### ')
    .replace(/<\/h3>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return { title, content };
}

(async () => {
  console.log('🚀 Starte Content-Extraktion von 22 Seiten...\n');
  
  for (const page of pages) {
    try {
      console.log(`📄 ${page.title} (${page.slug})...`);
      const html = await fetch(page.url);
      const { title, content } = extractContent(html);
      
      const markdown = `# ${page.title}\n\n**URL:** ${page.url}\n**Extrahiert:** ${new Date().toISOString().split('T')[0]}\n\n---\n\n${content}`;
      
      const filename = `content-original/${page.slug}.md`;
      fs.writeFileSync(filename, markdown, 'utf8');
      
      console.log(`   ✅ Gespeichert: ${filename} (${content.length} Zeichen)\n`);
      
      // Kurze Pause zwischen Requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Fehler bei ${page.title}: ${error.message}\n`);
    }
  }
  
  console.log('✅ Content-Extraktion abgeschlossen!');
})();
