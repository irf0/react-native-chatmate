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
  Animated,
  Easing,
} from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Avatar, Button, Icon, Slider } from "react-native-elements";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Fontisto from "react-native-vector-icons/Fontisto";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome5";
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
import { Audio } from "expo-av";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";

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
  const [recordBtnSwipe, setRecordBtnSwipe] = useState(false);
  const [recordingCounter, setRecordingCounter] = useState(0);
  const [isStillRecording, setIsStillRecording] = useState(false);
  const [conversationData, setConversationData] = useState([]);
  const [key, setKey] = useState(0);

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
          conversationArray.map((conv) => setConversationData(conv));
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
  }, [combinedChatId]);

  // console.log(conversationData);

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
  const showAlert = (sendBy, messageId) => {
    if (sendBy == "user") {
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
    } else {
      Alert.alert("You cannot delete this message!");
    }
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
        setRecording(null);
        setIsStillRecording(true);
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

  const stopRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setIsStillRecording(false);
        const { sound: newSound, status } =
          await recording.createNewLoadedSoundAsync();
        setSound(newSound);
        await uploadAudioToFirebase(recording.getURI(), status.durationMillis);
        // Do something with the recorded sound, e.g., save to state or play it
        console.log("Recording stopped. Duration:", status.durationMillis);
        setDuration(status.durationMillis);
        setRecordingCounter(0);
      } catch (error) {
        console.error("Error stopping recording:", error);
      } finally {
        setRecordingCounter(0);
        setIsStillRecording(false);
      }
    }
  };

  //Pulse Animation
  const heartbeat = new Animated.Value(1);
  useEffect(() => {
    // Triggering slower heartbeat animation
    const pulse = () => {
      Animated.timing(heartbeat, {
        toValue: 1.2,
        duration: 800,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(heartbeat, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
    };

    // Call the pulse function whenever the recordingCounter changes
    pulse();

    // Clean up when component unmounts
    return () => {
      // Clean up any resources if needed
    };
  }, [recordingCounter]);

  const uploadAudioToFirebase = async (audioFileUri, duration) => {
    try {
      setAudioUploading(true);
      const response = await fetch(audioFileUri);
      let blob = await response.blob();

      const storage = getStorage();
      const fileName = `${uuidv4()}.mp3`;
      const storageRef = ref(storage, `chats/audio/${fileName}`);

      const metadata = {
        contentType: "audio/mpeg", // Adjust content type based on the actual format
      };

      await uploadBytes(storageRef, blob, metadata);

      // Get the download URL
      const url = await getDownloadURL(storageRef);
      console.log("Uploaded audio URL:", url);
      // Set state values and then send the message
      setUploadedAudioURL(url);
      setAudioUploading(false);
      if (!audioUploading) {
        await sendAudioMessage(friendUniqueID, duration);
        // setIsStillRecording(false);
        setRecording(null);
      }
    } catch (error) {
      console.error("Error while uploading file:", error);
      setAudioUploading(false);
    }
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
  // }, [uploadedAudioURL, audioUploading]);

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
              sendBy: senderId === loggedUserId ? "user" : "receiver",
              type: "image",
              msgId: uuidv4(),
              time: new Date(),
              isSeen: false,
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
    console.log("from sendaudiomsg", audioDuration);
    const loggedUserId = await AsyncStorage.getItem("docID");
    try {
      const messageDocRef = doc(FIREBASE_DB, "chats", combinedChatId);
      setMessageInput("");
      if (uploadedAudioURL && !audioUploading && messageInput == "") {
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
              isSeen: false,
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
            sendBy: senderId === loggedUserId ? "user" : "receiver",
            type: "text",
            msgId: uuidv4(),
            time: new Date(),
            isSeen: false,
          }),
        },
        { merge: true }
      );
    } catch (error) {
      console.log("error sending msg", error);
    }
  };

  //Mark as Seen
  useEffect(() => {
    if (conversationData.sendBy !== "user" && !conversationData?.isSeen) {
      const markMessageSeen = async () => {
        try {
          const messageDocRef = doc(FIREBASE_DB, "chats", combinedChatId);

          // Fetching the doc data
          const currentDoc = await getDoc(messageDocRef);
          const currentData = currentDoc.data();

          // Updating the "isSeen" status of the message
          const updatedConversation = currentData.conversation.map(
            (message) => {
              if (message.msgId === conversationData.msgId) {
                return { ...message, isSeen: true };
              }
              return message;
            }
          );

          await updateDoc(messageDocRef, { conversation: updatedConversation });

          // console.log("Message marked as read successfully");
        } catch (error) {
          console.error("Error marking message as read", error);
        }
      };
      markMessageSeen();
    }

    // Check if the last message is from another user and mark it as seen
  }, [conversationData, combinedChatId]);

  //Recording stop-watch
  useEffect(() => {
    let intervalId;

    if (recording) {
      intervalId = setInterval(() => {
        setRecordingCounter((prevCounter) => prevCounter + 1);
      }, 1000);
    }

    // Cleanup the interval when the component unmounts or recording stops
    return () => clearInterval(intervalId);
  }, [recording]);

  return (
    <>
      <ImageBackground
        style={styles.imageBackground}
        source={require("../../assets/chat-bg.png")}
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
                  onLongPress={() => showAlert(item?.sendBy, item?.msgId)}
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
                          key={key}
                          style={{
                            width: 200,
                            height: responsiveHeight(7),
                            padding: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
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
                            <FontAwesome
                              name={
                                sound &&
                                sound !== null &&
                                item?.msgId === audioId &&
                                isPlaying
                                  ? `pause`
                                  : "play"
                              }
                              size={25}
                              style={{ alignSelf: "center" }}
                              color={
                                item?.sendBy === "user" ? "#fff" : "#535454"
                              }
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
                              minimumTrackTintColor={
                                item?.sendBy === "user" ? "#fff" : "#6f7070"
                              }
                              maximumTrackTintColor={
                                item?.sendBy === "user" ? "#6f7070" : "#6f7070"
                              }
                              step={0.01}
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
                              marginTop: 6,
                              textAlignVertical: "center",
                              fontSize: 12,
                              marginLeft: 6,
                              color: item?.sendBy === "user" ? "#fff" : "#000",
                            }}
                          >
                            {formatAudioDurationTime(item?.duration)}
                          </Text>
                          <Text
                            style={{
                              position: "absolute",
                              color: item?.sendBy === "user" ? "#fff" : "#000",
                              bottom: -8,
                              right: 4,
                              fontSize: 10,
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
                        </Text>
                      )}

                      <Text
                        style={{
                          color:
                            item?.sendBy === "user" ? "#e2e1e6" : "#666669",
                          fontSize: 11,
                          textAlign: item?.sendBy === "user" ? "right" : "left",
                        }}
                      >
                        {formatTime(item?.time)}
                      </Text>
                      {item?.sendBy === "user" && item.isSeen && (
                        <Ionicons
                          style={{ textAlign: "right" }}
                          name="checkmark-done-sharp"
                          color="#6cf577"
                          size={16}
                        />
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
          {isStillRecording ? (
            <View
              ref={inputRef}
              style={{
                height: responsiveHeight(6),
                width: "80%",
                marginBottom: 18,
                flex: 1,
                alignSelf: "center",
                bottom: 1,
                borderRadius: 7,
                paddingHorizontal: 14,
                backgroundColor: "#5b41f0",
                paddingVertical: 8,
                paddingLeft: 42,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", gap: 14 }}>
                <Animated.View style={{ transform: [{ scale: heartbeat }] }}>
                  <Fontisto name="record" size={26} color={"red"} />
                </Animated.View>

                {!audioUploading && (
                  <Text
                    style={{ color: "#fff", fontSize: 18, marginBottom: 3 }}
                  >
                    {recordingCounter}
                  </Text>
                )}
              </View>

              <TouchableOpacity activeOpacity={0.8} onPress={stopRecording}>
                <MaterialCommunityIcons
                  name={"send"}
                  // color={"#5b41f0"}
                  color={"#fff"}
                  size={26}
                  style={{
                    position: "absolute",
                    bottom: -14,
                    right: 3,
                    alignSelf: "center",
                  }}
                />
              </TouchableOpacity>
            </View>
          ) : (
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
          )}
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
            name="smile"
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
                name={!isStillRecording ? "image-multiple" : ""}
                size={26}
                color={"#5b41f0"}
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: responsiveHeight(3.2),
                  right: responsiveWidth(32),
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
                  right: responsiveWidth(24),
                }}
                color={"#5843d1"}
                size={"large"}
              />
            ) : (
              <MaterialCommunityIcons
                name={!isStillRecording ? "camera" : ""}
                size={28}
                color={"#5b41f0"}
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: responsiveHeight(3.2),
                  right: responsiveWidth(24),
                }}
              />
            )}
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={startRecording}>
            {audioUploading ? (
              <ActivityIndicator
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: responsiveHeight(3.2),
                  right: responsiveWidth(15),
                }}
                color={"#5b41f0"}
                size={"large"}
              />
            ) : (
              <MaterialCommunityIcons
                name={!isStillRecording ? "microphone" : ""}
                size={30}
                color={"#5b41f0"}
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: responsiveHeight(3.2),
                  right: responsiveWidth(15),
                }}
              />
            )}
          </TouchableWithoutFeedback>

          {!isStillRecording && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => sendTextMessage(friendUniqueID)}
            >
              <MaterialCommunityIcons
                name={"send-circle"}
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
