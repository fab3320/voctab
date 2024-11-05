import React, {useEffect, useState} from 'react';
import {StatusBar} from 'expo-status-bar';
import {Button, StyleSheet, Text, View} from 'react-native';
import {extract_flashcard} from '../utils/extractvoc2.js';
import {Asset} from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from "lodash";
import * as Animatable from 'react-native-animatable';
import {DisplayFlashcard} from "../DisplayFlashcard";

let headers = [];
let flashcards = [];

export default function Quizz({ navigation }) {
    const [currentFlashcard, setCurrentFlashcard] = useState(-1);
    const [displayedLangue, setDisplayedLangue] = useState('langue1');
    const [otherLangue, setOtherLangue] = useState('langue2');
    const [forceLangue, setForceLangue] = useState('2');
    const [skipflashcard, setSkipFlashcard] = useState('');
    const [hideAnimation, setHideAnimation] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [compteur, setCompteur] = useState(0);

    const randomizeFlashcardsOrder = () => {
        flashcards = _.shuffle(flashcards);
    };

    const nextFlashcard = () => {
        setHideAnimation(false);
        if (forceLangue === 'random') {
            const randomLangue = Math.random() < 0.5 ? headers[0] : headers[1];
            const otherLangue = randomLangue === headers[0] ? headers[1] : headers[0];
            setDisplayedLangue(randomLangue);
            setOtherLangue(otherLangue);
        } else if (forceLangue === '1') {
            setDisplayedLangue(headers[0]);
            setOtherLangue(headers[1]);
        } else if (forceLangue === '2') {
            setDisplayedLangue(headers[1]);
            setOtherLangue(headers[0]);
        }
        setCurrentFlashcard(currentFlashcard + 1);
    };

    useEffect(() => {
        const fetchHeaders = async () => {
            try {
                let fileUri;
                const selectedFile = await AsyncStorage.getItem('selectedVocabFile');

                if (selectedFile) {
                    fileUri = `${FileSystem.documentDirectory}vocabulaire/${selectedFile}`;
                    console.log(`Fichier sélectionné : ${selectedFile}`);
                } else {
                    const defaultAsset = Asset.fromModule(require('../assets/base_voc/voc.xlsx'));
                    await defaultAsset.downloadAsync();
                    fileUri = defaultAsset.localUri || defaultAsset.uri;
                    console.log(`Aucun fichier sélectionné, utilisation du fichier par défaut : voc.xlsx`);
                }

                const result = await extract_flashcard({ uri: fileUri });
                headers = result.headers;
                flashcards = result.flashcards;

                if (flashcards.length === 0) {
                    console.error("Aucune flashcard trouvée !");
                    return;
                }

                randomizeFlashcardsOrder();
                nextFlashcard();

            } catch (error) {
                console.error("Erreur lors de l'extraction des en-têtes :", error);
            }
        };

        fetchHeaders();
    }, []);

    const flashcard = currentFlashcard !== null ? flashcards[currentFlashcard] : null;

    return (
        <View style={styles.container}>
            <Text style={{color: '#5b33d9', fontWeight: 'bold', fontSize: 40, marginBottom: 15}}>Voc<Text style={{color: '#7da982'}}>Tab</Text></Text>

            {/* Bouton "Liste" pour accéder à ImporteFiles */}
            <Button
                title="Liste"
                onPress={() => navigation.navigate('Listevoc')}
            />

            <Button
                title={
                    forceLangue === 'random'
                        ? `aléatoire`
                        : forceLangue === '1'
                            ? `${displayedLangue} => ${otherLangue}`
                            : `${otherLangue} => ${displayedLangue}`
                }
                onPress={() => {
                    const newForceLangue = forceLangue === 'random' ? '1' : forceLangue === '1' ? '2' : 'random';
                    setForceLangue(newForceLangue);
                    randomizeFlashcardsOrder();
                    setCurrentFlashcard(0);
                    setCompteur(0);
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

                {currentFlashcard < flashcards.length ? (
                    <Text>{currentFlashcard + 1} / {flashcards.length}</Text>
                ) : (
                    <>
                        <Text style={{marginVertical: 20, fontWeight: 'bold', fontSize: 30, color: '#5b33d9'}}>Fin des flashcards {"\n"}Score final: {compteur} / {flashcards.length}</Text>
                        <Button
                            title="Recommencer"
                            onPress={() => {
                                randomizeFlashcardsOrder();
                                setCurrentFlashcard(0);
                                setCompteur(0);
                            }}
                        />
                    </>
                )}

                <StatusBar style="auto" />
            </View>

            {currentFlashcard < flashcards.length && (
                <Button
                    title="Passer"
                    onPress={() => {
                        setSkipFlashcard(`Flashcard passée ==> ${flashcard[displayedLangue]} : ${flashcard[otherLangue]}`);
                        setAnimationKey(prev => prev + 1);
                        nextFlashcard();
                    }}
                />
            )}

            {skipflashcard !== '' && (
                <Animatable.View
                    key={animationKey}
                    animation="fadeIn"
                    duration={1500}
                    style={styles.cadrepasser}
                >
                    <Text style={{color: '#5b33d9', fontStyle: 'italic', fontSize: 20, marginTop: 0}}>
                        {skipflashcard}
                    </Text>
                    <Button
                        title="masquer"
                        onPress={() => setSkipFlashcard('')}
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
        width: '90%',
        padding: 20,
        borderWidth: 4,
        borderColor: '#90e797',
        borderRadius: 10,
        backgroundColor: '#7e7d7d',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    cadrepasser: {
        width: '90%',
        padding: 20,
        borderWidth: 5,
        borderColor: '#90e797',
        borderRadius: 10,
        backgroundColor: '#7e7d7d',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
});

