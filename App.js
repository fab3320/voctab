import React, {useState, useEffect, useCallback} from 'react';
import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, TextInput, View, Button} from 'react-native';
import {extract_flashcard} from './utils/extractvoc2.js';
import {useAssets, Asset} from 'expo-asset';
import _ from "lodash";


function DisplayFlashcard({
                              flashcard,
                              nextFlashcard,
                              otherLangue,
                              displayedLangue,
                          }) {
    const [traduction, setTraduction] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [compteur, setCompteur] = useState(0);
    const [skipflashcard, setSkipFlashcard] = useState('');

    useEffect(() => {
        setTraduction(''); // On réinitialise la traduction
        setIsCorrect(false); // On réinitialise le statut de la réponse
    }, [flashcard, displayedLangue, otherLangue]);

    const verifyAnswer = () => {
        console.log("Traduction entrée:", traduction);
        console.log("Réponse attendue:", flashcard[otherLangue]);
        setIsCorrect(traduction === flashcard[otherLangue]);
        const correct = traduction === flashcard[otherLangue]
        if (correct) {
            setCompteur(compteur + 1);
        }
        console.log("Résultat de la vérification:", traduction === flashcard[otherLangue]);
    };
    return (
        <View>
            {skipflashcard !== '' && <Text>{skipflashcard}</Text>}
            <Text>Compteur de bonnes réponses : {compteur}</Text>
            <Text>{displayedLangue} : {flashcard[displayedLangue]}</Text>
            <Text>{otherLangue} : "??__??"</Text>

            <Text style={{fontStyle: "italic", fontWeight: "100"}}>(temporaire: "la réponse est
                : {flashcard[otherLangue]}")</Text>
            <TextInput
                placeholder={`Entrez la traduction en ${otherLangue}`}
                value={traduction}
                onChangeText={setTraduction}
                style={styles.inputStyle}
            />

            {isCorrect && <Text>Bravo !</Text>}

            <Button
                title={isCorrect ? "Question suivante" : "Vérifier"}
                onPress={isCorrect ? nextFlashcard : verifyAnswer}
            />

            <Button
                title="Passer"
                onPress={() => {
                    setSkipFlashcard(`réponse du dernier mot passé ==> ${flashcard[displayedLangue]} : ${flashcard[otherLangue]}`);
                    nextFlashcard(); // On passe à la question suivante
                }}

            />
        </View>
    );

}

let headers = [];
let flashcards = [];

export default function App() {
    // Ligne définie initialement à null (mais on va la changer aléatoirement + loin)
    const [currentFlashcard, setCurrentFlashcard] = useState(-1);
    //Ici,j'affiche la langue 1 par défaut
    const [displayedLangue, setDisplayedLangue] = useState('langue1');
    const [otherLangue, setOtherLangue] = useState('langue2')
    const [forceLangue, setForceLangue] = useState('2');


    const randomizeFlashcardsOrder = () => {
        flashcards = _.shuffle(flashcards);
    }

    const nextFlashcard = () => {
        console.log('nextFlashcard', headers)
        if (forceLangue === 'random') {
            const randomLangue = Math.random() < 0.5 ? headers[0] : headers[1];
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
        setCurrentFlashcard(currentFlashcard + 1);
    }


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
                headers = result.headers;
                flashcards = result.flashcards;
                if (result.flashcards.length === 0) { // Contrôlons qu'il y a bien des flashcards
                    console.error("Aucune flashcard trouvée !");
                    return;
                }

                randomizeFlashcardsOrder()
                nextFlashcard()

            } catch (error) {
                console.error("Erreur lors de l'extraction des en-têtes :", error);
            }
        };
        fetchHeaders();
    }, []);


    const flashcard = currentFlashcard !== null ? flashcards[currentFlashcard] : null;

    return (
        <View style={styles.container}>
            {flashcard && displayedLangue && (
                <DisplayFlashcard
                    flashcard={flashcard}
                    nextFlashcard={nextFlashcard}
                    displayedLangue={displayedLangue}
                    otherLangue={otherLangue}
                />
            )}
            <Button
                title={
                    forceLangue === 'random'
                        ? `aléatoire`
                        : forceLangue === '1'
                            ? `${displayedLangue} => ${otherLangue}`
                            : `${otherLangue} => ${displayedLangue}`
                }
                onPress={() => {
                    // Alterner entre les trois états : 'random', '1', et '2'
                    const newForceLangue =
                        forceLangue === 'random' ? '1' : forceLangue === '1' ? '2' : 'random';
                    setForceLangue(newForceLangue);
                    randomizeFlashcardsOrder()
                    setCurrentFlashcard(0)
                }}
            />
            { currentFlashcard < flashcards.length ?
                <Text>{currentFlashcard + 1} / {flashcards.length}</Text> :
                <><Text>Fin des flashcards</Text>
                    <Button
                        title="Recommencer"
                        onPress={() => {
                            randomizeFlashcardsOrder()
                            setCurrentFlashcard(0)
                        }}
                    />
                </>
            }

            <StatusBar style="auto"/>
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

