import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { Icon, Slider } from "react-native-elements";

const AudioPlayer = () => {
  const [sound, setSound] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioId, setAudioId] = useState(null);
  const [currentUri, setCurrentUri] = useState(null);
  const [lastPosition, setLastPosition] = useState(0);
  const [value, setValue] = useState(0);
  const [vertValue, setVertValue] = useState(0);

  const interpolate = (start, end) => {
    let k = (value - 0) / 10; // 0 =>min  & 10 => MAX
    return Math.ceil((1 - k) * start + k * end) % 256;
  };

  const color = () => {
    let r = interpolate(255, 0);
    let g = interpolate(0, 255);
    let b = interpolate(0, 0);
    return `rgb(${r},${g},${b})`;
  };

  // useEffect(() => {
  //   const loadSound = async () => {
  //     try {
  //       if (shouldReload) {
  //         // Unload the previous sound if it exists
  //         if (sound) {
  //           await sound.unloadAsync();
  //         }

  //         // Load and play the new audio
  //         const { sound: newSound } = await Audio.Sound.createAsync(
  //           { uri: audioUrl },
  //           { shouldPlay: true },
  //           onPlaybackStatusUpdate
  //         );
  //         setSound(newSound);
  //         setIsLoaded(true);
  //       }
  //     } catch (error) {
  //       console.error("Error loading sound", error);
  //     }
  //   };

  //   loadSound();

  //   // Reset the reload state
  //   setShouldReload(false);

  //   // Cleanup function (unmount)
  //   return () => {
  //     if (sound) {
  //       sound.stopAsync();
  //       sound.unloadAsync();
  //     }
  //   };
  // }, [shouldReload]);

  useEffect(() => {
    // Set up an event listener for playback status updates
    if (sound) {
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          // If the current audio finished playing, unload it
          await sound.unloadAsync();
          setSound(null);
          setIsPlaying(false);
        } else {
          // Update the last position when the playback status is updated

          // Update the last position when the playback status is updated
          setLastPosition(status.positionMillis);
          setIsPlaying(status.isPlaying);
        }
      });
    }
  }, [sound]);

  async function playSound(audioLink, id) {
    if (sound && currentUri === audioLink) {
      // If sound is already playing, pause or resume it based on the current status
      if (isLoaded) {
        const status = await sound.getStatusAsync();
        if (status.isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      } else {
        // If sound is not loaded, unload the current one and load the new one
        await sound.stopAsync();
        await sound.unloadAsync();
        const { sound: newSound } = await Audio.Sound.createAsync(
          {
            uri: audioLink,
          },
          { shouldPlay: true, positionMillis: lastPosition }
        );
        setSound(newSound);
        setCurrentUri(audioLink);
        setIsLoaded(true);
        setIsPlaying(true);
        setAudioId(id);
      }
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync(
        {
          uri: audioLink,
        },
        { shouldPlay: true, positionMillis: lastPosition }
      );
      setSound(newSound);
      setIsLoaded(true);
      setCurrentUri(audioLink);
      setIsPlaying(true);
      setAudioId(id);
    }
  }

  useEffect(() => {
    // Add a listener for when the component unmounts to stop and unload the sound
    return () => {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // useEffect(() => {
  //   // Use setInterval to increment the slider value every millisecond
  //   const intervalId = setInterval(() => {
  //     setVertValue((prevValue) => prevValue + 1); // Increment the value (0 to 30) every millisecond
  //   }, 100);

  //   // Clear the interval when the component unmounts
  //   return () => clearInterval(intervalId);
  // }, []);

  return (
    <>
      <View style={[styles.contentView]}>
        <Slider
          value={vertValue}
          onValueChange={setVertValue}
          maximumValue={50}
          minimumValue={20}
          step={1}
          orientation="vertical"
          thumbStyle={{ height: 20, width: 16, backgroundColor: "transparent" }}
          thumbProps={{
            children: (
              <Icon
                name="heartbeat"
                type="font-awesome"
                size={20}
                reverse
                containerStyle={{ bottom: 20, right: 20 }}
                color="#f50"
              />
            ),
          }}
        />
        <Text style={{ paddingTop: 20 }}>Value: {vertValue}</Text>
      </View>
      <View style={styles.audioPlayerContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            playSound(
              "https://firebasestorage.googleapis.com/v0/b/chatmate-62904.appspot.com/o/chats%2Faudio%2F2024-02-01T04%3A47%3A31.780Z.mp3?alt=media&token=a40cc8c4-6ae3-4033-a303-2a758acd4a37",
              1234
            )
          }
        >
          <Text style={styles.audioText}>
            {sound && sound !== null ? `Pause/Resume Audio ` : `Play Audio `}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            playSound(
              "https://firebasestorage.googleapis.com/v0/b/chatmate-62904.appspot.com/o/chats%2Faudio%2F2024-02-01T04%3A56%3A54.594Z.mp3?alt=media&token=93fd90b4-ae1e-4add-a902-1cc51268c29f",
              2356
            )
          }
        >
          <Text style={styles.audioText}>
            {sound && sound !== null ? `Pause/Resume Audio ` : `Play Audio `}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  contentView: {
    padding: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "stretch",
  },
  audioPlayerContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  audioText: {
    fontSize: 16,
    color: "#fff",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
  },
  deleteText: {
    color: "white",
  },
});

export default AudioPlayer;

// import React, { useState, useEffect } from "react";
// import { TouchableOpacity, Text } from "react-native";
// import { Audio } from "expo-av";

// const AudioTest = () => {
//   const [sound, setSound] = useState();
//   const [currentUri, setCurrentUri] = useState(null);

//   useEffect(() => {
//     // Set up an event listener for playback status updates
//     if (sound) {
//       sound.setOnPlaybackStatusUpdate(async (status) => {
//         if (status.didJustFinish) {
//           // If the current audio finished playing, unload it
//           await sound.unloadAsync();
//           setSound(null);
//         } else {
//           // Update the last position when the playback status is updated

//         }
//       });
//     }
//   }, [sound]);

//   const playPauseToggle = async (uri) => {
//     if (sound && currentUri === uri) {
//       // If the sound is already playing and the same audio is clicked, pause it
//       await sound.pauseAsync();
//     } else {
//       // If a different audio is clicked or no audio is playing, unload the current one (if any)
//       if (sound) {
//         await sound.unloadAsync();
//       }

//       // Load and play the clicked audio, starting from the last position if available
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         { uri },
//         { shouldPlay: true,  }
//       );
//       setSound(newSound);
//       setCurrentUri(uri);
//     }
//   };

//   const stopPlayback = async () => {
//     if (sound) {
//       await sound.stopAsync();
//       setSound(null);
//     }
//   };

//   return (
//     <>
//       <TouchableOpacity
//         onPress={() =>
//           playPauseToggle(
//             "https://firebasestorage.googleapis.com/v0/b/chatmate-62904.appspot.com/o/chats%2Faudio%2F2024-02-01T04%3A47%3A31.780Z.mp3?alt=media&token=a40cc8c4-6ae3-4033-a303-2a758acd4a37"
//           )
//         }
//       >
//         <Text>Play/Pause Audio 1</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         onPress={() =>
//           playPauseToggle(
//             "https://firebasestorage.googleapis.com/v0/b/chatmate-62904.appspot.com/o/chats%2Faudio%2F2024-02-01T04%3A56%3A54.594Z.mp3?alt=media&token=93fd90b4-ae1e-4add-a902-1cc51268c29f"
//           )
//         }
//       >
//         <Text>Play/Pause Audio 2</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={stopPlayback}>
//         <Text>Stop</Text>
//       </TouchableOpacity>
//     </>
//   );
// };

// export default AudioTest;
