import * as FileSystem from 'expo-file-system'; // Gardez seulement cette importation
import * as xlsx from 'xlsx';
import { Asset } from 'expo-asset';

/*const loadFile = async () => {
    // Assurez-vous que le fichier existe dans le dossier assets
    const asset = Asset.fromModule(require('./assets/base_voc/voc.html'));
    await asset.downloadAsync(); // Téléchargez le fichier si ce n'est pas déjà fait

    const fileUri = `${FileSystem.documentDirectory}voc.html`;

    await FileSystem.copyAsync({
        from: asset.localUri || asset.uri,
        to: fileUri,
    });

    return fileUri;
};*/

export const extract_flashcard = async (vocfile) => {
    try {
        // Utiliser loadFile pour obtenir le chemin du fichier Excel
       // const fileUri = await loadFile();

        //const fileContents = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

        const fileUri = vocfile.localUri || vocfile.uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const workbook = xlsx.read(fileContent, { type: 'base64' });
        const sheet_name = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheet_name];

        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = data[0]; // Première ligne (index 0)
        const firstRow = data[1]; // Deuxième ligne (index 1)

        console.log("Les en-têtes sont : ", headers[0], "et", headers[1]);

        const flashcards_from_excel = data.slice(1).map((ligne, index) => {
            const flashcard = {};
            headers.forEach((header, i) => {
                flashcard[header] = ligne[i];
            });
            flashcard.index = index;
            return flashcard;
        });

        return {headers,flashcards:flashcards_from_excel};
    } catch (error) {
        console.error("Erreur lors de l'extraction:", error);
        throw error; // Rethrow the error to be caught by the caller
    }
};


