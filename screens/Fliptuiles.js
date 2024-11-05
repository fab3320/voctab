import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet, Text, Animated, TouchableOpacity, FlatList, Button } from 'react-native';
import { extract_flashcard } from '../utils/extractvoc2';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');
const itemWidth = width / 2;
const marginHorizontal = 10;
const totalItemWidth = itemWidth + marginHorizontal * 2;

export default function FlashcardsObject() {
    const [flashcards, setFlashcards] = useState([]);
    const [isFlippedGlobal, setIsFlippedGlobal] = useState(false);

    const toggleLanguageOrder = () => {
        setIsFlippedGlobal(!isFlippedGlobal);
    };

    const shuffleFlashcards = () => {
        const shuffled = [...flashcards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setFlashcards(shuffled);
    };

    useEffect(() => {
        const loadFlashcards = async () => {
            try {
                const selectedFile = await AsyncStorage.getItem('selectedVocabFile');
                if (!selectedFile) {
                    console.error("Aucun fichier sélectionné pour les mots de vocabulaire.");
                    return;
                }

                const fileUri = `${FileSystem.documentDirectory}vocabulaire/${selectedFile}`;
                console.log("Chemin du fichier de vocabulaire :", fileUri);

                const result = await extract_flashcard({ uri: fileUri });
                console.log("Objet flashcards extrait :", result.flashcards);

                setFlashcards(result.flashcards);
            } catch (error) {
                console.error("Erreur lors de l'extraction des flashcards :", error);
            }
        };

        loadFlashcards();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button title="Inverser les langues" onPress={toggleLanguageOrder} />
                <Button title="Mélanger" onPress={shuffleFlashcards} />
            </View>
            <FlatList
                data={flashcards}
                keyExtractor={(item) => item.index.toString()}
                renderItem={({ item }) => <Tile item={item} isFlippedGlobal={isFlippedGlobal} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={totalItemWidth}
                decelerationRate="fast"
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

function Tile({ item, isFlippedGlobal }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const flipAnim = useState(new Animated.Value(0))[0];

    const flipCard = () => {
        Animated.timing(flipAnim, {
            toValue: isFlipped ? 0 : 180,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            setIsFlipped(!isFlipped);
        });
    };

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    const frontAnimatedStyle = {
        transform: [{ rotateY: frontInterpolate }],
    };

    const backAnimatedStyle = {
        transform: [{ rotateY: backInterpolate }],
    };

    return (
        <TouchableOpacity onPress={flipCard} activeOpacity={0.8} style={styles.cardContainer}>
            {isFlippedGlobal ? (
                <>
                    <Animated.View style={[styles.card, frontAnimatedStyle]}>
                        <Text style={styles.translation}>{item.francais}</Text>
                    </Animated.View>
                    <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                        <Text style={styles.word}>{item.anglais}</Text>
                    </Animated.View>
                </>
            ) : (
                <>
                    <Animated.View style={[styles.card, frontAnimatedStyle]}>
                        <Text style={styles.word}>{item.anglais}</Text>
                    </Animated.View>
                    <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                        <Text style={styles.translation}>{item.francais}</Text>
                    </Animated.View>
                </>
            )}
        </TouchableOpacity>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 10,
    },
    list: {
        alignItems: 'center',
        paddingHorizontal: (width - itemWidth) / 2,
    },
    cardContainer: {
        width: itemWidth,
        height: itemWidth,
        marginHorizontal,
        perspective: 1000, // Assure un effet de 3D pour la rotation
    },
    card: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e0f7fa',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backfaceVisibility: 'hidden', // Cache l'autre face quand elle est tournée
    },
    cardBack: {
        position: 'absolute',
        backgroundColor: '#f9c21d', // Couleur différente pour l'arrière
        top: 0,
        left: 0,
    },
    word: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00796b',
    },
    translation: {
        fontSize: 16,
        color: '#004d40',
    },
});
