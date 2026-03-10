import { StyleSheet, View } from "react-native";

import Record from "@/components/Record";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Record />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2d2d2e",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});
