import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AudioPlayer = () => {
  const [recording, setRecording] = useState();
  const [permissionAlert, setPermissionAlert] = useState("");
  const [sound, setSound] = useState(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [uploadedAudioURL, setUploadedAudioURL] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  //start

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );

        setRecording(recording);
      } else {
        setPermissionAlert(
          "Please grant permission to app to access microphone"
        );
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  //stop
  const stopRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();

        const { sound: newSound, status } =
          await recording.createNewLoadedSoundAsync();
        setSound(newSound);
        await uploadAudioToFirebase(recording.getURI());

        // Do something with the recorded sound, e.g., save to state or play it
        console.log("Recording stopped. Duration:", status.durationMillis);
      } catch (error) {
        console.error("Error stopping recording:", error);
      } finally {
        setRecording(null);
      }
    }
  };

  //Upload
  const uploadAudioToFirebase = async (audioFileUri) => {
    const blob = await new Promise((resolve, reject) => {
      setAudioUploading(true);
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.warn(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", audioFileUri, true);
      xhr.send(null);
    });

    const storage = getStorage();
    const fileName = `${new Date().toISOString()}.mp3`;
    const storageRef = ref(storage, `chats/audio/${fileName}`);

    const metadata = {
      contentType: "audio/3gpp",
    };

    try {
      await uploadBytes(storageRef, blob, metadata);

      // Get the download URL
      const url = await getDownloadURL(storageRef);
      console.log("this is uploaded audio url", url);

      // Set state values and then send the message
      setUploadedAudioURL(url);
      setAudioUploading(false);
    } catch (error) {
      console.error("Error while uploading file:", error);
      setAudioUploading(false);
    } finally {
      // Close and release the blob
      blob.close();
    }

    console.log("audio upload url:", uploadedAudioURL);
  };

  //Play-Pause
  const loadSound = async (audioCloudUrl) => {
    if (sound) {
      try {
        if (sound.isLoaded) {
          //   await sound.stopAsync();
          await sound.unloadAsync();
        }

        await sound.loadAsync({ uri: audioCloudUrl });
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    }
  };

  const playPauseToggle = async () => {
    if (!sound) return;

    try {
      // Replace 'YOUR_AUDIO_CLOUD_URL' with the actual cloud storage URL
      const audioCloudUrl =
        "https://firebasestorage.googleapis.com/v0/b/chatmate-62904.appspot.com/o/chats%2Faudio%2F2024-02-01T04%3A48%3A07.258Z.mp3?alt=media&token=ed5b86f4-fbe6-4629-9d95-7ab60a6d9339";

      await loadSound(audioCloudUrl);

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        const savedPosition = await AsyncStorage.getItem("playbackPosition");
        const startPosition = savedPosition ? parseFloat(savedPosition) : 0;

        await sound.setPositionAsync(startPosition);
        await sound.playAsync();
      }

      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const updatePlaybackPosition = async (status) => {
    if (status) {
      const currentPosition = status.positionMillis;
      await AsyncStorage.setItem(
        "playbackPosition",
        currentPosition.toString()
      );
    }
  };

  useEffect(() => {
    const setupAudio = async () => {
      const newSound = new Audio.Sound();

      const soundStatusSubscription = newSound.setOnPlaybackStatusUpdate(
        updatePlaybackPosition
      );

      setSound(newSound);

      return async () => {
        if (soundStatusSubscription) {
          await soundStatusSubscription.remove();
        }

        if (newSound) {
          await newSound.stopAsync(); // Stop the sound before unloading
          await newSound.unloadAsync(); // Unload the sound when the component is unmounted
        }
      };
    };

    setupAudio();
  }, []);
  return (
    <>
      <TouchableOpacity
        style={{
          padding: 10,
          borderWidth: 2,
          marginVertical: 10,
          width: 200,
          alignSelf: "center",
        }}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text>{recording ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ padding: 10, borderWidth: 2, width: 200, alignSelf: "center" }}
        onPress={playPauseToggle}
      >
        <Text>{isPlaying ? "Pause" : "Play"}</Text>
      </TouchableOpacity>
    </>
  );
};

export default AudioPlayer;
