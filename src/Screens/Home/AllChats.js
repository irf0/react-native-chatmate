import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  Timestamp,
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
import { FIREBASE_DB } from "../../../Firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
const AllChats = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [queryResultData, setQueryResultData] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentlyLoggedUserID, setCurrentlyLoggedUserID] = useState("");
  const [lastMessage, setLastMessage] = useState("");

  //Get all the chats
  useEffect(() => {
    setIsLoading(true);
    const getUserMessages = async () => {
      const loggedUserId = await AsyncStorage.getItem("docID");
      const conversationRef = collection(FIREBASE_DB, "chats");

      try {
        const q = query(
          conversationRef,
          // where("user1UniqueID", "==", loggedUserId)
          // where("user2UniqueId", "==", loggedUserId)
          where("participant", "array-contains", loggedUserId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const conversation = doc.data().conversation;
            if (conversation && conversation.length > 0) {
              const lastMessageInDoc = conversation[conversation.length - 1];
              // if (
              //   lastMessageInDoc.sendBy !== "user" &&
              //   lastMessageInDoc?.isSeen
              // ) {
              setLastMessage(lastMessageInDoc);
              // }
            }
            return () => unsubscribe();
          });

          const queryData = querySnapshot?.docs?.map((doc) => doc?.data());
          setQueryResultData(queryData);
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    getUserMessages();
  }, []);

  // console.log("last msg from allchats", lastMessage);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem("docID");
      console.log("From AllChats", id);
      setCurrentlyLoggedUserID(id);
    };
    getUserId();
  }, []);

  const handleNavigateToChatscreen = async (
    friendName,
    friendPhone,
    friendProfilePic,
    friendUniqueID,
    friendTyping,
    combinedChatId
  ) => {
    try {
      navigation.navigate("ChatScreen", {
        friendName: friendName,
        friendPhone: friendPhone,
        friendProfilePic: friendProfilePic,
        friendUniqueID: friendUniqueID,
        friendTyping: friendTyping,
        combinedChatId: combinedChatId,
      });
    } catch (error) {
      console.log("error creating chat", error);
    }
  };

  return (
    <View>
      {isLoading && (
        <View
          style={{
            alignSelf: "center",
            marginVertical: responsiveHeight(35),
            position: "absolute",
            zIndex: 50,
          }}
        >
          <ActivityIndicator color={"#5b41f0"} size={45} />
          <Text style={{ fontWeight: "bold", color: "#5b41f0" }}>
            Chats Loading...
          </Text>
        </View>
      )}
      {queryResultData?.length > 0 ? (
        queryResultData.map((qr) => (
          <ScrollView
            contentContainerStyle={{
              margin: 14,
              marginVertical: 5,
              flexDirection: "row",
              padding: 20,
              borderRadius: 12,
              gap: 10,
              alignItems: "center",
              backgroundColor: "#fff",
              justifyContent: "space-between",
            }}
            key={qr?.friendUniqueID}
          >
            <TouchableOpacity
              style={{ flexDirection: "row" }}
              onPress={() =>
                handleNavigateToChatscreen(
                  qr?.user1UniqueID === currentlyLoggedUserID
                    ? qr?.user2Name
                    : qr?.user1Name,

                  qr?.user1UniqueID === currentlyLoggedUserID
                    ? qr?.user2Phone
                    : qr?.user1Phone,

                  qr?.user1UniqueID === currentlyLoggedUserID
                    ? qr?.user2ProfilePic
                    : qr?.user1ProfilePic,

                  qr?.user1UniqueID === currentlyLoggedUserID
                    ? qr?.user2UniqueID
                    : qr?.user1UniqueID,
                  qr?.user1UniqueID === currentlyLoggedUserID
                    ? qr?.user2isTyping
                    : qr?.user1isTyping,
                  qr?.chatId,
                  qr?.combinedChatId
                )
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginTop: 5,
                }}
              >
                <TouchableOpacity onPress={toggleModal}>
                  <Image
                    source={{
                      uri:
                        // qr.user1UniqueID === currentlyLoggedUserID
                        //   ? qr?.user2ProfilePic
                        qr?.user1ProfilePic,
                    }}
                    style={{ height: 50, width: 50, borderRadius: 36 }}
                  />
                </TouchableOpacity>
                <View>
                  <Text style={{ fontSize: 18 }}>
                    {/* {qr.user1UniqueID === currentlyLoggedUserID
                      ? qr?.user2Name */}
                    {qr?.user1Name}
                  </Text>

                  {lastMessage?.type === "text" && (
                    <Text>
                      {lastMessage.msg
                        ? lastMessage.msg.length > 4
                          ? (lastMessage?.sendBy === "user"
                              ? "You"
                              : qr?.user1Name.split(" ")[0]) +
                            " : " +
                            `${lastMessage.msg.substring(0, 15)}...`
                          : (lastMessage?.sendBy === "user"
                              ? "You"
                              : qr?.user1Name.split(" ")[0]) +
                            " : " +
                            lastMessage.msg
                        : null}
                    </Text>
                  )}
                  {lastMessage?.type == "image" && (
                    <View style={{ flexDirection: "row", gap: 3 }}>
                      <MaterialCommunityIcon
                        name="message-image-outline"
                        size={26}
                        color={"#666669"}
                      />
                      <Text>Photo</Text>
                    </View>
                  )}
                  {lastMessage?.type == "audio" && (
                    <View style={{ flexDirection: "row", gap: 3 }}>
                      <MaterialCommunityIcon
                        name="microphone-outline"
                        size={26}
                        color={"#666669"}
                      />
                      <Text>Voice</Text>
                    </View>
                  )}
                </View>

                {/* To view image in large */}

                <Modal
                  animationType="slide"
                  transparent={false}
                  visible={isModalVisible}
                  onRequestClose={toggleModal}
                >
                  <View style={styles.modalContainer}>
                    <Image
                      source={{
                        uri:
                          qr?.user1UniqueID === currentlyLoggedUserID
                            ? qr?.user2ProfilePic
                            : qr?.user1ProfilePic,
                      }}
                      style={styles.largeProfilePic}
                    />

                    <TouchableOpacity
                      onPress={toggleModal}
                      style={styles.closeButton}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </Modal>
              </View>
              {lastMessage &&
                lastMessage?.sendBy !== "user" &&
                !lastMessage?.isSeen && (
                  <View
                    style={{
                      padding: 10,
                      borderRadius: 50,
                      height: 35,
                      width: 35,
                      backgroundColor: "#5b41f0",
                      alignSelf: "flex-start",
                      position: "absolute",
                      right: responsiveWidth(-30),
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        textAlignVertical: "top",
                        color: "#fff",
                      }}
                    >
                      1
                    </Text>
                  </View>
                )}
            </TouchableOpacity>
            {/* <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#5b41f0",
                  padding: 7,
                  borderRadius: 3,
                }}
                onPress={() =>
                  handleSelectFriend(
                    qr?.friendName,
                    qr?.friendPhone,
                    qr?.friendProfile,
                    qr?.friendUniqueID
                  )
                }
              >
                <Text style={{ color: "#5b41f0" }}>Start Chat</Text>
              </TouchableOpacity> */}
          </ScrollView>
        ))
      ) : (
        <>
          {!isLoading && (
            <View
              style={{
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 19,
                  color: "red",
                  position: "absolute",
                  top: responsiveHeight(10),
                  alignSelf: "center",
                }}
              >
                Not contacts at the moment!
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  smallProfilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
export default AllChats;
