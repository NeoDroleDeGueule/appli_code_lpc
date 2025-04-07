import React, { useState } from 'react';
import { Button, TextField, TextareaAutosize, Container, Typography, Box } from '@mui/material';

const fetchPhoneticTranscription = async (text) => {
  console.log(`Fetching phonetic transcription for: ${text}`);
  const response = await fetch(`http://localhost:5000/api/phonetic?text=${text}`);
  console.log(`Response status: ${response.status}`);
  const data = await response.json();
  console.log(`Response data: ${data}`);
  return data;
};

const transcribeToPairs = (phoneticText) => {
  const phonemes = phoneticText.replace(".", "");
  //const phonemes = phoneticText.split(/(\s+)/).filter(Boolean); // Preserve spaces
  const pairs = [];
  //alert("phonemes = " + phonemes);
  //let index = 0;

  for (let i = 0; i < phonemes.length; i++) {
    //alert("i0 " + i);
    const currentPhoneme = phonemes[i];
    //alert("currentPhoneme = " + currentPhoneme);
/**/
    if (currentPhoneme.trim() == "") {
      // If it's a space, just add it to the result
      //pairs.push(currentPhoneme);
      continue;
    }

    const isConsonant = /[bcdɖdfɡhɦħjɟkklmnpɳŋŋqrʁrsʂʃtθʋvwxzʒʔ]/i.test(currentPhoneme);
    //const isVowel = /[aɑ̃eiouyɑɒæœ̃ɛɛ̃ɪɔɔ̃ʊəɜʌɐaːeːiːoːuːəː]/i.test(currentPhoneme);
    

    // 
    if (i + 1 < phonemes.length) {// il y a un caractère après
      if (isConsonant) {// CONS
        // on regarde si le pho suivant est une voyelle ou non
        //alert("A");
        //alert("phonemes[i + 1] = " + phonemes[i + 1]);
         if (/[aeiouyɑɒæɛɪɔʊəɜʌɐaːeːiːoːuːəː]/i.test(phonemes[i + 1])) {//voyelle
          //alert("voyelle ? = " + /[aeiouyɑɒæɛɪɔʊəɜʌɐaːeːiːoːuːəː]/i.test(phonemes[i + 1]));
          // Consonne suivie d'une voyelle
          //pairs.push(`${currentPhoneme}${phonemes[i + 1]}`);
          pairs.push(currentPhoneme + phonemes[i + 1]);

          //alert("pairs = " + pairs);
           i++; // Skip the next phoneme as it's already used
           //alert("i " + i);
         }
         else {// consonne
           //alert("A 2");
           // Consonne suivie d'une consonne
           pairs.push(`${currentPhoneme}_`);
         }
       }
       else {// VOY
         //alert("B");
         pairs.push(`-${currentPhoneme}`);
       }
    }
    // en fin de phrase
    else {
       //alert("C");
       if (isConsonant) {
        pairs.push(`${currentPhoneme}_`);
       }
      else {// voyelle
         pairs.push(`-${currentPhoneme}`);
       }
    }
  }

  return pairs.join(' ');
  //return pairs;
};

const App = () => {
  const [text, setText] = useState('');
  const [phoneticText, setPhoneticText] = useState('');
  const [pairsText, setPairsText] = useState('');

  const handleTranscribe = async () => {
    // Supprimer les caractères de ponctuation
    const cleanedText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    const phonetic = await fetchPhoneticTranscription(cleanedText);
    if (phonetic) {
      setPhoneticText(phonetic);
      setPairsText(transcribeToPairs(phonetic));
    } else {
      setPhoneticText('');
      setPairsText('');
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
    </Container>
  );
};

export default App;
