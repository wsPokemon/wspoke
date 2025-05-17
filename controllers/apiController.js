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
        const { name, score, uuid } = req.body;
        // Validar que el puntaje sea mayor a 0
        if (!score || score <= 0) {
            return res.status(400).json({ error: 'No se puede guardar un puntaje vacío o cero.' });
        }
        try {
            await dbModule.dbQueries.insertLeaderboard(name, score, uuid);
            const leaderboard = await dbModule.dbQueries.getTopLeaderboard();
            res.json(leaderboard);
        } catch (error) {
            if (error && error.code === 'LOW_SCORE') {
                return res.status(409).json({ error: 'El nuevo puntaje no supera el anterior.' });
            }
            if (error && error.code === 'NAME_TAKEN') {
                return res.status(409).json({ error: 'El nombre ya está registrado por otro jugador.' });
            }
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
