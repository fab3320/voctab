import React, {useEffect, useState} from 'react';
import {StatusBar} from 'expo-status-bar';
import {Button, StyleSheet, Text, View} from 'react-native';
import {extract_flashcard} from './utils/extractvoc2.js';
import {Asset} from 'expo-asset';
import _ from "lodash";
import * as Animatable from 'react-native-animatable';
import {DisplayFlashcard} from "./DisplayFlashcard";


let headers = [];
let flashcards = [];

export default function App() {
    // Ligne définie initialement à null (mais on va la changer aléatoirement + loin)
    const [currentFlashcard, setCurrentFlashcard] = useState(-1);
    //Ici,j'affiche la langue 1 par défaut
    const [displayedLangue, setDisplayedLangue] = useState('langue1');
    const [otherLangue, setOtherLangue] = useState('langue2')
    const [forceLangue, setForceLangue] = useState('2');
    const [skipflashcard, setSkipFlashcard] = useState('');
    const [hideAnimation, setHideAnimation] = useState(false); // État pour gérer l'animation
    const [animationKey, setAnimationKey] = useState(0); // Clé pour relancer l
    const [compteur, setCompteur] = useState(0);
    const randomizeFlashcardsOrder = () => {
        flashcards = _.shuffle(flashcards);
    }

    const nextFlashcard = () => {
        console.log('nextFlashcard', headers)
        setHideAnimation(false);
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
            <Text style={{color: '#5b33d9', fontWeight: 'bold', fontSize: 40, marginBottom: 15}}>Voc<Text
                style={{color: '#7da982'}}>Tab</Text></Text>

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
                    setCompteur(0)
                }}
            />

            <View style={styles.cadre}>

                {flashcard && displayedLangue && (
                    <DisplayFlashcard
                        flashcard={flashcard}
                        nextFlashcard={nextFlashcard}
                        displayedLangue={displayedLangue}
                        otherLangue={otherLangue}
                        compteur={compteur}
                        setCompteur={setCompteur}
                    />
                )}

                {currentFlashcard < flashcards.length ?
                    <Text>{currentFlashcard + 1} / {flashcards.length}</Text> :
                    <><Text style={{marginVertical: 20, fontWeight: 'bold', fontSize: 30, color: '#5b33d9'}}>Fin des
                        flashcards {"\n"}Score
                        final: {compteur} / {flashcards.length}</Text>
                        <Button
                            title="Recommencer"
                            onPress={() => {
                                randomizeFlashcardsOrder()
                                setCurrentFlashcard(0)
                                setCompteur(0)
                            }}
                        />
                    </>
                }

                <StatusBar style="auto"/>
            </View>
            {currentFlashcard < flashcards.length ?
                <Button
                    title="Passer"
                    onPress={() => {
                        setSkipFlashcard(`Flashcard passée ==> ${flashcard[displayedLangue]} : ${flashcard[otherLangue]}`);
                        setAnimationKey(prev => prev + 1); // Changer la clé pour relancer l'animation
                        nextFlashcard();
                    }}
                /> : null
            }

            {skipflashcard !== '' && (
                <Animatable.View
                    key={animationKey} // Clé unique pour relancer l'animation à chaque changement
                    animation="fadeIn" // Animation "fadeIn"
                    duration={1500}
                    style={styles.cadrepasser}
                >
                    <Text style={{color: '#5b33d9', fontStyle: 'italic', fontSize: 20, marginTop: 0}}>
                        {skipflashcard}
                    </Text>
                    <Button
                        title="masquer"
                        onPress={() => {
                            setSkipFlashcard(''); // Masquer le cadre
                        }}
                    />
                </Animatable.View>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#c4c4c4',
        alignItems: 'center',
        justifyContent: 'top',
        padding: 20,
        marginTop: 50,
    },
    cadre: {
        width: '90%', // Largeur du cadre
        padding: 20, // Espacement interne
        borderWidth: 4, // Épaisseur de la bordure
        borderColor: '#90e797', // Couleur de la bordure
        borderRadius: 10, // Coins arrondis
        backgroundColor: '#7e7d7d', // Couleur de fond
        shadowColor: '#000', // Couleur de l'ombre
        shadowOffset: {width: 0, height: 2}, // Décalage de l'ombre
        shadowOpacity: 0.2, // Opacité de l'ombre
        shadowRadius: 4, // Rayon de l'ombre
        elevation: 5, // Pour Android : élévation pour l'ombre
        alignItems: 'center', // Centrer le contenu horizontalement
        justifyContent: 'center', // Centrer le contenu verticalement
        marginVertical: 20,
    },
    cadrepasser: {
        width: '90%', // Largeur du cadre
        padding: 20, // Espacement interne
        borderWidth: 5, // Épaisseur de la bordure
        borderColor: '#90e797', // Couleur de la bordure
        borderRadius: 10, // Coins arrondis
        backgroundColor: '#7e7d7d', // Couleur de fond
        shadowColor: '#000', // Couleur de l'ombre
        shadowOffset: {width: 0, height: 2}, // Décalage de l'ombre
        shadowOpacity: 0.2, // Opacité de l'ombre
        shadowRadius: 4, // Rayon de l'ombre
        elevation: 5, // Pour Android : élévation pour l'ombre
        alignItems: 'center', // Centrer le contenu horizontalement
        justifyContent: 'center', // Centrer le contenu verticalement
        marginVertical: 20,
    },
});

