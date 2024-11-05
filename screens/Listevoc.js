import React, {useEffect, useState} from 'react';
import {Button, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {Asset} from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Liste des fichiers de `voc_base` qui ne doivent pas être supprimés
const baseXlsxFiles = [
    { name: 'voc.xlsx', asset: require('../assets/base_voc/voc.xlsx') },
    { name: 'voc_save.xlsx', asset: require('../assets/base_voc/voc_save.xlsx') },
];

// Liste des noms des fichiers importés de `voc_base`
const protectedFileNames = baseXlsxFiles.map(file => file.name);

const Listevoc = ({ navigation }) => {
    const [files, setFiles] = useState([]);
    const [importedFile, setImportedFile] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Fonction pour copier les fichiers de `voc_base` dans `vocabulaire`
    const copyBaseFilesToVocabulaire = async () => {
        const directoryUri = `${FileSystem.documentDirectory}vocabulaire/`;
        await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });

        for (const file of baseXlsxFiles) {
            const asset = Asset.fromModule(file.asset);
            await asset.downloadAsync();

            const targetPath = `${directoryUri}${file.name}`;
            const fileExists = await FileSystem.getInfoAsync(targetPath);

            if (!fileExists.exists) {
                const fileContent = await FileSystem.readAsStringAsync(asset.localUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                await FileSystem.writeAsStringAsync(targetPath, fileContent, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                console.log(`Fichier ${file.name} copié avec succès.`);
            } else {
                console.log(`Le fichier ${file.name} existe déjà dans vocabulaire.`);
            }
        }
    };

    // Fonction pour lister les fichiers .xlsx dans `vocabulaire`
    const listXlsxFiles = async () => {
        const directoryUri = `${FileSystem.documentDirectory}vocabulaire/`;
        try {
            const fileList = await FileSystem.readDirectoryAsync(directoryUri);
            const xlsxFiles = fileList.filter(file => file.endsWith('.xlsx'));
            setFiles(xlsxFiles); // Mettre à jour la liste des fichiers
        } catch (error) {
            console.error('Erreur lors de la lecture des fichiers :', error);
        }
    };

    // Initialisation pour copier les fichiers de `voc_base` et mettre à jour la liste
    const initializeDirectory = async () => {
        await copyBaseFilesToVocabulaire(); // Copier les fichiers de `voc_base`
        listXlsxFiles(); // Lister les fichiers existants
        getSelectedFile(); // Récupérer le fichier sélectionné si présent
    };

    // Fonction pour importer un fichier choisi par l’utilisateur
    const handleImport = async () => {
        try {
            console.log('Ouverture du sélecteur de fichiers...');
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                copyToCacheDirectory: true,
            });

            console.log('Résultat de la sélection de fichier :', result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const fileUri = result.assets[0].uri;
                const fileName = result.assets[0].name;
                const targetPath = `${FileSystem.documentDirectory}vocabulaire/${fileName}`;

                console.log(`Fichier sélectionné : ${fileName}, chemin : ${fileUri}`);
                console.log(`Copie du fichier dans : ${targetPath}`);

                await FileSystem.copyAsync({
                    from: fileUri,
                    to: targetPath,
                });

                setImportedFile(fileName); // Mettre à jour l'état avec le nom du fichier importé
                console.log(`Fichier importé avec succès : ${fileName}`);

                listXlsxFiles(); // Mettre à jour la liste après l'importation
            } else {
                console.log('Import annulé par l’utilisateur');
            }
        } catch (error) {
            console.error('Erreur lors de l\'importation du fichier :', error);
        }
    };

    // Fonction pour enregistrer et indiquer le fichier sélectionné
    const selectFile = async (fileName) => {
        try {
            await AsyncStorage.setItem('selectedVocabFile', fileName);
            setSelectedFile(fileName);
            console.log(`Fichier sélectionné pour l'entraînement : ${fileName}`);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du fichier sélectionné :', error);
        }
    };

    // Récupérer le fichier sélectionné lors du chargement de la page
    const getSelectedFile = async () => {
        const savedFile = await AsyncStorage.getItem('selectedVocabFile');
        setSelectedFile(savedFile);
    };

    useEffect(() => {
        initializeDirectory();
    }, []);

    return (
        <View style={styles.container}>
            <Button title="Importer" onPress={handleImport} />
            {importedFile && <Text style={styles.fileText}>Fichier importé : {importedFile}</Text>}

            <Text style={styles.listTitle}>Fichiers dans Vocabulaire :</Text>
            <FlatList
                data={files}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => selectFile(item)}>
                        <View style={[styles.fileContainer, selectedFile === item && styles.selectedFile]}>
                            <Text style={styles.fileItem}>{item}</Text>
                            {selectedFile === item && <Text style={styles.selectedText}>Sélectionné</Text>}
                        </View>
                    </TouchableOpacity>
                )}
            />

            <Button title="Retour au quizz" onPress={() => navigation.navigate('Quizz')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    fileText: {
        marginTop: 20,
        fontSize: 16,
        color: 'green',
    },
    listTitle: {
        marginTop: 30,
        fontSize: 18,
        fontWeight: 'bold',
    },
    fileContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff',
        marginVertical: 5,
    },
    selectedFile: {
        backgroundColor: '#d0f0c0', // Couleur de fond pour le fichier sélectionné
    },
    selectedText: {
        color: 'green',
        fontWeight: 'bold',
        marginTop: 5,
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        backgroundColor: 'red',
        marginVertical: 10,
        borderRadius: 5,
    },
    deleteText: {
        color: 'white',
        fontWeight: 'bold',
        padding: 10,
    },
    fileItem: {
        fontSize: 16,
    },
});

export default Listevoc;
