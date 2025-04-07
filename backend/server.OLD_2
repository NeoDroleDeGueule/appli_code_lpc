const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

const WIKTIONARY_API_URL = 'https://fr.wiktionary.org/w/api.php';

async function searchWiktionary(word) {
  const url = new URL(WIKTIONARY_API_URL);
  url.search = new URLSearchParams({
    action: 'query',
    titles: word,
    prop: 'revisions',
    rvprop: 'content',
    format: 'json',
    origin: '*',
  }).toString();

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!data.query?.pages) {
      return { error: 'Mot non trouvé' };
    }

    const page = Object.values(data.query.pages)[0];
    if (page.missing) {
      return { error: 'Mot non trouvé dans le Wiktionnaire' };
    }

    const content = page.revisions[0]['*'];

    // Rechercher d'abord la prononciation française
    const frenchSection = content.match(/== {{langue\|fr}} ==([\s\S]*?)(?:==\s*{{langue|$)/);
    if (frenchSection) {
      const pronunciationMatch = frenchSection[1].match(/\{\{pron\|([^}]+)\}\}/);
      if (pronunciationMatch) {
        const pron = pronunciationMatch[1].split('|')[0];
        // Nettoyer la prononciation des descriptions additionnelles
        return { pronunciation: pron.replace(/\s+(?:ak\.sɑ̃\s+ɡʁav|ak\.sɑ̃\s+ɛɡy|ak\.sɑ̃\s+sjʁkɔ̃flɛks|tʁema)/g, '') };
      }
    }

    // Si aucune prononciation française n'est trouvée, chercher dans tout le contenu
    const generalPronMatch = content.match(/\{\{pron\|([^}]+)\}\}/);
    if (generalPronMatch) {
      const pron = generalPronMatch[1].split('|')[0];
      // Nettoyer la prononciation des descriptions additionnelles
      return { pronunciation: pron.replace(/\s+(?:ak\.sɑ̃\s+ɡʁav|ak\.sɑ̃\s+ɛɡy|ak\.sɑ̃\s+sjʁkɔ̃flɛks|tʁema)/g, '') };
    }

    return { error: 'Prononciation non trouvée' };
  } catch (error) {
    console.error('Error fetching phonetic transcription:', error);
    return { error: 'Failed to fetch phonetic transcription' };
  }
}

app.get('/api/phonetic', async (req, res) => {
  const { text } = req.query;
  console.log(`Received request for text: ${text}`);

  // Supprimer les caractères de ponctuation
  const cleanedText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  const words = cleanedText.split(/\s+/);
  const results = [];

  for (const word of words) {
    const result = await searchWiktionary(word);
    if (result.pronunciation) {
      results.push(result.pronunciation);
    } else {
      results.push(`[${word}]`);
    }
  }

  res.json(results.join(' '));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
