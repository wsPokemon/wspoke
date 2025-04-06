import { join } from 'path';
import sqlite3 from "sqlite3";


const dirname = import.meta.dirname
sqlite3.verbose();


// Crear conexión a la base de datos
const db = new sqlite3.Database(join(dirname, 'pokemon.db'), (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conexión exitosa con la base de datos SQLite');

    }
})


// Funciones para consultar la base de datos
const dbQueries = {
    // Obtener todos los Pokémon disponibles (no usados)
    getAvailablePokemons: (usedPokemons) => {
        return new Promise((resolve, reject) => {
            const placeholders = usedPokemons.map(() => '?').join(',');
            const query = `
                SELECT * FROM pokemon
                WHERE name NOT IN (${placeholders})
            `;
            db.all(query, usedPokemons, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    getAllPokemons: () => {
        return new Promise((resolve, reject) => {
            
            const query = `
                SELECT name FROM pokemon
            `;
            db.all(query, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Obtener un Pokémon por nombre
    getPokemonByName: (name) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM pokemon WHERE name = ?', [name], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Obtener estadísticas de letras
    getLetterFrequency: (availablePokemons) => {
        return new Promise((resolve, reject) => {
            const placeholders = availablePokemons.map(() => '?').join(',');
            const query = `
                SELECT name FROM pokemon
                WHERE name IN (${placeholders})
            `;
            db.all(query, availablePokemons, (err, rows) => {
                if (err) reject(err);
                else {
                    const frequency = {};
                    rows.forEach(pokemon => {
                        pokemon.name.toLowerCase().split('').forEach(letter => {
                            frequency[letter] = (frequency[letter] || 0) + 1;
                        });
                    });
                    resolve(frequency);
                }
            });
        });
    }
};

export default { db, dbQueries };