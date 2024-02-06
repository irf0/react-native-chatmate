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
import { FIREBASE_DB } from "../../Firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { responsiveHeight } from "react-native-responsive-dimensions";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const AllChats = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [queryResultData, setQueryResultData] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showNothingImage, setShowNothingImage] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [addedStatus, setAddedStatus] = useState(false);
  const [friendChatData, setFriendChatData] = useState([]);
  const [currentlyLoggedUserID, setCurrentlyLoggedUserID] = useState("");

  // useEffect(() => {
  //   const getAllFriends = async () => {
  //     try {
  //       setIsLoading(true);
  //       const loggedUserID = await AsyncStorage.getItem("docID");
  //       const friendsRef = collection(FIREBASE_DB, "users");
  //       const q = query(friendsRef, where("uniqueID", "==", loggedUserID));
  //       const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //         const queryData = querySnapshot?.docs?.map(
  //           (doc) => doc?.data().friendsList
  //         );
  //         if (queryData.length < 1) {
  //           setShowNothingImage(true);
  //         }
  //         const flattenedArray = [];
  //         queryData.forEach((subArray) => {
  //           subArray.forEach((item) => {
  //             flattenedArray.push(item);
  //           });
  //         });
  //         setQueryResultData(flattenedArray);
  //         // console.log("contacts list result", queryData);
  //         setIsLoading(false);
  //       });
  //       return () => unsubscribe();
  //     } catch (error) {
  //       console.log(error);
  //       Alert.alert("An error occuring during search. Please try again");
  //     }
  //   };

  //   getAllFriends();
  // }, []);

  // useEffect(() => {
  //   const getMessagesAddedStatus = async () => {
  //     const userId = await AsyncStorage.getItem("docID");
  //     const messagesCollection = collection(FIREBASE_DB, "chats");
  //     try {
  //       const q = query(
  //         messagesCollection,
  //         where("loggedUserUniqueId", "==", userId)
  //       );
  //       onSnapshot(q, (quer) => {
  //         const queriesData = quer?.docs?.map((doc) => doc?.data());
  //         const isChatClose = queriesData?.map((qr) => qr?.addedToContact);
  //         setQueryResultData(queriesData);
  //         setAddedStatus(isChatClose);
  //       });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   getMessagesAddedStatus();
  // }, []);

  //Get all the chats
  useEffect(() => {
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

        await getDocs(q).then((querySnapshot) => {
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
    combinedChatId
  ) => {
    try {
      navigation.navigate("ChatScreen", {
        friendName: friendName,
        friendPhone: friendPhone,
        friendProfilePic: friendProfilePic,
        friendUniqueID: friendUniqueID,
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
            Contacts Loading...
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
            {qr?.conversation.length > 0 && (
              <TouchableOpacity
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
                      ? qr?.user1UniqueID
                      : qr?.user1UniqueID,
                    qr?.chatId,
                    qr?.combinedChatId
                  )
                }
              >
                <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
                  <TouchableOpacity onPress={toggleModal}>
                    <Image
                      source={{
                        uri:
                          qr.user1UniqueID === currentlyLoggedUserID
                            ? qr?.user2ProfilePic
                            : qr?.user1ProfilePic,
                      }}
                      style={{ height: 50, width: 50, borderRadius: 36 }}
                    />
                  </TouchableOpacity>
                  <View>
                    <Text>
                      {qr.user1UniqueID === currentlyLoggedUserID
                        ? qr?.user2Name
                        : qr?.user1Name}
                    </Text>
                    <Text>
                      {qr.user1UniqueID === currentlyLoggedUserID
                        ? qr?.user2Phone
                        : qr?.user1Phone}
                    </Text>
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
              </TouchableOpacity>
            )}
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
          {!isLoading && showNothingImage && (
            <View
              style={{
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              <Image
                source={require("../../assets/nothingtodo.png")}
                resizeMode="contain"
                style={{
                  height: 400,
                  width: 350,
                  alignSelf: "center",
                  borderRadius: 6,
                  marginTop: 25,
                }}
              />
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
                Not Found Any Match!
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
