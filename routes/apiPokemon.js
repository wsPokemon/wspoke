import { Router } from "express";
import { ApiModel } from '../models/api_model.js';
import dbModule from '../db/db.js';
import { usedPokemons } from "../server.js";


export const apiPokemon = Router();

// Ruta para obtener letras aleatorias para el juego
apiPokemon.get('/letters', async (req, res) => {
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
});

// Ruta para verificar si una palabra es válida
apiPokemon.post('/validate', async (req, res) => {
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
});

// Ruta para mezclar las letras
apiPokemon.post('/shuffle', async (req, res) => {
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
});

// Ruta para reiniciar el juego
apiPokemon.post('/reset', (req, res) => {
    ApiModel.ResetGame();
    res.json({ success: true });
});