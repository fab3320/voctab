import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {extract_flashcard} from './utils/extractvoc2.js';
import { useAssets,Asset } from 'expo-asset';


export default function App() {
    const [headers, setHeaders] = useState('');
    useEffect(() => {
        const fetchHeaders = async () => {
            try {
                const asset = Asset.fromModule(require('./assets/base_voc/voc.xlsx'));
                await asset.downloadAsync();
                const result = await extract_flashcard(asset);
                setHeaders(result.headers.join(', ')); // Convertit les en-têtes en une chaîne lisible
            } catch (error) {
                console.error("Erreur lors de l'extraction des en-têtes :", error);
            }
        };

        fetchHeaders();
    }, []);

    return (
        <View style={styles.container}>
            <Text>Les en-têtes sont : {headers}</Text>
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
