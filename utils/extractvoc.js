const fs = require('fs').promises;
const xlsx = require('xlsx');

const path_to_excel = "../base_voc/voc.xlsx";

const extract_flashcard = async () => {
    try {
        const workbook = xlsx.readFile(path_to_excel);
        const sheet_name = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheet_name];

        // Utilisation de l'option header: 1 pour obtenir les en-têtes
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        // Les en-têtes sont dans la première ligne de 'data'
        const headers = data[0]; // Première ligne (index 0)
        const firstRow = data[1]; // deuxieme ligne (index 1)

        console.log("Les en-têtes sont : ", headers[0], "et", headers[1]);

        // ... On commence à l'index 1 pour sauter la première ligne qui contient les en-têtes
        const flashcards_from_excel = data.slice(1).map((ligne, index) => {
            // Construction d'un objet avec les en-têtes correspondant aux valeurs de chaque ligne
            const flashcard = {};
            headers.forEach((header, i) => {
                flashcard[header] = ligne[i];
            });
            flashcard.index = index; // Ajout de l'index
            return flashcard;
        });

        return flashcards_from_excel;
    } catch (error) {
        console.error("erreur lors de l'extraction:", error);
        throw error; // Rethrow the error to be caught by the caller
    }
};

extract_flashcard()
    .then(flashcards => console.log(flashcards))
    .catch(e => console.log(e));
// comment extraires les flashcards ? pour l'utiliser dans app.js? definire ce que le code doit retourner... cad: headers, nombre de lignes, et contenu des lignes.