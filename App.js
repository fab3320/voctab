import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {StyleSheet, Text, TextInput, View, Button} from 'react-native';
import {extract_flashcard} from './utils/extractvoc2.js';
import { useAssets,Asset } from 'expo-asset';


function DisplayFlashcard({ langue1, langue2, flashcard, onNextQuestion, otherLangue, displayedLangue }) {
    const [traduction, setTraduction] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    const verifyAnswer = () => {
        console.log("Traduction entrée:", traduction);
        console.log("Réponse attendue:", flashcard[otherLangue]);
        setIsCorrect(traduction.toLowerCase() === flashcard[otherLangue]).toLowerCase();
        console.log("Résultat de la vérification:", traduction.toLowerCase() === flashcard[otherLangue]).toLowerCase();
    };
    return (
        <View>
            <Text>{displayedLangue} : {flashcard[displayedLangue]}</Text>
            <Text>{otherLangue} : "????"</Text>

            <Text>"la réponse est : {flashcard[otherLangue]}"</Text>
            <TextInput
                placeholder={`Entrez la traduction en ${otherLangue}`}
                value={traduction}
                onChangeText={setTraduction}
                style={styles.inputStyle}
            />
            <Button
                title={isCorrect ? "Question suivante" : "Vérifier"}
                onPress={isCorrect ? () => onNextQuestion(setIsCorrect, setTraduction) : verifyAnswer}
            />
            {isCorrect && <Text>Bravo !</Text>}
        </View>
    );

}


export default function App() {
    const [headers, setHeaders] = useState([]); // Initialisation comme tableau vide
    const [flashcards, setFlashcards] = useState([]);
    // Ligne définie initialement à null (mais on va la changer aléatoirement + loin)
    const [currentFlashcard, setCurrentFlashcard] = useState(null);
    //Ici,j'affiche la langue 1 par défaut
    const [displayedLangue, setDisplayedLangue] = useState('langue1');
    const [otherLangue, setOtherLangue] = useState('langue2')
    // Ici, chaque flashcard possède la structure suivante :
    // {"langue1": 'mot1', "langue2": 'mot2', "index" : int}
    // Ci-dessous, 'useEffect' est également un Hook de React. Elle est exécutée après le rendu de la page.
    // En l'occurence, elle est utilisée pour charger les en-têtes et les flashcards depuis le fichier Excel.
    useEffect(() => {
        const fetchHeaders = async () => {
            try {
                const asset = Asset.fromModule(require('./assets/base_voc/voc.xlsx'));
                await asset.downloadAsync();
                const result = await extract_flashcard(asset);
                setHeaders(result.headers);
                setFlashcards(result.flashcards);
                if(result.flashcards.length === 0) { // Contrôlons qu'il y a bien des flashcards
                    console.error("Aucune flashcard trouvée !");
                    return;
                }
                const randomLineNumber = Math.floor(Math.random() * result.flashcards.length);
                const randomLangue = Math.random() <0.5 ? result.headers[0] : result.headers[1];
                const otherLangue = randomLangue === result.headers[0] ? result.headers[1] : result.headers[0];
                setDisplayedLangue(randomLangue); // Initialisation aléatoire de la langue affichée
                setOtherLangue(otherLangue); // Initialisation de la langue de la traduction

                setCurrentFlashcard(randomLineNumber); // Initialisation après chargement
            } catch (error) {
                console.error("Erreur lors de l'extraction des en-têtes :", error);
            }
        };
        fetchHeaders();
    }, []);


    const nextFlashcard = (setIsCorrectFunc, setTraduction) => {
        setIsCorrectFunc(false); // On réinitialise le statut de la réponse
        setTraduction(''); // On réinitialise le texte de "consigne"
        const randomLangue = Math.random() <0.5 ? headers[0] : headers[1];
        const otherLangue = randomLangue === headers[0] ? headers[1] : headers[0];
        setDisplayedLangue(randomLangue); // On change la langue affichée
        setOtherLangue(otherLangue); // On change la langue de la traduction (autre langue que celle affichée
        // si on est ici, cest que les flashcards ont déja été chargées, flashcards.length > 0
        const randomLineNumber = Math.floor(Math.random() * flashcards.length);
        setCurrentFlashcard(randomLineNumber);
    };

    const flashcard = currentFlashcard !== null ? flashcards[currentFlashcard] : null;

    return (
        <View style={styles.container}>
            {flashcard && headers.length > 1 && (
                <DisplayFlashcard
                    langue1={headers[0]}
                    langue2={headers[1]}
                    flashcard={flashcard}
                    onNextQuestion={nextFlashcard}
                    otherLangue={otherLangue}
                    displayedLangue={displayedLangue}
                />
            )}
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

