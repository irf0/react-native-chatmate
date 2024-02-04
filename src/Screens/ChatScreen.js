import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  ImageBackground,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Avatar, Button, Icon, Slider } from "react-native-elements";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import EmojiPicker from "rn-emoji-keyboard";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_DB } from "../../Firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import * as MediaLibrary from "expo-media-library";
// import SoundPlayer from "react-native-sound-player";
import { AudioRecorderPlayer } from "react-native-audio-recorder-player";
import { Audio } from "expo-av";

const ChatScreen = ({ navigation, route }) => {
  const {
    friendName,
    friendPhone,
    friendProfilePic,
    friendUniqueID,
    combinedChatId,
  } = route.params || [];
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentlySelectedEmojis, setCurrentlySelectedEmojis] = useState([]);
  const flatListRef = useRef();
  const inputRef = useRef(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [recievedMessages, setRecievedMessages] = useState([{}]);
  const [uploadedMediaURL, setUploadedMediaURL] = useState("");
  const [uploadedMediaName, setUploadedMediaName] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [recordings, setRecordings] = React.useState([]);
  const [recording, setRecording] = useState();
  const [permissionAlert, setPermissionAlert] = useState("");
  const [audioUploading, setAudioUploading] = useState(false);
  const [uploadedAudioURL, setUploadedAudioURL] = useState("");
  const [sound, setSound] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioId, setAudioId] = useState(null);
  const [currentUri, setCurrentUri] = useState(null);
  const [lastPosition, setLastPosition] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [remainingDuration, setRemainingDuration] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerBackTitleVisible: false,
      headerShown: true,
      headerTitleAlign: "left",
      headerTitleStyle: {
        color: "#fff",
      },
      headerStyle: {
        elevation: 0,
        backgroundColor: "#5b41f0",
      },
      headerTintColor: "white",
      headerTitle: () => (
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Image
            source={{ uri: friendProfilePic }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8 }}
          />
          <View>
            <Text style={{ color: "white", fontSize: 18 }}>{friendName}</Text>
            <Text style={{ color: "white", fontSize: 12 }}>{friendPhone}</Text>
          </View>
        </View>
      ),
    });
  }, [navigation]);

  //---------------Chats displaying Department👇-------------//
  //Get chats from firebase
  useEffect(() => {
    const getUserMessages = async () => {
      const loggedUserId = await AsyncStorage.getItem("docID");
      const conversationRef = doc(FIREBASE_DB, "chats", combinedChatId);

      try {
        const unsubscribe = onSnapshot(conversationRef, (snapshot) => {
          let conversationArray = [];
          const docData = snapshot.data();
          const conversation = docData?.conversation;
          conversationArray = [...conversationArray, ...conversation];
          setRecievedMessages(conversationArray);
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    getUserMessages();
  }, []);

  //Format time of messages(chats)
  const formatTime = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    let hours = date?.getHours();
    const minutes = date?.getMinutes()?.toString()?.padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12; // Handle midnight (12 AM)
    hours = hours.toString().padStart(2, "0");
    return `${hours}:${minutes} ${ampm}`;
  };

  //Delete a message
  const deleteMessage = async (messageId) => {
    try {
      const messageDocRef = doc(FIREBASE_DB, "chats", combinedChatId);

      // Fetch the current document data
      const currentDoc = await getDoc(messageDocRef);
      const currentData = currentDoc.data();

      const updatedConversation = currentData.conversation.filter(
        (message) => message.msgId !== messageId
      );

      await updateDoc(messageDocRef, { conversation: updatedConversation });

      console.log("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message", error);
    }
  };

  //Show confirmation before deleting a msg.
  const showAlert = (messageId) => {
    Alert.alert(
      "Confirmation Required!",
      "Delete this message?",

      [
        {
          text: "Don't delete",
          style: "cancel",
        },
        {
          text: "Yes, Delete",
          style: "destructive",

          onPress: () => {
            deleteMessage(messageId);
          },
        },
      ],
      { cancelable: true }
    );
  };

  //----------Selecting and sending emojis Department👇----------//
  const handleOnEmojiSelected = (emoji) => {
    setCurrentlySelectedEmojis((prev) => [...prev, emoji.emoji]);
    setMessageInput((prevText) => prevText + emoji.emoji);
    console.log("Prev Text:", messageInput);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  //--------------Sending Images Department👇----------------//
  const openGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    if (!result.canceled) {
      setUploadedMediaURL(result?.assets[0]?.uri);
      setUploadedMediaName(result?.assets[0]?.fileName);
      const uploadedURL = uploadSelfie(
        result?.assets[0]?.uri,
        result?.assets[0]?.fileName
      );
    }
  };

  //Take a live photo and send
  const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    console.log(result);

    if (!result.canceled) {
      setUploadedMediaURL(result?.uri);
      setUploadedMediaName(result);
      const uploadedURL = await uploadSelfie(
        result?.uri,
        result?.assets[0]?.fileName
      );
    }
  };

  //Upload Image to Cloud
  const uploadSelfie = async (uri, name) => {
    const blob = await new Promise((resolve, reject) => {
      setMediaUploading(true);
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.warn(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const storage = getStorage();
    const fileName = uuidv4();
    const storageRef = ref(storage, `chats/images/${fileName}`);

    try {
      await uploadBytes(storageRef, blob);
      // Get the download URL
      const url = await getDownloadURL(storageRef);
      console.log(url);
      // Set state values and then send the message
      setUploadedMediaURL(url);
      setMediaUploading(false);
    } catch (error) {
      console.error("Error while uploading file:", error);
      setMediaUploading(false);
    } finally {
      // Close and release the blob
      blob.close();
    }
  };

  //Send Image Message
  useEffect(() => {
    const sendImageMediaMessage = async () => {
      try {
        if (uploadedMediaURL && !mediaUploading && messageInput === "") {
          await sendImageMessage(friendUniqueID);
          setUploadedMediaURL(null);
          setMediaUploading(false);
        }
      } catch (error) {
        console.error("Error sending media message:", error);
      }
    };

    sendImageMediaMessage();

    return () => {
      setUploadedMediaURL(null);
    };
  }, [uploadedMediaURL, mediaUploading]);

  //------------Audio Message Department👇---------------//

  //Start recording
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

  //Stop recording
  const stopRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const { sound: newSound, status } =
          await recording.createNewLoadedSoundAsync();
        setSound(newSound);
        await uploadAudioToFirebase(recording.getURI(), status.durationMillis);

        // Do something with the recorded sound, e.g., save to state or play it
        console.log("Recording stopped. Duration:", status.durationMillis);
      } catch (error) {
        console.error("Error stopping recording:", error);
      } finally {
        setRecording(null);
      }
    }
  };

  //Upload audio to cloud
  const uploadAudioToFirebase = async (audioFileUri, duration) => {
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
    const fileName = `${uuidv4()}.mp3`;
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
      if (uploadedAudioURL) {
        await sendAudioMessage(friendUniqueID, duration);
      }
    } catch (error) {
      console.error("Error while uploading file:", error);
      setAudioUploading(false);
    } finally {
      // Close and release the blob
      blob.close();
    }

    console.log("audio upload url:", uploadedAudioURL);
  };

  useEffect(() => {
    // Set up an event listener for playback status updates
    if (sound) {
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (
          !status.isLoaded ||
          isNaN(status.durationMillis) ||
          isNaN(status.positionMillis)
        ) {
          // Check if the audio is loaded and positions are valid numbers
          return;
        }
        if (status.didJustFinish) {
          // If the current audio finished playing, unload it
          await sound.unloadAsync();
          setSound(null);
          setIsPlaying(false);
          setSliderValue(0);
        } else {
          const currentTimeInSeconds = status.positionMillis / 1000;
          const remainingDurationInSeconds =
            (status.durationMillis - status.positionMillis) / 1000;

          setCurrentTime(currentTimeInSeconds);
          setRemainingDuration(remainingDurationInSeconds);
          setIsPlaying(status.isPlaying);
          // setSliderValue(status.positionMillis);
          const progress = status.positionMillis / status.durationMillis;
          // Gradually update the slider value based on the audio progress
          setSliderValue(progress);
        }
      });
    }
  }, [sound]);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded && status.isPlaying) {
      setSliderValue(status.positionMillis);
    }
  };

  async function playPauseToggle(audioLink, id, audioDuration) {
    // console.log(audioDuration);
    //Play audio for the first time
    if (sound && currentUri === audioLink) {
      // If sound is already playing, pause or resume it based on the current status
      if (isLoaded) {
        const status = await sound.getStatusAsync();
        if (status.isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
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
        // newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        setSound(newSound);
        setCurrentUri(audioLink);
        setIsLoaded(true);
        setIsPlaying(!isPlaying);
        setAudioId(id);
        setDuration(audioDuration);
      }
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync(
        {
          uri: audioLink,
        },
        { shouldPlay: true, positionMillis: lastPosition }
      );
      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      setSound(newSound);
      setIsLoaded(true);
      setCurrentUri(audioLink);
      setIsPlaying(!isPlaying);
      setAudioId(id);
      setDuration(audioDuration);
    }
  }

  const onSliderValueChange = (value) => {
    setSliderValue(value);
  };

  //format audio time
  const formatAudioDurationTime = (milliseconds) => {
    // Convert milliseconds to seconds
    let totalSeconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return `${minutes}:${seconds}`;
  };

  // Send Audio Message
  // useEffect(() => {
  //   const sendAudioMediaMessage = async () => {
  //     try {
  //       // Check if uploadedAudioURL is not null, audio is not uploading, and messageInput is empty
  //       if (uploadedAudioURL && !audioUploading && !messageInput) {
  //         await sendAudioMessage(friendUniqueID, duration);
  //         setUploadedAudioURL(null);
  //         setAudioUploading(false);
  //       }
  //     } catch (error) {
  //       console.error("Error sending audio message:", error);
  //     }
  //   };

  //   sendAudioMediaMessage();

  //   // Cleanup function to reset uploadedAudioURL
  //   return () => {
  //     setUploadedAudioURL(null);
  //   };
  // }, [uploadedAudioURL, audioUploading, messageInput]);

  //--------Sending the Message Deaprtment👇----------//

  const sendImageMessage = async (senderId) => {
    const loggedUserId = await AsyncStorage.getItem("docID");
    try {
      const messageDocRef = doc(FIREBASE_DB, "chats", combinedChatId);
      setMessageInput("");
      setModalVisible(false);
      if (uploadedMediaURL && messageInput == "") {
        await updateDoc(
          messageDocRef,
          {
            conversation: arrayUnion({
              mediaURL: uploadedMediaURL,
              sendBy: senderId !== loggedUserId ? "user" : "receiver",
              type: "image",
              msgId: uuidv4(),
              time: new Date(),
            }),
          },
          { merge: true }
        );
        setUploadedMediaURL("");
      }
    } catch (error) {
      console.log("error sending image", error);
    }
  };

  const sendAudioMessage = async (senderId, audioDuration) => {
    const loggedUserId = await AsyncStorage.getItem("docID");
    try {
      const messageDocRef = doc(FIREBASE_DB, "chats", combinedChatId);
      setMessageInput("");
      if (uploadedAudioURL && messageInput == "") {
        await updateDoc(
          messageDocRef,
          {
            conversation: arrayUnion({
              mediaURL: uploadedAudioURL,
              sendBy: senderId !== loggedUserId ? "user" : "receiver",
              type: "audio",
              msgId: uuidv4(),
              duration: audioDuration,
              time: new Date(),
            }),
          },
          { merge: true }
        );
        setRecording(null);
      }
    } catch (err) {
      console.log("error sending audio", err);
    }
  };

  const sendTextMessage = async (senderId) => {
    const loggedUserId = await AsyncStorage.getItem("docID");

    try {
      const messageDocRef = doc(FIREBASE_DB, "chats", combinedChatId);
      setMessageInput("");
      setModalVisible(false);
      // Only send a text message if messageInput is not empty
      await updateDoc(
        messageDocRef,
        {
          conversation: arrayUnion({
            msg: messageInput,
            sendBy: senderId !== loggedUserId ? "user" : "receiver",
            type: "text",
            msgId: uuidv4(),
            time: new Date(),
          }),
        },
        { merge: true }
      );
    } catch (error) {
      console.log("error sending msg", error);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <>
      <ImageBackground
        style={styles.imageBackground}
        source={require("../../assets/chatbg4.png")}
      >
        <FlatList
          ref={flatListRef}
          onContentSizeChange={() =>
            flatListRef?.current?.scrollToEnd({ animated: true })
          }
          style={{
            display: "flex",
          }}
          showsVerticalScrollIndicator={false}
          data={recievedMessages}
          renderItem={({ item }) => {
            const isOnlyEmojis = /^[\uD83C-\uDBFF\uDC00-\uDFFF❤️]+$/g.test(
              item.msg
            );
            return (
              <View
                style={{
                  display: "flex",
                  width: "auto",
                }}
              >
                <TouchableWithoutFeedback
                  onLongPress={() => showAlert(item.msgId)}
                >
                  <View
                    style={{
                      alignSelf:
                        item?.sendBy === "user" ? "flex-end" : "flex-start",
                      margin: 5,
                      marginHorizontal: 10,
                      borderTopLeftRadius: item?.sendBy === "user" ? 12 : 0,
                      borderTopRightRadius: item?.sendBy === "user" ? 0 : 12,
                      borderBottomLeftRadius: item?.sendBy === "user" ? 6 : 12,
                      borderBottomRightRadius: item?.sendBy === "user" ? 12 : 6,
                      backgroundColor:
                        item?.sendBy === "user" ? "#5843d1" : "#fff",
                      padding: item.type === "image" ? 5 : 10,
                      maxWidth: "80%",
                    }}
                  >
                    <View>
                      {item.type === "audio" && (
                        <View
                          style={{
                            width: 200,
                            height: responsiveHeight(7),
                            padding: 10,
                            flexDirection: "row",
                            position: "relative",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() =>
                              playPauseToggle(
                                item?.mediaURL,
                                item?.msgId,
                                item?.duration
                              )
                            }
                          >
                            <MaterialCommunityIcons
                              name={
                                sound &&
                                sound !== null &&
                                item?.msgId === audioId &&
                                isPlaying
                                  ? `pause`
                                  : "play"
                              }
                              size={40}
                              color="#fff"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            activeOpacity={1}
                            style={styles.verticalContent}
                          >
                            <Slider
                              value={item?.msgId === audioId ? sliderValue : 0}
                              onValueChange={onSliderValueChange}
                              minimumValue={0}
                              maximumValue={1}
                              minimumTrackTintColor="#fff"
                              maximumTrackTintColor="#6f7070"
                              step={1}
                              thumbStyle={{
                                height: 14,
                                width: 14,
                                borderRadius: 50,
                                backgroundColor: "#42f58a",
                              }}
                              style={{ borderColor: "#fff" }}
                            />
                          </TouchableOpacity>

                          {/* {sound &&
                            sound !== null &&
                            item?.msgId === audioId &&
                            isPlaying && (
                              <Text
                                style={{
                                  marginTop: -10,
                                  fontSize: 12,
                                  color: "#fff",
                                }}
                              >
                                {formatAudioCurrentTime(currentTime)}
                              </Text>
                            )} */}

                          <Text
                            style={{
                              marginTop: -10,
                              fontSize: 12,
                              color: "#fff",
                            }}
                          >
                            {formatAudioDurationTime(item?.duration)}
                          </Text>
                          <Text
                            style={{
                              position: "absolute",
                              color: "#fff",
                              bottom: -8,
                              right: 4,
                              fontSize: 11,
                            }}
                          >
                            {formatTime(item?.time)}
                          </Text>
                        </View>
                      )}
                      {item.type === "image" && (
                        <TouchableWithoutFeedback
                          onLongPress={() => showAlert(item.msgId)}
                        >
                          <View>
                            <Image
                              source={{ uri: item?.mediaURL }}
                              style={{
                                width: 250,
                                height: 250,
                                position: "relative",
                              }}
                            />
                            <Text
                              style={{
                                position: "absolute",
                                color: "#fff",
                                bottom: 3,
                                left: 6,
                                fontSize: 11,
                              }}
                            >
                              {formatTime(item?.time)}
                            </Text>
                          </View>
                        </TouchableWithoutFeedback>
                      )}
                      {item.type === "text" && (
                        <Text
                          style={{
                            fontSize: isOnlyEmojis ? 40 : 16,
                            color: item?.sendBy === "user" ? "white" : "black",
                          }}
                        >
                          {item?.msg}
                          {"  "}
                          <Text
                            style={{
                              color: "#e2e1e6",
                              fontSize: 11,
                            }}
                          >
                            {formatTime(item?.time)}
                          </Text>
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            );
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: 8,
            backgroundColor: "",
          }}
        >
          <TextInput
            ref={inputRef}
            style={{
              height: responsiveHeight(6),
              marginBottom: 15,
              flex: 1,
              alignSelf: "center",
              position: "relative",
              borderRadius: 26,
              paddingHorizontal: 14,
              backgroundColor: "#fff",
              paddingVertical: 10,
              paddingLeft: 42,
            }}
            value={messageInput}
            onChangeText={(text) => setMessageInput(text)}
            placeholder={`${
              messageInput === "" ? "Type your message" : messageInput
            }`}
            multiline={true}
            numberOfLines={3}
          />
          {showEmojiPicker && (
            <EmojiPicker
              open={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
              onEmojiSelected={handleOnEmojiSelected}
              selectedEmojis={currentlySelectedEmojis}
              enableSearchBar
            />
          )}

          <FontAwesome5
            onPress={toggleEmojiPicker}
            name="smile-wink"
            size={28}
            color={"#5b41f0"}
            style={{
              position: "absolute",
              alignSelf: "center",
              bottom: 25,
              left: 8,
            }}
          />
          <TouchableWithoutFeedback onPress={openGallery}>
            {mediaUploading ? (
              <ActivityIndicator
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: responsiveHeight(3.2),
                  right: responsiveWidth(25),
                }}
                color={"#5843d1"}
                size={"large"}
              />
            ) : (
              <MaterialCommunityIcons
                name="image-multiple-outline"
                size={27}
                color={"#5b41f0"}
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: responsiveHeight(3.2),
                  right: responsiveWidth(25),
                }}
              />
            )}
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={openCamera}>
            {mediaUploading ? (
              <ActivityIndicator
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: responsiveHeight(3.2),
                  right: responsiveWidth(16),
                }}
                color={"#5843d1"}
                size={"large"}
              />
            ) : (
              <MaterialCommunityIcons
                name="camera-outline"
                size={29}
                color={"#5b41f0"}
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: responsiveHeight(3.2),
                  right: responsiveWidth(16),
                }}
              />
            )}
          </TouchableWithoutFeedback>

          {messageInput == "" ? (
            <TouchableOpacity
              onPress={recording ? stopRecording : startRecording}
            >
              <Ionicons
                name="mic-circle-sharp"
                color={"#5b41f0"}
                size={49}
                style={{ marginBottom: 16 }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => sendTextMessage(friendUniqueID)}
            >
              <MaterialCommunityIcons
                name="send-circle"
                color={"#5b41f0"}
                size={49}
                style={{ marginBottom: 16 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    maxWidth: 100,
    backgroundColor: "white",
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  contentView: {
    width: "87%",
    // padding: 20,
    // flex: 1,
    // flexDirection: "row",
    // height: 500,
    // justifyContent: "center",
    alignItems: "stretch",
  },

  verticalContent: {
    flex: 1,
    // flexDirection: "row",
    width: "87%",
    // justifyContent: "center",
    alignItems: "stretch",
  },
  imageBackground: {
    flex: 1,
    resizeMode: "cover", // or 'stretch' or 'contain'
    justifyContent: "center",
  },
  largeProfilePic: {
    width: "96%",
    height: "50%",
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 18,
    color: "blue",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    display: "flex",
    backgroundColor: "#fff",
  },

  root: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#F3F8FF",
    elevation: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  // description: {
  //   borderWidth: 1,
  //   alignSelf: "center",
  //   paddingHorizontal: 14,
  //   marginVertical: 12,
  //   width: "90%",
  //   borderRadius: 45,
  // },
  closeChatInfo: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e8e8e8",
    padding: 20,
    borderLeftWidth: 1,
    marginBottom: 12,
    marginTop: 12,
    borderRightWidth: 1,
    borderRadius: 50,
    backgroundColor: "#273990",
  },

  button: {
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  space: {
    marginBottom: 20,
  },

  space2: {
    marginBottom: 150,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fill: {
    flex: 1,
    margin: 16,
  },
  button: {
    margin: 16,
  },
});
export default ChatScreen;
