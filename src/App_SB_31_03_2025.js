import React, { useState } from 'react';
import { Button, TextField, TextareaAutosize, Container, Typography, Box } from '@mui/material';
import logo from './images/boy_800x800.jpg' // relative path to image 

const fetchPhoneticTranscription = async (text) => {
  console.log(`Fetching phonetic transcription for: ${text}`);
  const response = await fetch(`http://localhost:5000/api/phonetic?text=${text}`);
  console.log(`Response status: ${response.status}`);
  const data = await response.json();
  console.log(`Response data: ${data}`);
  return data;
};

function toLowerCase(inputText) {
  return inputText.toLowerCase();
}

function replacePhoneticCombinations(str) {
  const replacements = {
    "ɑ̃": "A",
    "œ̃": "E",
    "ɛ̃": "U",
    "ɔ̃": "O",
  };

  let result = str;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

const transcribeToPairs = (phoneticText) => {
  const replacedText = replacePhoneticCombinations(phoneticText);
  const phonemes = replacedText.replaceAll(".", "");

  const pairs = [];
  for (let i = 0; i < phonemes.length; i++) {
    const currentPhoneme = phonemes[i];

    if (currentPhoneme.trim() === "") {
      continue;
    }

    const isConsonant = /[bcdɖdfɡhɦħjɟkklmnpɳŋŋqrʁrsʂʃtθʋvwxzʒʔ]/i.test(currentPhoneme);

    if (i + 1 < phonemes.length) {
      if (isConsonant) {
        if (/[aɑ̃eiouyɑɒæœ̃ɛɛ̃ɪɔɔ̃ʊəɜʌɐaøːeːiːoːuːəː]/i.test(phonemes[i + 1])) {
          pairs.push(`${currentPhoneme}${phonemes[i + 1]}`);
          i++;
        } else {
          pairs.push(`${currentPhoneme}_`);
        }
      } else {
        pairs.push(`-${currentPhoneme}`);
      }
    } else {
      if (isConsonant) {
        pairs.push(`${currentPhoneme}_`);
      } else {
        pairs.push(`-${currentPhoneme}`);
      }
    }
  }

  return pairs.join(' ');
};

const paireToLPC = (pairsText) => {
  const pairs = pairsText.split(' ');
  const lpcCodes = pairs.map(pair => {
    let consonant = pair[0];
    let vowel = pair[1];

    // Trouver la configuration de la main pour la consonne
    const handConfig = handConfigurations.find(config => config.consonants.includes(consonant))?.key || "-";

    // Trouver la position sur le visage pour la voyelle
    const facialPosition = facialPositions.find(pos => pos.vowels.includes(vowel))?.position || "_";

    return `${handConfig}/${facialPosition}`;
  });

  return lpcCodes.join(' ');
};

// Array pour les 8 configurations de la main
const handConfigurations = [
  { key: 1, consonants: ["p", "d", "ʒ"] },
  { key: 2, consonants: ["l", "ʃ", "ɲ", "w"] },
  { key: 3, consonants: ["g"] },
  { key: 4, consonants: ["b", "n", "ɥ"] },
  { key: 5, consonants: ["m", "t", "f", "-"] },
  { key: 6, consonants: ["k", "v", "z"] },
  { key: 7, consonants: ["j", "ŋ"] },
  { key: 8, consonants: ["s", "ʁ"] }
];

// Array pour les 5 positions sur le visage
const facialPositions = [
  { position: 1, vowels: ["U", "ø"], coordinates: { x: 580, y: 300 } }, // pommette
  { position: 2, vowels: ["ɛ", "u", "ɔ"], coordinates: { x: 270, y: 600 } }, // menton
  { position: 3, vowels: ["ɑ", "a", "o", "œ", "ə", "_"], coordinates: { x: 600, y: 450 } }, // bouche
  { position: 4, vowels: ["i", "O", "A"], coordinates: { x: 370, y: 700 } }, // côté
  { position: 5, vowels: ["y", "e", "E"], coordinates: { x: 320, y: 800 } } // gorge
];

const App = () => {
  const [text, setText] = useState('');
  const [phoneticText, setPhoneticText] = useState('');
  const [pairsText, setPairsText] = useState('');
  const [lpcText, setLpcText] = useState('');

  const handleTranscribe = async () => {
    const lowerCaseText = toLowerCase(text);
    const cleanedText = lowerCaseText.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, '');
    const phonetic = await fetchPhoneticTranscription(cleanedText);
    if (phonetic) {
      setPhoneticText(phonetic);
      const pairs = transcribeToPairs(phonetic);
      setPairsText(pairs);
      setLpcText(paireToLPC(pairs));
    } else {
      setPhoneticText('');
      setPairsText('');
      setLpcText('');
    }
  };



  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Application CodeLPC
      </Typography>
      <Box mb={2}>
        <TextField
          label="Texte à saisir"
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          variant="outlined"
        />
      </Box>
      <Box display="flex" justifyContent="center" mb={2}>
        <Button onClick={handleTranscribe} variant="contained" color="primary">
          Valider
        </Button>
      </Box>
      <Box mb={2}>
        <Typography variant="h6">Texte transcrit en phonétique :</Typography>
        <TextareaAutosize
          value={phoneticText}
          readOnly
          style={{ width: '100%', border: '1px solid #ccc', padding: '8px' }}
        />
      </Box>
      <Box mb={2}>
        <Typography variant="h6">Texte phonétique transcrit en paire consonne/voyelle :</Typography>
        <TextareaAutosize
          value={pairsText}
          readOnly
          style={{ width: '100%', border: '1px solid #ccc', padding: '8px' }}
        />
      </Box>
      <Box mb={2}>
        <Typography variant="h6">Texte paire consonne/voyelle transcrit en code LPC :</Typography>
        <TextareaAutosize
          value={lpcText}
          readOnly
          style={{ width: '100%', border: '1px solid #ccc', padding: '8px' }}
        />
      </Box>
      <Box display="flex" justifyContent="center" mb={2}>
        <img
          src={logo} // Remplacez par le chemin de votre image
          alt={logo}
          style={{ width: '800px', height: '800px' }}
        />
      </Box>
    </Container>
  );
};

export default App;
