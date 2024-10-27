import React, {useEffect, useState} from "react";
import * as Animatable from "react-native-animatable";
import {Button, Text, TextInput} from "react-native";

export function DisplayFlashcard({
                                     flashcard,
                                     nextFlashcard,
                                     otherLangue,
                                     displayedLangue,
                                     compteur,
                                     setCompteur
                                 }) {
    const [traduction, setTraduction] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false);
    const [skipflashcard, setSkipFlashcard] = useState('');
    const [hideAnimation, setHideAnimation] = useState(false);
    const [animationType, setAnimationType] = useState('fadeIn'); // Ajouter l'animation
    const [animationKey, setAnimationKey] = useState(0); // Utilisé pour relancer l'animation

    useEffect(() => {
        setTraduction(''); // On réinitialise la traduction
        setIsCorrect(false); // On réinitialise le statut de la réponse
        setIsIncorrect(false); // On réinitialise le statut de la réponse
        setAnimationKey(prevKey => prevKey + 1); // Changer la clé pour relancer l'animation
    }, [flashcard, displayedLangue, otherLangue]);

    const verifyAnswer = () => {
        console.log("Traduction entrée:", traduction);
        console.log("Réponse attendue:", flashcard[otherLangue]);

        // Comparer les réponses en minuscules
        const isCorrectAnswer = traduction.toLowerCase() === flashcard[otherLangue].toLowerCase();

        setIsCorrect(isCorrectAnswer);

        if (isCorrectAnswer) {
            setCompteur(compteur + 1);
        } else {
            setIsIncorrect(true);
        }
        console.log("Résultat de la vérification:", isCorrectAnswer);
    };
    return (
        <Animatable.View
            key={animationKey} // Clé unique pour relancer l'animation à chaque flashcard
            animation={animationType} // Type d'animation (tu peux le changer dynamiquement)
            duration={1500} // Durée de l'animation
            style={{marginBottom: 20}} // Style d'animation
        >
            <Text style={{fontSize: 20, marginBottom: 15, textAlign: 'right'}}>Score : {compteur}</Text>
            <Text>{displayedLangue} : {flashcard[displayedLangue]}</Text>

            <TextInput
                placeholder={`Entrez la traduction en ${otherLangue}`}
                value={traduction}
                onChangeText={setTraduction}
                style={{borderBottomWidth: 1, marginVertical: 10, padding: 5, fontStyle: traduction ? "normal" : "italic"}}
            />

            {isCorrect && <Text>Bravo !</Text>}
            {isIncorrect && <Text style={{color:'#5b33d9', marginVertical: 5}}>Réessaye !</Text>}

            <Button
                title={isCorrect ? "Question suivante" : "Vérifier"}
                onPress={isCorrect ? nextFlashcard : verifyAnswer}
            />

            <Text style={{fontStyle: "italic", fontWeight: "100", marginTop: 50}}>
                (temporaire: "la réponse est : {flashcard[otherLangue]}")
            </Text>
        </Animatable.View>
    );

}