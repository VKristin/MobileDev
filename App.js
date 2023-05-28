import React from 'react';
import MapScreen from './components/MapScreen';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ImagesScreen from './components/ImagesScreen';
import { useState, createContext, useContext } from "react";
import { ImagesProvider } from './components/Context'


const Stack = createNativeStackNavigator();

export default function App(){
  return (
    <ImagesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Map'>
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Images" component={ImagesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ImagesProvider>
  );
}