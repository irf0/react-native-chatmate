import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import React, { useState } from "react";
import CountryPicker from "react-native-country-picker-modal";
import { useForm, con } from "react-hook-form";
import CustomInput from "../../Components/CustomInput";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../Firebase";
import { Avatar } from "react-native-elements";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Registration = ({ navigation }) => {
  const { control, handleSubmit, watch } = useForm();
  const [showCountry, setShowCountry] = useState(false);
  const [countryCode, setCountryCode] = useState("US");
  const [country, setCountry] = useState(null);
  const [withCountryNameButton, setWithCountryNameButton] = useState(false);
  const [withFlag, setWithFlag] = useState(true);
  const [withEmoji, setWithEmoji] = useState(true);
  const [withFilter, setWithFilter] = useState(true);
  const [withAlphaFilter, setWithAlphaFilter] = useState(false);
  const [withCallingCode, setWithCallingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selfieName, setSelfieName] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState(null);
  const [selfieURL, setSelfieURL] = useState("");

  const onSelect = (selectedCountry) => {
    setCountryCode(selectedCountry.cca2);
    setCountry(selectedCountry);
  };

  const CountryCheck = () => {
    if (countryCode === "IN") {
      Alert.alert("Select Country");
    }
    if (country === null) {
      Alert.alert("Select Country");
    }
  };

  const date = new Timestamp.now();
  // const time = date.seconds;
  // const q = "NU";
  // let uniqueID = q.concat(time);

  const ProceedtoVerificationDetails = async (data) => {
    if (userName == "" || userPhone == "") {
      Alert.alert("Enter All the Fields!");
    } else {
      setLoading(true);
      if (countryCode === "") {
        Alert.alert(
          "Country Not Selected!",
          "Kindly select the Country and then try again."
        );
      }

      if (country === null) {
        Alert.alert(
          "Country Not Selected!",
          "Kindly select the Country and then try again."
        );
      } else {
        // setClicked(true);
        const { name, phone, profilePic } = data;

        // const Fullphone num
        const plus = "+";
        const Fullphone = `${plus}${country?.callingCode}`.concat(userPhone);

        try {
          setLoading(true);
          const myDoc = collection(FIREBASE_DB, "users");
          const newDocRef = await addDoc(myDoc, {
            name: userName,
            phone: Fullphone,
            profilePic: selfieURL,
            createdAt: date,
          });
          if (newDocRef) {
            setLoading(false);
            ToastAndroid.show(
              "Account Created Successfully",
              ToastAndroid.SHORT
            );
            // console.log("Document written with ID: ", newDocRef.id);
            navigation.navigate("Login", { newDocRefId: newDocRef?.id });
          }
        } catch (error) {
          console.log("Error", error);
          Alert.alert("Error", "An Unexpected Error occured. Kindly try again");
          setLoading(false);
        }
      }
    }
  };

  const openGallery = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    if (!result.canceled) {
      setSelfieURL(result?.assets[0]?.uri);
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
        setLoading(false);

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

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: "#535257",
      }}
    >
      <>
        <View>
          <TextInput
            value={userName}
            onChangeText={(e) => setUserName(e)}
            placeholder="Enter Name"
            style={{
              backgroundColor: "#fff",
              padding: 14,
              margin: 20,
              borderRadius: 9,
            }}
          />
        </View>
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#fff",
              padding: 8,
              marginLeft: 22,
              borderRadius: 9,
              fontSize: 14,
              width: responsiveWidth(22),
              height: responsiveHeight(7),
              alignSelf: "center",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <CountryPicker
              {...{
                countryCode,
                withFilter,
                withFlag,
                withCountryNameButton,
                withAlphaFilter,
                withCallingCode,
                withEmoji,
                onSelect,
              }}
              visible={showCountry}
            />

            <Text
              style={{
                marginLeft: -10,
              }}
            >
              +{country?.callingCode}
            </Text>
          </View>

          <TextInput
            value={userPhone}
            keyboardType="numeric"
            onChangeText={(e) => setUserPhone(e)}
            placeholder="Enter Phone Number"
            style={{
              backgroundColor: "#fff",
              padding: 14,
              marginLeft: 10,
              borderRadius: 9,
              fontSize: 14,
              marginBottom: 5,
              width: responsiveWidth(65),
            }}
          />
        </View>

        <Avatar
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
          }}
          rounded
          avatarStyle={{ borderRadius: 70 }}
          source={
            selfieURL
              ? { uri: selfieURL }
              : require("../../../assets/avatar-icon.png")
          }
        >
          <Avatar.Accessory
            color="white"
            size={40}
            style={{ backgroundColor: "#5b41f0" }}
            onPress={openGallery}
          />
        </Avatar>
        <Text style={{ marginLeft: 20, fontSize: 16, color: "#fff" }}>
          Choose Image
        </Text>

        <TouchableOpacity
          style={{
            padding: 17,
            paddingHorizontal: 20,
            borderRadius: 9,
            width: "80%",
            marginTop: 40,
            backgroundColor: "#5b41f0",
            alignSelf: "center",
          }}
          onPress={handleSubmit(ProceedtoVerificationDetails)}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Register
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ marginTop: 25 }}>
          <Text
            style={{
              textAlignVertical: "center",
              color: "#fff",
              textAlign: "center",
            }}
          >
            Already have an account?
          </Text>
          <TouchableOpacity
            style={{
              padding: 17,
              paddingHorizontal: 20,
              borderRadius: 9,
              width: "80%",
              backgroundColor: "#5b41f0",
              alignSelf: "center",
            }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Login</Text>
          </TouchableOpacity>
        </View>
      </>
    </ScrollView>
  );
};

export default Registration;
