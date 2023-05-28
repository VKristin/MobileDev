import React, { useEffect } from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useState, createContext, useContext } from "react";
import { Context } from './Context'
import * as SQLite from 'expo-sqlite'
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location'
import { getPreciseDistance } from 'geolib';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const note = new Map() //useState

export default function MapScreen({navigation}) {
  const LOCATION_TASK_NAME = 'background-location-task';
  const db = SQLite.openDatabase("Markers.db");
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState(null);
  const [mark, setMark] = useState([])
  let foregroundSubscription = null

  useEffect (()=>{
    createTableMarkers();
    returnMarkers();
    createTableImages();
  }, [])

  useEffect(() =>{
    const checkDistance = async () => {
        for (let value of mark){
          if (getPreciseDistance(
            {latitude: position.latitude, longitude: position.longitude},
            {latitude: value.latitude, longitude: value.longitude}
          ) < 200) //расстояние получаем в метрах
          {
            if (!note.has(value)){
              note.set(value, 0);
              showNatification(value);
            }
          }
          else{
            if (note.has(value)){
              console.log(note.get(value))
              clearNotification(note.get(value))
              note.delete(value)
            }
          }
          }
      
    }
    checkDistance();
  }, [position]
  )

  useEffect(() => {
    (async () => {
      let { status } = await  Location.requestForegroundPermissionsAsync();
     if (status !== 'granted') {
        setStatus('Permission to access location was denied');
        return;
     } else {
       startForegroundUpdate()
       console.log('Access granted!!')
       setStatus(status)
     }
    
    })();
  }, []);
  /*
  useEffect(() => {
    (async () => {
      let { status } = await  Location.requestBackgroundPermissionsAsync();
     if (status !== 'granted') {
        setStatus('Permission to access location was denied');
        return;
     } else {
        watch_location();
        console.log('Access granted!!')
        setStatus(status)
        startBackgroundUpdate();
     }
    
    })();
  }, []);*/
  

  const showNatification = async (index) => {
    let idx = mark.findIndex((x) => x === index)
    let i = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Маркер!',
        body: "Вы находитесь рядом с маркером " + idx,
      },
      trigger: null,
    });
    console.log(i)
    note.set(index, i)
  }

  const clearNotification = (index) => {
    Notifications.dismissNotificationAsync(index)
  }

  const createTableMarkers = () => {
    db.transaction((tx)=> {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS Markers (latitude FLOAT, longitude FLOAT);"
      )
    })
}
const createTableImages = () => {
  db.transaction((tx)=> {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS Images (latitude FLOAT, longitude FLOAT, image TEXT);"
    )
  })
}
const returnMarkers = () =>{
  db.transaction((tx)=> {
    tx.executeSql(
      "SELECT * FROM Markers", null,
      (txObj, resultSet) => setMark(resultSet.rows._array),
      (txObj, error) => console.log(error),
    )
  })
}


  const onMapPressed = (e) => {
    const coordsPressed = e.nativeEvent.coordinate;
    db.transaction(async(tx)=>{
      await tx.executeSql(
        "INSERT INTO Markers (latitude, longitude) VALUES (?, ?)",
        [coordsPressed.latitude, coordsPressed.longitude],
        (txObj, resultSet) => {
          let exMarkers = [...mark];
          exMarkers.push({latitude: coordsPressed.latitude, longitude: coordsPressed.longitude});
          setMark(exMarkers);
        },
        (txObj, error) => console.log(error)
        )
    })
  }
  
  const onMarkerPressed = (e) => {
    const coordsPressed = e.nativeEvent.coordinate;
    navigation.navigate('Images', {
      coords: coordsPressed,
      db: db,
    });
  }

  const addMarker = () => {
    db.transaction(tx => {
      tx.executeSql(
        "INSERT INTO Markers (latitude, longitude) VALUES (?, ?)", []
      )
    });
  }
  const markerDisplayed = mark.map ((marker, index) => {
    return(
    <Marker
      key={index}
      coordinate={marker}
      onPress={onMarkerPressed}
    />)
  })

  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error(error)
      return
    }
    if (data) {
      // Extract location coordinates from data
      const { locations } = data
      const location = locations[0]
      if (location) {
        console.log("Location in background", location.coords)
      }
    }
  })

 /* const startBackgroundUpdate = async () => {
    // Don't track position if permission is not granted
    const { granted } = await Location.getBackgroundPermissionsAsync()
    if (!granted) {
      console.log("location tracking denied")
      return
    }
    else {
      console.log(position)
    }
  }*/

  const startForegroundUpdate = async () => {
    // Check if foreground permission is granted
    const { granted } = await Location.getForegroundPermissionsAsync()
    if (!granted) {
      console.log("location tracking denied")
      return
    }

    // Make sure that foreground location tracking is not running
    foregroundSubscription?.remove()

    // Start watching position in real-time
    foregroundSubscription = await Location.watchPositionAsync(
      {
        // For better logs, we set the accuracy to the most sensitive option
        accuracy: Location.Accuracy.BestForNavigation,
      },
      location => {
        setPosition(location.coords)
      }
    )
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map}
      showsUserLocation={true}
      showsMyLocationButton={true}
      onPress={onMapPressed}
      initialRegion={{
        latitude: 58.01,
        longitude: 56.2,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      }}>
        {markerDisplayed}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});