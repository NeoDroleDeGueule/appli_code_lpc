import React, { useState, useEffect } from 'react';
import { Button, TextField, TextareaAutosize, Container, Typography, Box } from '@mui/material';
import perso from './images/boy_800x800_g.jpg' // relative path to image

import mainG0 from './images/mainsLPC/g0.png' // relative path to image
import mainG1 from './images/mainsLPC/g1.png' // relative path to image
import mainG2 from './images/mainsLPC/g2.png' // relative path to image
import mainG3 from './images/mainsLPC/g3.png' // relative path to image
import mainG4 from './images/mainsLPC/g4.png' // relative path to image
import mainG5 from './images/mainsLPC/g5.png' // relative path to image
import mainG6 from './images/mainsLPC/g6.png' // relative path to image
import mainG7 from './images/mainsLPC/g7.png' // relative path to image
import mainG8 from './images/mainsLPC/g8.png' // relative path to image



const fetchPhoneticTranscription = async (text) => {
  console.log(`Fetching phonetic transcription for: ${text}`);
  const response = await fetch(`http://localhost:5000/api/phonetic?text=${text}`);
  //const response = await fetch(`${process.env.REACT_APP_API_URL}/api/phonetic?text=${text}`) ;
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
  { key: 1, consonants: ["p", "d", "ʒ"], image: mainG1},
  { key: 2, consonants: ["l", "ʃ", "ɲ", "w"], image: mainG2},
  { key: 3, consonants: ["g"], image: mainG3 },
  { key: 4, consonants: ["b", "n", "ɥ"], image: mainG4 },
  { key: 5, consonants: ["m", "t", "f", "-"], image: mainG5 },
  { key: 6, consonants: ["k", "v", "z"], image: mainG6 },
  { key: 7, consonants: ["j", "ŋ"], image: mainG7 },
  { key: 8, consonants: ["s", "ʁ"], image: mainG8 }
];

// Array pour les 5 positions sur le visage avec les nouvelles coordonnées
const facialPositions = [
  { position: 1, vowels: ["U", "ø"], coordinates: { x: 0.16, y: 0.15} }, // pommette
  { position: 2, vowels: ["ɛ", "u", "ɔ"], coordinates: { x: 0.05, y: 0.31 } }, // menton
  { position: 3, vowels: ["ɑ", "a", "o", "œ", "ə", "_"], coordinates: { x: 0.29, y: 0.23 } }, // côté
  { position: 4, vowels: ["i", "O", "A"], coordinates: { x: 0.11, y: 0.24 } }, // bouche
  { position: 5, vowels: ["y", "e", "E"], coordinates: { x: 0.05, y: 0.38} } // gorge
];

const App = () => {
  const [text, setText] = useState('');
  const [phoneticText, setPhoneticText] = useState('');
  const [pairsText, setPairsText] = useState('');
  const [lpcText, setLpcText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedPairs, setDisplayedPairs] = useState([]);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  const handleTranscribe = async () => {
    const lowerCaseText = toLowerCase(text);
    const cleanedText = lowerCaseText.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, '');
    const phonetic = await fetchPhoneticTranscription(cleanedText);
    if (phonetic) {
      setPhoneticText(phonetic);
      const pairs = transcribeToPairs(phonetic);
      setPairsText(pairs);
      const lpcCodes = paireToLPC(pairs);
      setLpcText(lpcCodes);
      setDisplayedPairs(lpcCodes.split(' '));
      setIsAnimationComplete(false); // Réinitialiser l'état d'animation
    } else {
      setPhoneticText('');
      setPairsText('');
      setLpcText('');
    }
  };

  
  
 
  useEffect(() => {
    if (displayedPairs.length > 0 && !isAnimationComplete) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % displayedPairs.length;
          if (newIndex === 0) {
            setIsAnimationComplete(true); // Marquer l'animation comme terminée
            clearInterval(interval); // Arrêter l'intervalle après la dernière paire
          }
          return newIndex;
        });
      }, 1500);

      // Nettoyer l'intervalle si le composant est démonté ou si displayedPairs change
      return () => clearInterval(interval);
    }
  }, [displayedPairs, isAnimationComplete]);



  const currentPair = displayedPairs[currentIndex] || '';
  const [handKey, facePosition] = currentPair.split('/');

  const handConfig = handConfigurations.find(config => config.key === parseInt(handKey, 10));
  const facePos = facialPositions.find(pos => pos.position === parseInt(facePosition, 10));

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
      <Box display="flex" justifyContent="center" mb={2} position="relative" overflow="hidden">
        <img
          src={perso} // Remplacez par le chemin de votre image de visage
          alt="Face"
          style={{ width: '100%', height: '100%', position: 'relative', display: 'block' }}
        />
        {handConfig && facePos && !isAnimationComplete && (
          <img
            src={handConfig.image}
            alt={`Hand ${handConfig.key}`}
            style={{
              position: 'absolute',
              width: '80%',
              height: '64%',
              top: `${facePos.coordinates.y * 800}px`,
              left: `${facePos.coordinates.x * 800}px`,
              transform: "rotate(30deg)"
              //transform: 'translate(-110px, -210px)', // Centrer l'image de la main sur les coordonnées
            }}
          />
        )}
      </Box>
    </Container>
  );
};

export default App;
