import { Router } from "express";
import { ApiController } from "../controllers/apiController.js";
import dbModule from "../db/db.js"; // Importar el módulo de la base de datos

export const apiPokemon = Router();

// Ruta para obtener letras aleatorias para el juego
apiPokemon.get('/letters', ApiController.getRandomLetters);

// Ruta para verificar si una palabra es válida
apiPokemon.post('/validate', ApiController.validateWord);

// Ruta para mezclar las letras
apiPokemon.post('/shuffle', ApiController.shuffleWords);

// Ruta para reiniciar el juego
apiPokemon.post('/reset', ApiController.resetGame);

// Ruta para manejar el leaderboard
apiPokemon.post('/leaderboard', async (req, res) => {
    const { name, score } = req.body;

    try {
        await dbModule.dbQueries.insertLeaderboard(name, score);
        const leaderboard = await dbModule.dbQueries.getTopLeaderboard();
        res.json(leaderboard);
    } catch (error) {
        console.error('Error al manejar el leaderboard:', error);
        res.status(500).json({ error: 'Error al manejar el leaderboard' });
    }
});