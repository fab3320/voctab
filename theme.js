// theme.js
import { DefaultTheme } from 'react-native-paper';

export const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#90e797',  // Vert
        accent: '#bb67de',   // Violet
        background: '#F5F5F5',  // Gris clair
        surface: '#FFFFFF',
        text: '#212121',
        placeholder: '#9E9E9E',  // Gris pour les placeholders
    },
};
