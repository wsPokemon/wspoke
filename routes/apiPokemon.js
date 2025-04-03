import { Router } from "express";
import dbModule from '../db/db.js';
import model from '../models/model.js'
import { usedPokemons } from "../server.js";
export const apiPokemon = Router();


// Ruta para obtener letras aleatorias para el juego
apiPokemon.get('/letters', async (req, res) => {
    try {
        const availablePokemons = await dbModule.dbQueries.getAvailablePokemons(Array.from(usedPokemons));
        let letters;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            letters = await model.generateBalancedLetters(availablePokemons);
            const possiblePokemons = model.checkAvailablePokemons(letters, availablePokemons);
            if (possiblePokemons.length >= 5) break; // Asegurar al menos 5 Pokémon posibles
            attempts++;
        } while (attempts < maxAttempts);
        
        res.json({ letters });
    } catch (error) {
        console.error('Error al generar letras:', error);
        res.status(500).json({ error: 'Error al generar letras' });
    }
});

// Ruta para verificar si una palabra es válida
apiPokemon.post('/validate',async (req, res) => {
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
    }});

// Ruta para mezclar las letras
apiPokemon.post('/shuffle',async (req, res) => {
    try {
        const availablePokemons = await dbModule.dbQueries.getAvailablePokemons(Array.from(usedPokemons));
        let letters;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            letters = await model.generateBalancedLetters(availablePokemons);
            const possiblePokemons = model.checkAvailablePokemons(letters, availablePokemons);
            if (possiblePokemons.length >= 5) break;
            attempts++;
        } while (attempts < maxAttempts);
        
        res.json({ letters });
    } catch (error) {
        console.error('Error al mezclar letras:', error);
        res.status(500).json({ error: 'Error al mezclar letras' });
    }});

// Ruta para reiniciar el juego
apiPokemon.post('/reset', (req, res) => {
    usedPokemons.clear();
    res.json({ success: true });
});