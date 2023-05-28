import React from 'react';
import {Text, StyleSheet, View, Image, StatusBar, FlatList} from 'react-native'
import * as ImagePicker from 'expo-image-picker';
const PlaceholderImage = require('../assets/background-image.png');
import Button from '../components/Button';
import { useState, createContext, useContext, useEffect } from "react";
import { Context } from './Context'
import { RefreshControl } from 'react-native';
import * as SQLite from 'expo-sqlite'
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function ImagesScreen({route, navigation}){
  const { coords, db } = route.params;

  const [image, setImages] = useState([]);
  
  const returnImages = () =>{
    db.transaction((tx)=> {
      tx.executeSql(
        "SELECT image FROM Images WHERE longitude=(?) AND latitude=(?)", [coords.longitude, coords.latitude],
        (txObj, resultSet) => setImages(resultSet.rows._array.map((data, index) => {return (data.image)})),
        (txObj, error) => console.log(error),
      )
    })
  }
    useEffect (()=>{
      returnImages();
    }, [])
  

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
    });

    if (!result.canceled) {
      db.transaction(async(tx)=>{
        await tx.executeSql(
          "INSERT INTO Images (latitude, longitude, image) VALUES (?, ?, ?)",
          [coords.latitude, coords.longitude, result.assets[0].uri],
          (txObj, resultSet) => {
            let exMarkers = [...image];
            exMarkers.push(result.assets[0].uri);
            console.log(result.assets[0].uri)
            setImages(exMarkers);
          },
          (txObj, error) => console.log(error)
          )
      })
    } 
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <FlatList
          horizontal={true} 
          showsHorizontalScrollIndicator={false}
          data={image}
          renderItem={ ({ item, index }) => {
            return (
              <Image source={{uri : item}}
                key={index} 
                style={{
                  width:300,
                  height:400,
                  borderWidth:1,
                  borderColor:'#000000',
                  resizeMode:'contain',
                  margin:8
                }}
              />
            );
          }}
        />
      </View>
      <View style={styles.footerContainer}>
        <Button theme="primary" label="Добавить фото" onPress={pickImageAsync} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'stretch',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 10,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  footerContainer: {
    flex: 1/10,
    alignItems: 'center',
  },
});