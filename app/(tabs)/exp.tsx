import { StyleSheet, View, Text } from "react-native";
import { useState } from "react";
import * as FileSystem from 'expo-file-system/legacy';

export default function Exp() {

    const [text, setText] = useState('aaaa');

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  text: {
    color: '#ffd33d',
  },
});
