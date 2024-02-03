// // trackPlayerService.js
// // import TrackPlayer from "react-native-track-player";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// module.exports = async function () {
//   TrackPlayer.addEventListener("remote-play", async () => {
//     const position = await AsyncStorage.getItem("trackPlayerPosition");
//     if (position) {
//       await TrackPlayer.seekTo(Number(position));
//     }
//     await TrackPlayer.play();
//   });

//   TrackPlayer.addEventListener("remote-pause", async () => {
//     const position = await TrackPlayer.getProgress().then(
//       (progress) => progress.position
//     );
//     await AsyncStorage.setItem("trackPlayerPosition", String(position));
//     await TrackPlayer.pause();
//   });

//   TrackPlayer.addEventListener("remote-stop", async () => {
//     const position = await TrackPlayer.getProgress().then(
//       (progress) => progress.position
//     );
//     await AsyncStorage.setItem("trackPlayerPosition", String(position));
//     await TrackPlayer.stop();
//   });

//   TrackPlayer.addEventListener("playback-track-changed", async (data) => {
//     if (data.nextTrack) {
//       await AsyncStorage.removeItem("trackPlayerPosition");
//     }
//   });

//   // Add more event listeners or customize as needed

//   // This is necessary for the service to be registered
//   return async () => {
//     // Clean up code or perform tasks when the service is unregistered
//   };
// };
