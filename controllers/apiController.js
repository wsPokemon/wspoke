import dbModule from '../db/db.js';
import {ApiModel} from '../models/api_model.js';
import { usedPokemons } from '../server.js';

export class ApiController {

    static async getRandomLetters (req, res) {
        try {
            const availablePokemons = await ApiModel.getAvailablePokemons();
            const letters = await ApiModel.generateLettersWithValidation(availablePokemons);
    
            if (!Array.isArray(letters)) {
                throw new Error('No se pudieron generar letras válidas');
            }
    
            res.json({ letters });
        } catch (error) {
            console.error('Error al generar letras:', error);
            res.status(500).json({ error: 'Error al generar letras' });
        }
    }
        

    static async validateWord (req, res) {
            try {
                const { word } = req.body;
                const foundPokemon = await dbModule.dbQueries.getPokemonByName(word);
        
                if (foundPokemon && !usedPokemons.has(foundPokemon.name)) {
                    usedPokemons.add(foundPokemon.name);
                    res.json({
                        isValid: true,
                        pokemon: foundPokemon
                    });
                } else {
                    res.json({
                        isValid: false,
                        pokemon: null
                    });
                }
            } catch (error) {
                console.error('Error al validar palabra:', error);
                res.status(500).json({ error: 'Error al validar palabra' });
            }
    }



    static async shuffleWords (req, res) {
    try {
        const availablePokemons = await ApiModel.getAvailablePokemons();
        const letters = await ApiModel.generateLettersWithValidation(availablePokemons);

        if (!Array.isArray(letters)) {
            throw new Error('No se pudieron generar letras válidas');
        }

        res.json({ letters });
    } catch (error) {
        console.error('Error al mezclar letras:', error);
        res.status(500).json({ error: 'Error al mezclar letras' });
    }
   }

   static async resetGame (req, res) {
        ApiModel.ResetGame();
        res.json({ success: true });
    }

    // POST /leaderboard
    static async leaderboard(req, res) {
        const { name, score } = req.body;
        try {
            await dbModule.dbQueries.insertLeaderboard(name, score);
            const leaderboard = await dbModule.dbQueries.getTopLeaderboard();
            res.json(leaderboard);
        } catch (error) {
            console.error('Error al manejar el leaderboard:', error);
            res.status(500).json({ error: 'Error al manejar el leaderboard' });
        }
    }

    // GET /leaderboard
    static async getLeaderboard(req, res) {
        try {
            const leaderboard = await dbModule.dbQueries.getTopLeaderboard();
            res.json(leaderboard);
        } catch (error) {
            console.error('Error al obtener el leaderboard:', error);
            res.status(500).json({ error: 'Error al obtener el leaderboard' });
        }
    }
}
