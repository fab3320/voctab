const FileSystem = require('expo-file-system');
const XLSX = require('xlsx');

// Chemin vers le fichier Excel dans le dossier base_voc
const path_to_excel = FileSystem.documentDirectory + 'base_voc/voc.html';

const extract_flashcard = async () => {
    try {
        // Vérifiez si le fichier existe
        const fileExists = await FileSystem.getInfoAsync(path_to_excel);
        if (!fileExists.exists) {
            console.error("Le fichier n'existe pas à l'emplacement spécifié :", path_to_excel);
            return; // Quitter la fonction si le fichier n'existe pas
        }

        // Lire le fichier Excel
        const fileContent = await FileSystem.readAsStringAsync(path_to_excel, { encoding: FileSystem.EncodingType.Base64 });
        const workbook = XLSX.read(fileContent, { type: 'base64' });

        // Obtenir le nom de la première feuille de calcul
        const sheet_name = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheet_name];

        // Convertir la feuille de calcul en JSON avec les en-têtes
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Les en-têtes sont dans la première ligne (index 0)
        const headers = data[0]; //  toutes les entetes
        const cellA1 = headers[0]; // valeur de la cellule A1
        const cellB1 = headers[1]; // valeur de la cellule B1

        console.log("Les en-têtes sont : ", headers);
        console.log("Cellule A1 : ", cellA1);
        console.log("Cellule B1 : ", cellB1);

        // Créer les flashcards à partir des lignes restantes
        const flashcards_from_excel = data.slice(1).map((ligne, index) => {
            const flashcard = {};
            headers.forEach((header, i) => {
                flashcard[header] = ligne[i] !== undefined ? ligne[i] : null; // Gérer les valeurs manquantes
            });
            flashcard.index = index;
            return flashcard;
        });

        return flashcards_from_excel;
    } catch (error) {
        console.error("Erreur lors de l'extraction:", error);
        throw error; // Relancer l'erreur pour être capturée par l'appelant
    }
};

// Appel de la fonction pour tester
extract_flashcard()
    .then(flashcards => console.log(flashcards))
    .catch(e => console.log(e));
