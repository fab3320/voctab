import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { extract_flashcard } from './utils/excelReader.js'; // Importation de la fonction

export default function App() {
    const [cellA1, setCellA1] = useState(null);
    const [cellB1, setCellB1] = useState(null);

    useEffect(() => {
        const loadFlashcards = async () => {
            try {
                const { cellA1, cellB1 } = await extract_flashcard(); // Obtenir les valeurs A1 et B1
                setCellA1(cellA1);
                setCellB1(cellB1);
            } catch (error) {
                console.error("Erreur lors du chargement des flashcards :", error);
            }
        };

        loadFlashcards();
    }, []);

    return (
        <View style={styles.container}>
            <Text>Okay okay le but maintenant c'est d'afficher la cellule A1 ici ==> {cellA1}</Text>
            <Text>Puis la cellule B1 ici ==> {cellB1}</Text>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
