import dbModule from '../db/db.js';

class Model {
    
    //Función para obtener letras balanceadas dentro de la cuadrícula
    async generateBalancedLetters(availablePokemons) {
      const gridSize = 6;
      const letters = [];
      const frequency = await dbModule.dbQueries.getLetterFrequency(availablePokemons.map(p => p.name));
      
      // Asegurar un mínimo de vocales
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const vowelCount = Math.floor(gridSize * gridSize * 0.4); // 40% vocales
      
      // Primero, agregar vocales
      for (let i = 0; i < vowelCount; i++) {
          const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
          letters.push(randomVowel.toUpperCase());
      }
      
      // Luego, agregar consonantes basadas en la frecuencia
      const consonants = Object.entries(frequency)
          .filter(([letter]) => !vowels.includes(letter))
          .sort(([,a], [,b]) => b - a)
          .map(([letter]) => letter);
      
      while (letters.length < gridSize * gridSize) {
          const randomConsonant = consonants[Math.floor(Math.random() * consonants.length)];
          letters.push(randomConsonant.toUpperCase());
      }
      
      // Mezclar las letras
      return letters.sort(() => Math.random() - 0.5);
  }
  
  // Función para verificar si hay Pokémon disponibles con las letras actuales
  checkAvailablePokemons(letters, availablePokemons) {
      const letterSet = new Set(letters.map(l => l.toLowerCase()));
      return availablePokemons.filter(pokemon => 
       pokemon.name.toLowerCase().split('').every(letter => letterSet.has(letter))
      );
  }
    
}

export default new Model();