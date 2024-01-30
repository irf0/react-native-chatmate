import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Alert,
  ToastAndroid,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useRef, useId } from "react";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useForm } from "react-hook-form";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  Timestamp,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../Firebase";

const firebaseConfig = {
  apiKey: "AIzaSyCgng2kPB9is2IraBSCPDrE42gDpfJHoko",
  authDomain: "chatmate-62904.firebaseapp.com",
  projectId: "chatmate-62904",
  storageBucket: "chatmate-62904.appspot.com",
  messagingSenderId: "916269302636",
  appId: "1:916269302636:web:3e190aa648d43e43a72949",
};
let myApp = initializeApp(firebaseConfig);

const OTP = ({ navigation, route }) => {
  const [otp, setOtp] = useState("");
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [code3, setCode3] = useState("");
  const [code4, setCode4] = useState("");
  const [code5, setCode5] = useState("");
  const [code6, setCode6] = useState("");
  const [clicked, setClicked] = useState(false);
  const info = route.params;
  const verificationId = info.verificationId;
  const phoneNumber = info.phoneNumber;

  const verifyOTP = async (data) => {
    setClicked(true);
    if (loading) {
      return;
    }
    setLoading(true);

    const { verificationCode } = data;
    const d = `${code1}${code2}${code3}${code4}${code5}${code6}`;
    try {
      const credential = PhoneAuthProvider.credential(verificationId, d);
      const authResult = await signInWithCredential(FIREBASE_AUTH, credential);

      await AsyncStorage.setItem("isLoggedIn", JSON.stringify(true));
      ToastAndroid.show("User Verified Successfully", ToastAndroid.SHORT);
      setLoading(false);
      await navigation.navigate("Home");
      setClicked(false);
    } catch (err) {
      console.log("An error occurred while login", err);
      setClicked(false);
    }
  };

  const resendOTP = () => {
    navigation.goBack();
    setLoading(false);
  };

  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm();

  const [seconds, setSeconds] = useState(60);
  const [minutes, setMinutes] = useState(0);

  var timer;
  useEffect(() => {
    timer = setInterval(() => {
      setSeconds(seconds - 1);

      if (seconds === 0) {
        setSeconds(0);
        // navigation.navigate("LoginOTP")
      }
    }, 1000);
    return () => clearInterval(timer);
  });

  const et1 = useRef();
  const et2 = useRef();
  const et3 = useRef();
  const et4 = useRef();
  const et5 = useRef();
  const et6 = useRef();

  const [f1, setF1] = useState("");
  const [f2, setF2] = useState("");
  const [f3, setF3] = useState("");
  const [f4, setF4] = useState("");
  const [f5, setF5] = useState("");
  const [f6, setF6] = useState("");

  return (
    <ScrollView
      style={{
        backgroundColor: "#E3E5EF",
      }}
    >
      <View
        style={{
          height: responsiveHeight(100),
          alignItems: "center",
        }}
      >
        <Text
          style={{
            marginTop: responsiveHeight(4),
            justifyContent: "center",
            alignItems: "center",
            fontSize: responsiveFontSize(2.5),
            fontWeight: "bold",
          }}
        >
          OTP Verification
        </Text>
        <Text
          style={{
            marginVertical: responsiveHeight(2),
            justifyContent: "center",
            alignItems: "center",
            fontSize: responsiveFontSize(2),
            fontWeight: "500",
          }}
        >
          We have sent you one time password{"\n"}on this {phoneNumber}
        </Text>

        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
          }}
        >
          <TextInput
            ref={et1}
            style={[
              styles.otpInput,
              { borderColor: f1.length >= 1 ? "blue" : "#000" },
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={f1}
            autoComplete="sms-otp"
            name="verificationCode1"
            onChangeText={(txt) => {
              setF1(txt);
              setCode1(txt);
              if (txt.length >= 1) {
                et2.current.focus();
              } else if (txt.length < 1) {
                et1.current.focus();
              }
            }}
          />
          <TextInput
            ref={et2}
            style={[
              styles.otpInput,
              { borderColor: f2.length >= 1 ? "blue" : "#000" },
            ]}
            maxLength={1}
            value={f2}
            name="verificationCode2"
            keyboardType="number-pad"
            onChangeText={(txt) => {
              setF2(txt);
              setCode2(txt);
              if (txt.length >= 1) {
                et3.current.focus();
              } else if (txt.length < 1) {
                et1.current.focus();
              }
            }}
          />
          <TextInput
            ref={et3}
            style={[
              styles.otpInput,
              { borderColor: f3.length >= 1 ? "blue" : "#000" },
            ]}
            value={f3}
            name="verificationCode3"
            maxLength={1}
            keyboardType="number-pad"
            onChangeText={(txt) => {
              setF3(txt);
              setCode3(txt);
              if (txt.length >= 1) {
                et4.current.focus();
              } else if (txt.length < 1) {
                et2.current.focus();
              }
            }}
          />
          <TextInput
            ref={et4}
            value={f4}
            name="verificationCode4"
            style={[
              styles.otpInput,
              { borderColor: f4.length >= 1 ? "blue" : "#000" },
            ]}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(txt) => {
              setF4(txt);
              setCode4(txt);
              if (txt.length >= 1) {
                et5.current.focus();
              } else if (txt.length < 1) {
                et3.current.focus();
              }
            }}
          />
          <TextInput
            ref={et5}
            value={f5}
            name="verificationCode5"
            style={[
              styles.otpInput,
              { borderColor: f5.length >= 1 ? "blue" : "#000" },
            ]}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(txt) => {
              setF5(txt);
              setCode5(txt);
              if (txt.length >= 1) {
                et6.current.focus();
              } else if (txt.length < 1) {
                et4.current.focus();
              }
            }}
          />
          <TextInput
            ref={et6}
            value={f6}
            name="verificationCode6"
            style={[
              styles.otpInput,
              { borderColor: f6.length >= 1 ? "blue" : "#000" },
            ]}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(txt) => {
              setF6(txt);
              setCode6(txt);
              if (txt.length >= 1) {
                et6.current.focus();
              } else if (txt.length < 1) {
                et5.current.focus();
              }
            }}
          />
        </View>
        <Text
          style={{
            marginTop: responsiveHeight(2),
            marginBottom: responsiveHeight(3),
          }}
        >
          00:{seconds}
        </Text>
        <View
          style={{
            flexDirection: "row",
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "black",
              textAlign: "center",
              fontSize: 16,
              fontWeight: "500",
              marginRight: 4,
            }}
          >
            Didn't recieve OTP ?
          </Text>
          <TouchableOpacity onPress={resendOTP}>
            <Text
              style={{
                color: "#273990",
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Resend OTP
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={verifyOTP}
          style={{
            padding: 17,
            paddingHorizontal: 20,
            borderRadius: 9,
            width: "80%",
            marginTop: 40,
            backgroundColor: "#5b41f0",
            alignSelf: "center",
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
                fontWeight: "500",
              }}
            >
              Verify
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default OTP;

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: "black",
    width: 40,
    height: 40,
    margin: 10,
    textAlign: "center",
    fontSize: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 0.5,
    borderRadius: 40,
    marginHorizontal: 3,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
