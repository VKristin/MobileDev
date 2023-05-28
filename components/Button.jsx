import { StyleSheet, View, Pressable, Text } from 'react-native';
import { useState } from 'react';

export default function Button({ label, theme, onPress }) {
    if (theme === "primary") {
      
      
        return (
          <View
          style={[styles.buttonContainer, { borderWidth: 2, borderColor: "#000000", borderRadius: 100, padding: 15 }]}
          >
            <Pressable
              style={[styles.button, { backgroundColor: "#fff" }]}
              onPress={onPress}
            >
              <Text style={[styles.buttonLabel, { color: "#25292e" }]}>{label}</Text>
            </Pressable>
        </View>
        );
      }
}

const styles = StyleSheet.create({
  // Styles from previous step remain unchanged.
});