import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {StyleSheet, Text, TextInput, View, Button} from 'react-native';
import {extract_flashcard} from './utils/extractvoc2.js';
import { useAssets,Asset } from 'expo-asset';


function DisplayFlashcard({ langue1, langue2, flashcard, onNextQuestion, otherLangue, displayedLangue,forceLangue, setForceLangue}){
    const [traduction, setTraduction] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [compteur, setCompteur] = useState(0);
    const [skipflashcard, setSkipFlashcard] = useState('');

    const verifyAnswer = () => {
        console.log("Traduction entrée:", traduction);
        console.log("Réponse attendue:", flashcard[otherLangue]);
        setIsCorrect(traduction === flashcard[otherLangue]);
        const tradLower = traduction.toLowerCase();
        const correctLower = flashcard[otherLangue].toLowerCase();
        // const correct = traduction === flashcard[otherLangue]
        console.log("Traduction entrée en minuscules:", tradLower);
        console.log("Réponse attendue en minuscules:", correctLower);
        if (tradLower === correctLower) {
            console.log("Réponse correcte");
            setCompteur(compteur + 1);
            onNextQuestion(setIsCorrect, setTraduction);
        }
        else{ //bonus : faire réagir l'appli si la réponse est fausse
            console.log("Réponse incorrecte");
        }
    };
    return (
        <View>
            {skipflashcard !== '' && <Text>{skipflashcard}</Text>}
            <Text>Compteur de bonnes réponses : {compteur}</Text>
            <Text>{displayedLangue} : {flashcard[displayedLangue]}</Text>
            <Text>{otherLangue} : "??__??"</Text>

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

            <Button
                title="Passer"
                onPress={() => {
                    setSkipFlashcard(`réponse du dernier mot passé ==> ${flashcard[displayedLangue]} : ${flashcard[otherLangue]}`);
                    onNextQuestion(setIsCorrect, setTraduction); // On passe à la question suivante
                }}

            />
            <Button
                title={
                    forceLangue === '0'
                        ? `testé en aléatoire`
                        : forceLangue === '1'
                            ? `testé en ${langue2} => ${langue1}`
                            : `testé en ${langue1} => ${langue2}`
                }
                onPress={() => {
                    // Alterner entre les trois états : '0', '1', et '2'
                    const newForceLangue =
                        forceLangue === '0' ? '1' : forceLangue === '1' ? '2' : '0';
                    setForceLangue(newForceLangue);
                    onNextQuestion(setIsCorrect, setTraduction); // Actualise la question avec la nouvelle valeur
                }}
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
    const [forceLangue, setForceLangue] = useState('0');

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
                if (forceLangue === '0') {
                const randomLangue = Math.random() <0.5 ? result.headers[0] : result.headers[1];
                const otherLangue = randomLangue === result.headers[0] ? result.headers[1] : result.headers[0];
                setDisplayedLangue(randomLangue); // Initialisation aléatoire de la langue affichée
                setOtherLangue(otherLangue); // Initialisation de la langue de la traduction
                } else if (forceLangue === '1') {
                    setDisplayedLangue(result.headers[0]);
                    setOtherLangue(result.headers[1]);
                }
                else if (forceLangue === '2') {
                    setDisplayedLangue(result.headers[1]);
                    setOtherLangue(result.headers[0]);
                }

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
        if (forceLangue === '0') {
            const randomLangue = Math.random() <0.5 ? headers[0] : headers[1];
            const otherLangue = randomLangue === headers[0] ? headers[1] : headers[0];
            setDisplayedLangue(randomLangue); // On change la langue affichée
            setOtherLangue(otherLangue); // On change la langue de la traduction (autre langue que celle affichée
        } else if (forceLangue === '1') {
            setDisplayedLangue(headers[0]);
            setOtherLangue(headers[1]);
        } else if (forceLangue === '2') {
            setDisplayedLangue(headers[1]);
            setOtherLangue(headers[0]);
        }

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
                    forceLangue={forceLangue}
                    setForceLangue={setForceLangue}
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

