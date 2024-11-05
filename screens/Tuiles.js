import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { extract_flashcard } from '../utils/extractvoc2';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');
const itemWidth = width / 2;
const marginHorizontal = 10;
const totalItemWidth = itemWidth + marginHorizontal * 2; // Largeur totale d'une tuile avec espacement

export default function Flashcardsobject() {
    const [flashcards, setFlashcards] = useState([]);
    const [isFlipped, setIsFlipped] = useState(false); // État pour gérer l'inversion des langues
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    const handleFlip = () => {
        setIsFlipped((prev) => !prev);
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
            <TouchableOpacity style={styles.flipButton} onPress={handleFlip}>
                <Text style={styles.flipButtonText}>Inverser les langues</Text>
            </TouchableOpacity>
            <Animated.FlatList
                data={flashcards}
                keyExtractor={(item) => item.index.toString()}
                renderItem={({ item, index }) => (
                    <Tuiles item={item} index={index} scrollX={scrollX} isFlipped={isFlipped} onFlip={handleFlip} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={totalItemWidth} // Inclut la largeur totale avec espacement
                decelerationRate="fast" // Ralentissement pour un effet de centrage
                onScroll={scrollHandler}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

function Tuiles({ item, index, scrollX, isFlipped, onFlip }) {
    const itemScaleStyle = useAnimatedStyle(() => {
        const input = [
            (index * totalItemWidth) - totalItemWidth, // Une largeur totale avant le centre
            index * totalItemWidth,                   // Centre exact de la tuile
            (index * totalItemWidth) + totalItemWidth // Une largeur totale après le centre
        ];
        const output = [0.8, 1.2, 0.8]; // Taille maximale au centre et plus petite sur les côtés

        const scale = interpolate(scrollX.value, input, output, Extrapolate.CLAMP);

        return {
            transform: [{ scale: withSpring(scale, { damping: 8, stiffness: 300 }) }],
        };
    });

    return (
        <TouchableOpacity onPress={onFlip} activeOpacity={0.8}>
            <Animated.View style={[styles.item, itemScaleStyle]}>
                {isFlipped ? (
                    <>
                        <View style={styles.halfTileTop}>
                            <Text style={styles.translation}>{item.francais}</Text>
                        </View>
                        <View style={styles.halfTileBottom}>
                            <Text style={styles.word}>{item.anglais}</Text>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.halfTileTop}>
                            <Text style={styles.word}>{item.anglais}</Text>
                        </View>
                        <View style={styles.halfTileBottom}>
                            <Text style={styles.translation}>{item.francais}</Text>
                        </View>
                    </>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 20,
    },
    flipButton: {
        backgroundColor: '#00796b',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    flipButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    item: {
        height: itemWidth,
        width: itemWidth,
        backgroundColor: '#e0f7fa',
        borderRadius: 10,
        overflow: 'hidden', // Masque les bords pour un rendu propre
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    halfTileTop: {
        flex: 1,
        backgroundColor: '#b2ebf2',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    halfTileBottom: {
        flex: 1,
        backgroundColor: '#80deea',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
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
    list: {
        alignItems: 'center',
        paddingHorizontal: (width - itemWidth) / 2,
    },
});
