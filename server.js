import express, { json } from 'express';
import cors from 'cors';
import { apiPokemon } from './routes/apiPokemon.js';
const app = express();
const port = process.env.PORT ?? 3000;


app.use(cors());
app.use(json());
app.use(express.static('views'));
app.use(express.static('assets'));


// Almacenar los Pokémon usados en memoria
export let usedPokemons = new Set();

// Función para generar letras balanceadas

// Invocacion del router para api pokemon
app.use('/api', apiPokemon);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 