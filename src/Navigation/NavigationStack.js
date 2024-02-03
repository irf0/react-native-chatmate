import { View, Text, TouchableOpacity, Alert } from "react-native";
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
import { FIREBASE_AUTH } from "../../Firebase";
import ChatScreen from "../Screens/ChatScreen";
import AudioRecord from "../Screens/AudioRecord";
import AudioPlayer from "../Screens/AudioPlayer";
import AudioTest from "../Screens/AudioTest";

const Stack = createNativeStackNavigator();

const NavigationStack = () => {
  const navigation = useNavigation();
  const [isUserLoggedin, setIsUserLoggedin] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

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

  const showUserInfoBtn = () => {
    setShowBtn(!showBtn);
  };

  const logout = () => {
    navigation.navigate("UserInfo");
  };

  return (
    <>
      {isUserLoggedin === "true" && (
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
                  <TouchableOpacity onPress={() => showUserInfoBtn()}>
                    <Entypo
                      name="dots-three-vertical"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                  {showBtn && (
                    <View
                      style={{
                        height: 50,
                        width: 100,
                        backgroundColor: "white",
                        padding: 10,
                        marginRight: 18,
                        borderRadius: 9,
                        position: "absolute",
                        right: 10,
                        alignItems: "center",
                        zIndex: 50,
                      }}
                    >
                      <TouchableOpacity onPress={logout}>
                        <Text
                          style={{
                            textAlignVertical: "center",
                            textAlign: "center",
                          }}
                        >
                          Profile
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
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
              headerTintColor: "white",
            }}
          />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{
              headerShadowVisible: false,
              headerBackTitleVisible: false,
              headerShown: true,
              title: "",
              headerTitleStyle: {
                color: "#fff",
              },
              headerTitleAlign: "center",
              headerStyle: {
                elevation: 0,
                backgroundColor: "#5b41f0",
              },
              headerTintColor: "white",
            }}
          />
          <Stack.Screen
            name="UserInfo"
            component={UserInfo}
            options={{
              headerShown: true,
              headerTitle: "My Account",
              headerStyle: {
                elevation: 0,
                backgroundColor: "#5b41f0",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                color: "#fff",
              },
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
          {/* <Stack.Screen
            name="Audio"
            component={AudioRecord}
            options={{
              headerShown: true,
              headerStyle: {
                elevation: 0,
                backgroundColor: "#5b41f0",
              },
              headerTitleStyle: {
                color: "#fff",
              },
            }}
          /> */}
          {/* <Stack.Screen
            name="Audio"
            component={AudioPlayer}
            options={{
              headerShown: true,
              headerStyle: {
                elevation: 0,
                backgroundColor: "#5b41f0",
              },
              headerTitleStyle: {
                color: "#fff",
              },
            }}
          /> */}
          <Stack.Screen
            name="Audio"
            component={AudioTest}
            options={{
              headerShown: true,
              headerStyle: {
                elevation: 0,
                backgroundColor: "#5b41f0",
              },
              headerTitleStyle: {
                color: "#fff",
              },
            }}
          />
        </Stack.Navigator>
      )}
      {isUserLoggedin === "false" ||
        (isUserLoggedin === null && (
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
                    <View
                      style={{
                        height: 50,
                        width: 100,
                        backgroundColor: "white",
                        padding: 10,
                        borderRadius: 9,
                        position: "absolute",
                        right: 10,
                        alignItems: "center",
                        zIndex: 50,
                      }}
                    >
                      <TouchableOpacity onPress={logout}>
                        <Text>Sign Out</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ),

                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                  fontSize: responsiveFontSize(2.9),
                },
              }}
            />
          </Stack.Navigator>
        ))}
    </>
  );
};

export default NavigationStack;
