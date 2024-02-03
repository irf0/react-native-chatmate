import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Navigation from "./src/Navigation/NavigationStack";
import NavigationStack from "./src/Navigation/NavigationStack";
// import TrackPlayer from "react-native-track-player";
// import trackPlayerService from "./trackPlayerService";
import { useEffect } from "react";

export default function App() {
  // Replace with the actual path

  // useEffect(() => {
  //   TrackPlayer.registerPlaybackService(trackPlayerService);
  //   TrackPlayer.setupPlayer();
  // }, []);

  return (
    <NavigationContainer>
      <NavigationStack />
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
