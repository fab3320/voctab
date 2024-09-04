import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {extract_flashcard} from './utils/extractvoc2.js';
import { useAssets,Asset } from 'expo-asset';

function DisplayFlashcard({langue1,langue2,flashcard}){
    if(!flashcard) return null;
    const [traduction, setTraduction] = useState('');
    return(
        <View>
            <Text>{flashcard[langue1]} : {flashcard[langue2]}</Text> {/*affiche les deux mots*/}
            <TextInput placeholder="Entrez la traduction" value={traduction} onChangeText={setTraduction}/>
            {traduction === flashcard[langue2] ? <Text>Bravo !</Text> : null}
        </View>
    );
}
export default function App() {
    const [headers, setHeaders] = useState('');
    const [flashcards, setFlashcards] = useState([]);
    const [currentFlashcard, setCurrentFlashcard] = useState(0); // 0 correspond au num de la ligne excell
    useEffect(() => {
        const fetchHeaders = async () => {
            try {
                const asset = Asset.fromModule(require('./assets/base_voc/voc.xlsx'));
                await asset.downloadAsync();
                const result = await extract_flashcard(asset);
                setHeaders(result.headers);
                setFlashcards(result.flashcards);
            } catch (error) {
                console.error("Erreur lors de l'extraction des en-têtes :", error);
            }
        };

        fetchHeaders();
    }, []);
const flashcard = flashcards[currentFlashcard];
    return (
        <View style={styles.container}>
            <DisplayFlashcard langue1={headers[0]} langue2={headers[1]} flashcard={flashcard}/>
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
        padding: 20,
    },
});

