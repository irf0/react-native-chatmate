import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../Screens/Home";
import Registration from "../Screens/Authentication/Registration";
import Login from "../Screens/Authentication/Login";
import UserInfo from "../Screens/Authentication/UserInfo";
import OTP from "../Screens/Authentication/OTP";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Entypo from "react-native-vector-icons/Entypo";
import Search from "../Screens/Search";
import { useNavigation } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

const NavigationStack = () => {
  const navigation = useNavigation();
  const [isUserLoggedin, setIsUserLoggedin] = useState(false);

  const getData = async () => {
    try {
      const data = await AsyncStorage.getItem("isLoggedIn");
      setIsUserLoggedin(data);
      console.log(isUserLoggedin);
    } catch (e) {
      console.log("Error getting loggedIn token");
    }
  };
  useEffect(() => {
    getData();
    console.log("from stackNav", isUserLoggedin);
  }, []);

  return (
    <>
      {isUserLoggedin === "true" ? (
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              headerShadowVisible: false,
              headerBackTitleVisible: false,
              headerShown: true,
              title: "ChatMate",

              headerStyle: {
                elevation: 0,
                backgroundColor: "#5b41f0",
              },
              headerRight: () => (
                <>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Search")}
                    style={{ marginRight: 12 }}
                  >
                    <MaterialCommunityIcons
                      name="magnify"
                      size={23}
                      color="white"
                      style={{ fontWeight: "bold" }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Entypo
                      name="dots-three-vertical"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                </>
              ),

              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: responsiveFontSize(2.9),
              },
            }}
          />

          <Stack.Screen
            name="Search"
            component={Search}
            options={{
              headerShadowVisible: false,
              headerBackTitleVisible: false,
              headerShown: true,
              title: "Search a Friend",
              headerTitleStyle: {
                color: "#fff",
              },
              headerTitleAlign: "center",
              headerStyle: {
                elevation: 0,
                backgroundColor: "#5b41f0",
              },
              headerLeft: () => <TouchableOpacity>{""}</TouchableOpacity>,
            }}
          />
          <Stack.Screen
            name="UserInfo"
            component={UserInfo}
            options={{ headerShown: true }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Registration"
            component={Registration}
            options={{
              headerShown: true,
              headerStyle: {
                elevation: 0,
                backgroundColor: "#5b41f0",
              },
              headerTitleStyle: {
                color: "#fff",
              },
              headerLeft: () => <TouchableOpacity>{""}</TouchableOpacity>,
            }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: true,
              headerStyle: {
                elevation: 0,
                backgroundColor: "#5b41f0",
              },
              headerTitleStyle: {
                color: "#fff",
              },
              headerLeft: () => <TouchableOpacity>{""}</TouchableOpacity>,
            }}
          />
          <Stack.Screen
            name="Verification"
            component={OTP}
            options={{
              headerShown: true,
              headerStyle: {
                elevation: 0,
                backgroundColor: "#5b41f0",
              },
              headerTitleStyle: {
                color: "#fff",
              },
              headerLeft: () => <TouchableOpacity>{""}</TouchableOpacity>,
            }}
          />
        </Stack.Navigator>
      )}
    </>
  );
};

export default NavigationStack;
