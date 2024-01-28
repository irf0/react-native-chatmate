import {
  View,
  Text,
  ToastAndroid,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { PhoneAuthProvider } from "firebase/auth";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../Firebase";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import CountryPicker from "react-native-country-picker-modal";
import {
  FirebaseRecaptcha,
  FirebaseRecaptchaVerifierModal,
} from "expo-firebase-recaptcha";
import { collection, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgng2kPB9is2IraBSCPDrE42gDpfJHoko",
  authDomain: "chatmate-62904.firebaseapp.com",
  projectId: "chatmate-62904",
  storageBucket: "chatmate-62904.appspot.com",
  messagingSenderId: "916269302636",
  appId: "1:916269302636:web:3e190aa648d43e43a72949",
};
let myApp = initializeApp(firebaseConfig);

const Login = ({ navigation, newDocRefId }) => {
  const recaptchaVerifier = useRef(null);
  const [verificationId, setVerificationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [phone, setPhone] = useState("");
  const [showCountry, setShowCountry] = useState(false);
  const [countryCode, setCountryCode] = useState("FR");
  const [country, setCountry] = useState(null);
  const [withCountryNameButton, setWithCountryNameButton] = useState(false);
  const [withFlag, setWithFlag] = useState(true);
  const [withEmoji, setWithEmoji] = useState(true);
  const [withFilter, setWithFilter] = useState(true);
  const [withAlphaFilter, setWithAlphaFilter] = useState(false);
  const [withCallingCode, setWithCallingCode] = useState(false);

  const onSelect = (country) => {
    setCountryCode(country.cca2);
    setCountry(country);
  };

  const checkUser = async (phone) => {
    const plus = "+";
    const phoneNumber = `${plus}${country?.callingCode}`.concat(phone);
    const usersRef = collection(FIREBASE_DB, "users");
    const q = query(usersRef, where("phone", "==", phoneNumber));
    const phoneProvider = new PhoneAuthProvider(FIREBASE_AUTH);

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();

        try {
          const verificationId = await phoneProvider.verifyPhoneNumber(
            phoneNumber,
            recaptchaVerifier.current
          );
          setVerificationId(verificationId);
          ToastAndroid.show("OTP Sent Successfully", ToastAndroid.SHORT);
          setLoading(false);
          navigation.navigate("Verification", {
            verificationId: verificationId,
            phoneNumber: phoneNumber,
            newDocRefId: newDocRefId,
          });
        } catch (err) {
          console.log(err.message);
          Alert.alert("An Unexpected Error Occured", "Kindly try Again Later.");
          setLoading(false);
        }
      } else {
        Alert.alert(
          "No User Registered with this Mobile Number!",
          "Kindly check the Mobile Number and try again or register now to become a workforce member"
        );
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const handleLogin = async () => {
    setClicked(true);
    await checkUser(phone);
  };

  return (
    <ScrollView
      style={{
        backgroundColor: "#535257",
      }}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
        androidHardwareAccelerationDisabled={true}
        androidLayerType="software"
      />
      <View
        style={
          {
            // marginVertical: responsiveHeight(5),
            // alignSelf: "center",
          }
        }
      >
        <Image
          source={require("../../../assets/chatmate-icon.png")}
          style={{
            height: responsiveHeight(17),
            resizeMode: "cover",
            alignSelf: "center",
            backgroundColor: "white",
            width: responsiveWidth(35),
            borderRadius: 80,
            marginVertical: responsiveHeight(6),
          }}
        />
        <View
          style={{
            marginLeft: 20,
          }}
        >
          <Text
            style={{
              fontSize: 23,
              fontWeight: "500",
              marginVertical: 5,
              color: "#fff",
            }}
          >
            Welcome Back!
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#fff",
            }}
          >
            Enter your credentials below
          </Text>
        </View>

        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginLeft: 6,
              fontWeight: "500",
              marginVertical: 5,
              color: "#fff",
            }}
          >
            Login
          </Text>
          <View>
            <View
              style={{
                flexDirection: "row",
                marginVertical: 5,
                backgroundColor: "white",
                borderRadius: 9,
                paddingVertical: responsiveHeight(2),
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  paddingLeft: responsiveWidth(2.5),
                  borderBottomLeftRadius: 9,
                  flexDirection: "row",
                  borderTopLeftRadius: 9,
                }}
              >
                <View
                  style={{
                    // width: responsiveWidth(8),
                    flexDirection: "row",
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
                      // padding: 10,
                      paddingVertical: responsiveHeight(0.4),
                    }}
                  >
                    +{country?.callingCode}
                  </Text>
                </View>

                <TextInput
                  name="phone"
                  placeholder="Phone"
                  keyboardType="numeric"
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: 2,
                    paddingLeft: 10,
                    fontSize: 14,
                  }}
                  onChangeText={(text) => setPhone(text)}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogin}
            style={{
              marginTop: responsiveHeight(4),
              backgroundColor: "#5b41f0",
              marginVertical: 10,
              paddingVertical: 17,
              borderRadius: 9,
              marginHorizontal: 20,
            }}
          >
            {clicked ? (
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
                Send OTP
              </Text>
            )}
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              textAlign: "center",
              justifyContent: "center",
              marginVertical: 20,
            }}
          >
            <Text
              style={{
                color: "black",
                textAlign: "center",
                fontSize: 16,
                fontWeight: "500",
                marginRight: 4,
                color: "#fff",
              }}
            >
              Don't have an account ?
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Registration");
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                  borderBottomWidth: 1,
                  borderBottomColor: "#fff",
                }}
              >
                Signup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;
