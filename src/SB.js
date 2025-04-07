    if (isConsonant) {
      if (i + 1 < phonemes.length && /[aeiouyɑɒæɛɪɔʊəɜʌɐaːeːiːoːuːəː]/i.test(phonemes[i + 1])) {
        // Consonne suivie d'une voyelle
        pairs.push(`${currentPhoneme}${phonemes[i + 1]}`);
        i++; // Skip the next phoneme as it's already used
      } else {
        // Consonne suivie d'une autre consonne ou fin de texte
        pairs.push(`${currentPhoneme}_`);
      }
    } else if (isVowel) {
      if (i === 0 || (phonemes[i - 1] && isConsonant(phonemes[i - 1]))) {
        // Voyelle précédée d'une consonne ou d'un espace
        pairs.push(`${currentPhoneme}`);
      } else {
        // Voyelle isolée
        pairs.push(`-${currentPhoneme}`);
      }
    } else {
      // Cas où le phonème n'est ni une consonne ni une voyelle (peut être un symbole ou autre)
      pairs.push(currentPhoneme);
    }


    const isConsonant = /[bcdɖdfɡhɦħjɟkklmnpɳŋŋqrʁrsʂʃtθʋvwxzʒʔ]/i.test(currentPhoneme);
    const isVowel = /[aeiouyɑɒæɛɪɔʊəɜʌɐaːeːiːoːuːəː]/i.test(currentPhoneme);


   if (isConsonant) {
      // on regarde si le pho suivant est une voyelle ou non
      if (i + 1 < phonemes.length && /[aeiouyɑɒæɛɪɔʊəɜʌɐaːeːiːoːuːəː]/i.test(phonemes[i + 1])) {// voyelle ?
        // Consonne suivie d'une voyelle
        pairs.push(`${currentPhoneme}${phonemes[i + 1]}`);
        i++; // Skip the next phoneme as it's already used
      }
       else if (i + 1 < phonemes.length && /[bcdɖdfɡhɦħjɟkklmnpɳŋŋqrʁrsʂʃtθʋvwxzʒʔ]/i.test(phonemes[i + 1])) {// consonne ?
        // Consonne suivie d'une consonne
        pairs.push(`${currentPhoneme}_`);
      }
        else if (i + 1 == phonemes.length) {  
        // Consonne en fin de texte
        pairs.push(`${currentPhoneme}_`);
      }

    } else if (isVowel) {
      // Voyelle isolée en début de phrase
        pairs.push(`-${currentPhoneme}`);
    } else {
      // Cas où le phonème n'est ni une consonne ni une voyelle (peut être un symbole ou autre)
      //pairs.push(currentPhoneme);
    }




    // 
      if (i + 1 <= phonemes.length) {// il y a un carartère après
        if (isConsonant) {  
          // on regarde si le pho suivant est une voyelle ou non
          if (/[aeiouyɑɒæɛɪɔʊəɜʌɐaːeːiːoːuːəː]/i.test(phonemes[i + 1])) {//voyelle
            // Consonne suivie d'une voyelle
            pairs.push(`${currentPhoneme}${phonemes[i + 1]}`);
            i++; // Skip the next phoneme as it's already used
          }
          else {// consonne
            // Consonne suivie d'une consonne
            pairs.push(`${currentPhoneme}_`);
          }
        }
        else {// voyelle
          pairs.push(`-${currentPhoneme}`);
        }
      }
      // en fin de phrase
      else {
        if (isConsonant) {
          pairs.push(`${currentPhoneme}_`);
        }
        else {// voyelle
          pairs.push(`-${currentPhoneme}`);
        }
      }