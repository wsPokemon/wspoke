import { usedPokemons } from "../server.js";
import dbModule from '../db/db.js';
import model from '../models/model.js';

export class ApiModel {
    static ResetGame() {
        usedPokemons.clear();
    }

    static async getAvailablePokemons() {
        try {
            return await dbModule.dbQueries.getAvailablePokemons(Array.from(usedPokemons));
        } catch (error) {
            console.error('Error al obtener Pokémon disponibles:', error);
            throw error;
        }
    }

    static async generateLettersWithValidation(availablePokemons) {
        try {
            let letters;
            let attempts = 0;
            const maxAttempts = 10;

            do {
                letters = await model.generateBalancedLetters(availablePokemons);
                const possiblePokemons = model.checkAvailablePokemons(letters, availablePokemons);
                if (possiblePokemons.length >= 5) break; // Ensure at least 5 Pokémon are possible
                attempts++;
            } while (attempts < maxAttempts);

            return letters;
        } catch (error) {
            console.error('Error al generar letras:', error);
            throw error;
        }
    }
}