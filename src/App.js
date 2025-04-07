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
  { key: 1, consonants: ["p", "d", "ʒ"], image: mainG1, coeff: 0 },
  { key: 2, consonants: ["l", "ʃ", "ɲ", "w"], image: mainG2, coeff: 0 },
  { key: 3, consonants: ["g"], image: mainG3, coeff: 0 },
  { key: 4, consonants: ["b", "n", "ɥ"], image: mainG4, coeff: 0 },
  { key: 5, consonants: ["m", "t", "f", "-"], image: mainG5, coeff: 0 },
  { key: 6, consonants: ["k", "v", "z"], image: mainG6, coeff: 0 },
  { key: 7, consonants: ["j", "ŋ"], image: mainG7, coeff: 1},
  { key: 8, consonants: ["s", "ʁ"], image: mainG8, coeff: 0 }
];

// Array pour les 5 positions sur le visage avec les nouvelles coordonnées
const facialPositions = [
  { position: 1, vowels: ["U", "ø"], coordinates: { x: 0.16, y: 0.165}, dec_x: 0.045, dec_y: -0.05  }, // pommette
  { position: 2, vowels: ["ɛ", "u", "ɔ"], coordinates: { x: 0.05, y: 0.325 }, dec_x: 0.05, dec_y: -0.04  }, // menton
  { position: 3, vowels: ["ɑ", "a", "o", "œ", "ə", "_"], coordinates: { x: 0.29, y: 0.245 }, dec_x: 0.028, dec_y: -0.04}, // côté
  { position: 4, vowels: ["i", "O", "A"], coordinates: { x: 0.11, y: 0.27 }, dec_x: 0.045, dec_y: -0.027  }, // bouche
  { position: 5, vowels: ["y", "e", "E"], coordinates: { x: 0.05, y: 0.40}, dec_x: 0.035, dec_y: -0.046 } // gorge
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
    let timeoutId;
    let currentIndex = 0;
    let duree;

    const displayNextPair = () => {
      setCurrentIndex(currentIndex);
      //alert("currentIndex : " + currentIndex);
      if (currentIndex ==0) {duree = 2000} else {duree = 1500}
      timeoutId = setTimeout(() => {
        setCurrentIndex(null);

        currentIndex = (currentIndex + 1) % displayedPairs.length;

        if (currentIndex === 0) {
          setIsAnimationComplete(true);
        } else {
          timeoutId = setTimeout(displayNextPair, 200);// affichage null entre les clés
        }
      }, duree);// 1500 durée d'affichage
    };
    // temporisation au départ
    timeoutId = setTimeout(() => {
      displayNextPair();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }
}, [displayedPairs, isAnimationComplete]);

//

  const currentPair = displayedPairs[currentIndex] || '';
  const [handKey, facePosition] = currentPair.split('/');

  const handConfig = handConfigurations.find(config => config.key === parseInt(handKey, 10));
  const facePos = facialPositions.find(pos => pos.position === parseInt(facePosition, 10));
  //const decalPos = handConfigurations.find(pos => pos.key === parseInt(handKey, 10));
  

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
              top: `${(facePos.coordinates.y + (handConfig.coeff * facePos.dec_y)) * 800}px`,
              left: `${(facePos.coordinates.x + (handConfig.coeff * facePos.dec_x)) * 800}px`,
              transform: "rotate(40deg)"
              //transform: 'translate(-110px, -210px)', // Centrer l'image de la main sur les coordonnées
            }}
          />
        )}
      </Box>
    </Container>
  );
};

export default App;
