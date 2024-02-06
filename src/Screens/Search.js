import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  startAt,
  updateDoc,
  where,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../Firebase";
import {
  responsiveFontSize,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Search = () => {
  const navigation = useNavigation();
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [queryResult, setQueryResult] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("name");
  const [showNothingImage, setShowNothingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedUserDocID, setLoggedUserDocID] = useState("");

  //Getting and storing logged user docID on mount
  useEffect(() => {
    const getloggedUserID = async () => {
      const loggedDocumentId = await AsyncStorage.getItem("docID");
      setLoggedUserDocID(loggedDocumentId);
    };

    getloggedUserID();
  }, []);

  const handleRadioPress = (option) => {
    setSelectedOption(option);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // const searchUser = async () => {
  //   setIsLoading(true);
  //   try {
  //     let q;
  //     const usersRef = collection(FIREBASE_DB, "users");
  //     if (selectedOption === "phone") {
  //       q = query(usersRef, where("phone", "==", searchPhone));
  //     } else if (selectedOption === "name") {
  //       q = query(
  //         usersRef,
  //         where("name", ">=", searchName),
  //         where("name", "<=", searchName + "\uf8ff")
  //       );
  //     }

  //     const searchResults = await getDocs(q).then((quer) => {
  //       const queryData = quer.docs.map((doc) => doc.data());
  //       console.log("search result", queryData);
  //       if (queryData.length < 1) {
  //         setShowNothingImage(true);
  //       }
  //       setQueryResult(queryData);
  //       // setSearchName("");
  //       // setSearchPhone("");
  //     });
  //     setIsLoading(false);
  //   } catch (error) {
  //     Alert.alert("An error occuring during search. Please try again");
  //   }
  // };

  const searchUser = async () => {
    setIsLoading(true);
    try {
      let q;
      const usersRef = collection(FIREBASE_DB, "users");

      if (selectedOption === "phone") {
        q = query(usersRef, where("phone", "==", searchPhone));
      } else if (selectedOption === "name") {
        //To work with case insensitive
        const words = searchName.split(" ");
        const camelCaseName = words
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("");

        q = query(
          usersRef,
          where("name", ">=", camelCaseName),
          where("name", "<=", camelCaseName + "\uf8ff")
        );
      }

      const searchResults = await getDocs(q);
      const queryData = searchResults.docs.map((doc) => doc.data());
      console.log("search result", queryData);

      if (queryData.length < 1) {
        setShowNothingImage(true);
      }

      setQueryResult(queryData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error during search:", error);
      Alert.alert("An error occurred during the search. Please try again");
      setIsLoading(false);
    }
  };

  const addFriend = async (
    nameInput,
    phoneInput,
    profilePicInput,
    uniqueIDInput
  ) => {
    setIsLoading(true);
    try {
      const documentId = await AsyncStorage.getItem("docID");
      if (!documentId) {
        console.error("No document ID found");
        return;
      }

      const docRef = doc(FIREBASE_DB, "users", documentId);
      // Fetch the current friends array
      const userDoc = await getDoc(docRef);
      const currentFriends = userDoc.data().friendsList || [];

      // Check if the friend already exists in the currentFriends array
      const isFriendAlreadyAdded = currentFriends.some(
        (friend) => friend.friendPhone === phoneInput
      );

      if (isFriendAlreadyAdded) {
        ToastAndroid.show("Friend already added!", ToastAndroid.SHORT);
        navigation.navigate("Contacts", { uniqueIdFromSearch: uniqueIDInput });
      } else {
        // Add the friend to the array
        const updatedFriends = [
          ...currentFriends,
          {
            friendName: nameInput,
            friendPhone: phoneInput,
            friendProfile: profilePicInput,
            friendUniqueID: uniqueIDInput,
          },
        ];

        // Update the document with the updated array
        await updateDoc(docRef, { friendsList: updatedFriends });

        ToastAndroid.show("Friend Added to Contacts", ToastAndroid.LONG);
        navigation.navigate("Contacts");
        console.log("Friend successfully added! Find in Contacts");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error adding friend: ", error);
      setIsLoading(false);
      Alert.alert(
        "An error occurred during the friend addition. Please try again"
      );
    }
  };

  return (
    <View>
      <View
        style={{
          margin: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Text>Search by</Text>

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleRadioPress("name")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              color={"#5b41f0"}
              name={
                selectedOption === "name" ? "radiobox-marked" : "radiobox-blank"
              }
              size={23}
            />
            <Text>Name</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleRadioPress("phone")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              color={"#5b41f0"}
              name={
                selectedOption === "phone"
                  ? "radiobox-marked"
                  : "radiobox-blank"
              }
              size={23}
            />
            <Text>Phone</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View
        style={{
          padding: 10,
          marginHorizontal: 12,
          marginTop: -16,
          borderWidth: 1,
          borderRadius: 6,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TextInput
          placeholder={
            selectedOption === "name" ? "Enter First Name" : "Enter Phone"
          }
          keyboardType={`${selectedOption === "phone" ? "phone-pad" : ""}`}
          value={selectedOption === "phone" ? searchPhone : searchName}
          onSubmitEditing={searchUser}
          onChangeText={(text) => {
            if (selectedOption === "phone") {
              setSearchPhone(text.startsWith("+91") ? text : `+91${text}`);
            }
            if (selectedOption === "name") {
              setSearchName(text);
            }
          }}
        />
        <TouchableOpacity onPress={searchUser}>
          <MaterialCommunityIcons
            name="magnify"
            size={25}
            style={{ fontWeight: "bold" }}
          />
        </TouchableOpacity>
      </View>
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
            Loading...
          </Text>
        </View>
      )}
      {queryResult?.length > 0 ? (
        queryResult.map((qr) => (
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
            key={qr?.phone}
          >
            <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
              <TouchableOpacity onPress={toggleModal}>
                <Image
                  source={{ uri: qr?.profilePic }}
                  style={{ height: 50, width: 50, borderRadius: 36 }}
                />
              </TouchableOpacity>

              {/* To view image in large */}

              <Modal
                animationType="slide"
                transparent={false}
                visible={isModalVisible}
                onRequestClose={toggleModal}
              >
                <View style={styles.modalContainer}>
                  <Image
                    source={{ uri: qr?.profilePic }}
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

              <View>
                <Text>{qr?.phone}</Text>
                <Text>{qr?.name}</Text>
              </View>
            </View>
            {qr?.uniqueID !== loggedUserDocID ? (
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#5b41f0",
                  padding: 5,
                  borderRadius: 3,
                }}
                onPress={() =>
                  addFriend(qr?.name, qr?.phone, qr?.profilePic, qr?.uniqueID)
                }
              >
                <Text style={{ color: "#5b41f0" }}>Add Friend</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: "#5b41f0", fontSize: 17 }}>Myself</Text>
            )}
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
export default Search;
