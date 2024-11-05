import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Quizz from './screens/Quizz';
import Listevoc from "./screens/Listevoc";
import Tuiles from "./screens/Tuiles";
import Fliptuiles from "./screens/Fliptuiles";

const Drawer = createDrawerNavigator();
function AppNavigator() {
    return (
        <NavigationContainer>
            <Drawer.Navigator initialRouteName="Fliptuiles">
                <Drawer.Screen name="Quizz" component={Quizz} />
                <Drawer.Screen name="Listevoc" component={Listevoc} />
                <Drawer.Screen name="Tuiles" component={Tuiles} />
                <Drawer.Screen name="Fliptuiles" component={Fliptuiles} />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

export default AppNavigator;
