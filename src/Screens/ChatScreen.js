import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Avatar } from "react-native-elements";
import { responsiveHeight } from "react-native-responsive-dimensions";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
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

const messages = ["hi", "didb", "dwehb"];

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
  const [chatId, setChatId] = useState("");
  const [recievedMessages, setRecievedMessages] = useState([{}]);
  const [chatDocId, setChatDocId] = useState("");

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

  const handleOnEmojiSelected = (emoji) => {
    setCurrentlySelectedEmojis((prev) => [...prev, emoji.emoji]);
    setMessageInput((prevText) => prevText + emoji.emoji);
    console.log("Prev Text:", messageInput);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  // useEffect(() => {
  //   const getMessagesChatId = async () => {
  //     const userId = await AsyncStorage.getItem("PHONE");
  //     const userDocId = await AsyncStorage.getItem("docID");
  //     const messagesCollection = collection(FIREBASE_DB, "messages");

  //     try {
  //       const q = query(messagesCollection, where("userId", "==", userDocId));
  //       const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //         if (!querySnapshot?.empty) {
  //           querySnapshot?.forEach((doc) => {
  //             const data = doc?.data();
  //             setChatId(doc?.id);
  //           });
  //         }
  //       });

  //       return () => unsubscribe;
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   getMessagesChatId();
  // }, []);

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
  // console.log("recieved", recievedMessages);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    const hours = date?.getHours()?.toString()?.padStart(2, "0");
    const minutes = date?.getMinutes()?.toString()?.padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const sendMessage = async (senderId) => {
    const loggedUserId = await AsyncStorage.getItem("docID");
    console.log(senderId);
    try {
      const messageDocRef = doc(FIREBASE_DB, "chats", combinedChatId);
      setMessageInput("");
      await updateDoc(
        messageDocRef,
        {
          conversation: arrayUnion({
            msg: messageInput,
            sendBy: senderId === loggedUserId ? "user" : "receiver",
            time: new Date(),
          }),
        },
        { merge: true }
      );

      console.log("msg sent success");
    } catch (error) {
      console.log("error sending msg", error);
    }
  };

  return (
    <>
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
        renderItem={({ item }) => (
          <View
            style={{
              display: "flex",
              width: "auto",
            }}
          >
            <View
              style={{
                alignSelf: item?.sendBy === "user" ? "flex-end" : "flex-start",
                margin: 5,
                marginHorizontal: 10,
                borderTopLeftRadius: item?.sendBy === "user" ? 12 : 0,
                borderTopRightRadius: item?.sendBy === "user" ? 0 : 12,
                borderBottomLeftRadius: item?.sendBy === "user" ? 6 : 12,
                borderBottomRightRadius: item?.sendBy === "user" ? 12 : 6,
                backgroundColor: item?.sendBy === "user" ? "#5843d1" : "#fff",
                padding: 10,
                maxWidth: "80%",
              }}
            >
              <Text
                style={{
                  color: item?.sendBy === "user" ? "white" : "black",
                }}
              >
                {item?.msg}
                {"  "} {/* Add extra space between message and timestamp */}
                <Text
                  style={{
                    color: "#e2e1e6",
                    fontSize: 11,
                  }}
                >
                  {formatTime(item?.time)}
                </Text>
              </Text>
            </View>
          </View>
        )}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginHorizontal: 8,
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

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => sendMessage(friendUniqueID)}
        >
          <MaterialCommunityIcons
            name="send-circle"
            color={"#5b41f0"}
            size={49}
            style={{ marginBottom: 16 }}
          />
        </TouchableOpacity>
      </View>
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
});
export default ChatScreen;
