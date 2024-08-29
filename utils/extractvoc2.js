// ce code est une tentative d'utiliser module expo-file-system
import * as FileSystem from 'expo-file-system';
import * as xlsx from 'xlsx';

const copyFileToDocumentDirectory = async () => {
    const asset = Asset.fromModule(require('../assets/base_voc/voc.xlsx'));
    const fileUri = FileSystem.documentDirectory + 'voc.xlsx';
    await FileSystem.downloadAsync(asset.uri, fileUri);
    return fileUri;
};

const extract_flashcard = async () => {
    try {
        // Lire le fichier Excel à partir du système de fichiers
        const fileUri = path_to_excel;

        // Télécharger ou copier le fichier Excel dans le répertoire de documents de l'application si nécessaire
        // Par exemple, si le fichier est stocké dans les assets, il faut d'abord le copier :
        // await FileSystem.downloadAsync(Asset.fromModule(require('../base_voc/voc.xlsx')).uri, fileUri);

        const fileContents = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

        // Convertir le fichier en format binaire que `xlsx` peut comprendre
        const workbook = xlsx.read(fileContents, { type: 'base64' });
        const sheet_name = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheet_name];

        // Utilisation de l'option header: 1 pour obtenir les en-têtes
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        // Les en-têtes sont dans la première ligne de 'data'
        const headers = data[0]; // Première ligne (index 0)
        const firstRow = data[1]; // Deuxième ligne (index 1)

        console.log("Les en-têtes sont : ", headers[0], "et", headers[1]);

        // On commence à l'index 1 pour sauter la première ligne qui contient les en-têtes
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
        console.error("Erreur lors de l'extraction:", error);
        throw error; // Rethrow the error to be caught by the caller
    }
};

extract_flashcard()
    .then(flashcards => console.log(flashcards))
    .catch(e => console.log(e));

