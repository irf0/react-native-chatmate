import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../../../Firebase";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Avatar } from "react-native-elements";

const UserInfo = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [userPhoneNo, setUserPhoneNo] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [selfieName, setSelfieName] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const getUserInfo = async () => {
      const name = await AsyncStorage.getItem("NAME");
      const phone = await AsyncStorage.getItem("PHONE");
      const photo = await AsyncStorage.getItem("PROFILEPIC");
      setUserName(name);
      setUserPhoneNo(phone);
      setUserPhoto(photo);
    };

    getUserInfo();
  }, []);

  const openGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    if (!result.canceled) {
      setUserPhoto(result?.assets[0]?.uri);
      setSelfieName(result?.assets[0]?.fileName);
      uploadSelfie(result?.assets[0]?.uri, result?.assets[0]?.fileName);
    }
  };

  const uploadSelfie = async (uri, name) => {
    const blob = await new Promise((resolve, reject) => {
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
    const storageRef = ref(storage, `users/${name}`);

    uploadBytes(storageRef, blob)
      .then(() => {
        console.warn("Selfie Upload Successfull");

        getDownloadURL(storageRef)
          .then((url) => {
            console.log(url);
            setSelfieURL(url);
          })
          .catch((error) => {
            console.error("Error while getting download URL:", error);
          });
      })
      .catch((error) => {
        console.error("Error while uploading file:", error);
      });

    // We're done with the blob, close and release it
    blob.close();
  };

  const logOut = async () => {
    await FIREBASE_AUTH.signOut();
    await AsyncStorage.removeItem("isLoggedIn");
    await AsyncStorage.removeItem("NAME");
    await AsyncStorage.removeItem("docID");
    Alert.alert("Logged out successfully!");
    navigation.navigate("Login");
  };
  return (
    <View>
      <Avatar
        onPress={toggleModal}
        containerStyle={{
          height: 100,
          width: 100,
          alignSelf: "flex-start",
          marginLeft: 20,
          marginTop: 18,
          borderWidth: 2,
          borderColor: "#fff",
          backgroundColor: "white",
          borderRadius: 70,
          alignSelf: "center",
        }}
        rounded
        avatarStyle={{ borderRadius: 70 }}
        source={
          userPhoto
            ? { uri: userPhoto }
            : require("../../../assets/avatar-icon.png")
        }
      ></Avatar>
      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <Image source={{ uri: userPhoto }} style={styles.largeProfilePic} />

          <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <View
        style={{
          backgroundColor: "#fff",
          padding: 10,
          marginHorizontal: 20,
          marginVertical: 5,
          borderRadius: 9,
        }}
      >
        <Text>{userName}</Text>
      </View>
      <View
        style={{
          backgroundColor: "#fff",
          padding: 10,
          marginHorizontal: 20,
          marginVertical: 5,
          borderRadius: 9,
        }}
      >
        <Text>{userPhoneNo}</Text>
      </View>

      <TouchableOpacity
        onPress={logOut}
        style={{
          padding: 10,
          backgroundColor: "red",
          width: 300,
          alignSelf: "center",
        }}
      >
        <Text>Sign Out</Text>
      </TouchableOpacity>
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
export default UserInfo;
