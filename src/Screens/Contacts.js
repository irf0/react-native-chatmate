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
import { useNavigation, useRoute } from "@react-navigation/native";
import { responsiveHeight } from "react-native-responsive-dimensions";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const Contacts = () => {
  const navigation = useNavigation();
  const router = useRoute();
  // const { uniqueIdFromSearch } = router.params;
  const [isLoading, setIsLoading] = useState(false);
  const [queryResultData, setQueryResultData] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showNothingImage, setShowNothingImage] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [addedStatus, setAddedStatus] = useState(false);

  useEffect(() => {
    const getAllFriends = async () => {
      try {
        setIsLoading(true);
        const loggedUserID = await AsyncStorage.getItem("docID");
        const friendsRef = collection(FIREBASE_DB, "users");
        const q = query(friendsRef, where("uniqueID", "==", loggedUserID));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const queryData = querySnapshot?.docs?.map(
            (doc) => doc?.data().friendsList
          );
          if (queryData.length < 1) {
            setShowNothingImage(true);
          }
          const flattenedArray = [];
          queryData.forEach((subArray) => {
            subArray.forEach((item) => {
              flattenedArray.push(item);
            });
          });
          setQueryResultData(flattenedArray);
          // console.log("contacts list result", queryData);
          setIsLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.log(error);
        Alert.alert("An error occuring during search. Please try again");
      }
    };

    getAllFriends();
  }, []);

  useEffect(() => {
    const getMessagesCloseStatus = async () => {
      const userId = await AsyncStorage.getItem("docID");
      const messagesCollection = collection(FIREBASE_DB, "chats");
      try {
        const q = query(
          messagesCollection,
          where("loggedUserUniqueId", "==", userId),
          where()
        );

        getDocs(q).then((quer) => {
          const queriesData = quer?.docs?.map((doc) => doc?.data());
          const isChatClose = queriesData?.map((qr) => qr?.addedToContact);
          setAddedStatus(isChatClose);
        });
      } catch (error) {
        console.log(error);
      }
    };
    getMessagesCloseStatus();
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleSelectFriend = async (
    friendName,
    friendPhone,
    friendProfilePic,
    friendUniqueID
  ) => {
    const loggedUserID = await AsyncStorage.getItem("docID");
    const loggedUserName = await AsyncStorage.getItem("NAME");
    const loggedUserPhone = await AsyncStorage.getItem("PHONE");
    const loggedUserPic = await AsyncStorage.getItem("PROFILEPIC");

    const combinedChatId = `${loggedUserID}_${friendUniqueID}`;
    try {
      setIsClicked(true);
      const res = await getDoc(doc(FIREBASE_DB, "chats", combinedChatId));
      if (res.exists()) {
        navigation.navigate("ChatScreen", {
          friendName: friendName,
          friendPhone: friendPhone,
          friendProfilePic: friendProfilePic,
          friendUniqueID: uuidv4(),
          combinedChatId: combinedChatId,
        });
      } else {
        // Create a new chatroom if it doesn't exist
        await setDoc(doc(FIREBASE_DB, "chats", combinedChatId), {
          conversation: [],
          user1UniqueID: friendUniqueID,
          user1Name: friendName,
          user1Phone: friendPhone,
          user1ProfilePic: friendProfilePic,
          user2UniqueId: loggedUserID,
          user2Name: loggedUserName,
          user2Phone: loggedUserPhone,
          user2ProfilePic: loggedUserPic,
          lastMessage: "",
          addedToContact: true,
          chatId: combinedChatId,
          participant: [loggedUserID, friendUniqueID],
        });

        navigation.navigate("ChatScreen", {
          friendName: friendName,
          friendPhone: friendPhone,
          friendProfilePic: friendProfilePic,
          friendUniqueID: uuidv4(),
          combinedChatId: combinedChatId,
        });
      }

      setIsClicked(false);
    } catch (error) {
      console.error("Error handling selected friend:", error);
      setIsClicked(false);
    }
  };

  //Delete a contact

  const deleteMessage = async (contactId) => {
    const loggedUserID = await AsyncStorage.getItem("docID");
    try {
      const contactDocRef = doc(FIREBASE_DB, "users", loggedUserID);

      // Fetch the current document data
      const currentDoc = await getDoc(contactDocRef);
      const currentData = currentDoc?.data();
      console.log(currentData);

      const updatedFriendsList = currentData.friendsList.filter(
        (contact) => contact.friendUniqueID !== contactId
      );

      await updateDoc(contactDocRef, { friendsList: updatedFriendsList });

      console.log("Contact deleted successfully");
    } catch (error) {
      console.error("Error deleting contact", error);
    }
  };

  const showAlert = (contactId) => {
    Alert.alert(
      "Are you sure?",
      "You want to delete this contact?",

      [
        {
          text: "Don't delete",
          style: "cancel",
        },
        {
          text: "Yes, Delete",
          style: "destructive",

          onPress: () => {
            deleteMessage(contactId);
          },
        },
      ],
      { cancelable: true }
    );
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
            <TouchableOpacity
              onLongPress={() => showAlert(qr?.friendUniqueID)}
              onPress={() =>
                handleSelectFriend(
                  qr?.friendName,
                  qr?.friendPhone,
                  qr?.friendProfile,
                  qr?.friendUniqueID
                )
              }
            >
              <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
                <TouchableOpacity onPress={toggleModal}>
                  <Image
                    source={{ uri: qr?.friendProfile }}
                    style={{ height: 50, width: 50, borderRadius: 36 }}
                  />
                </TouchableOpacity>
                <View>
                  <Text>{qr?.friendName}</Text>
                  <Text>{qr?.friendPhone}</Text>
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
                      source={{ uri: qr?.friendProfile }}
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

            <Modal
              animationType="slide"
              transparent={true}
              visible={isClicked}
              onRequestClose={() => setIsClicked(!isClicked)}
              style={{ height: 200, width: 200, alignSelf: "center" }}
            >
              <View style={styles.modalContainer2}>
                <ActivityIndicator color={"#5b41f0"} size={"large"} />
                <Text style={{ color: "#5b41f0", marginTop: 10 }}>
                  Loading...{" "}
                </Text>
              </View>
            </Modal>
          </ScrollView>
        ))
      ) : (
        <>
          {!isLoading && (
            <View
              style={{
                justifyContent: "center",
                alignSelf: "center",
                marginTop: responsiveHeight(30),
              }}
            >
              <Text style={{ textAlign: "center", fontSize: 22 }}>
                No Contacts to Show...{" "}
              </Text>
              {/* <Image
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
              </Text> */}
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
  modalContainer2: {
    height: 100,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    // backgroundColor: "#5b41f0",
    backgroundColor: "transparent",
    zIndex: 50,
    marginTop: responsiveHeight(40),
    borderRadius: 16,
    position: "absolute",
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
export default Contacts;
