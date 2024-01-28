import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { NavigationContainer } from "@react-navigation/native";
import AllChats from "./AllChats";
import Contacts from "./Contacts";

const Tab = createMaterialTopTabNavigator();

function Tab3() {
  return (
    <ScrollView>
      <View style={{ padding: 10, margin: 10 }}>
        <Text>Calls here</Text>
      </View>
    </ScrollView>
  );
}

const Home = ({ navigation }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarOptions: {
          activeTintColor: "transparent",
        },
        tabBarPressColor: "#5b41f0",
        tabBarPressOpacity: 1,
        tabBarStyle: {
          elevation: 0,
          borderWidth: 0,
          backgroundColor: "#5b41f0",
        },
        tabBarIndicatorStyle: {
          backgroundColor: "white",
        },
      }}
    >
      <Tab.Screen
        name="Contacts"
        component={() => <Contacts />}
        options={{
          tabBarOptions: {
            activeTintColor: "red",
          },
          tabBarLabelStyle: {
            color: "white",
          },
        }}
      />
      <Tab.Screen
        name="Chats"
        component={() => <AllChats />}
        options={{
          tabBarLabelStyle: {
            color: "white",
          },
        }}
      />

      <Tab.Screen
        name="Calls"
        component={() => <Tab3 />}
        options={{
          tabBarOptions: {
            activeTintColor: "red",
          },
          tabBarLabelStyle: {
            color: "white",
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default Home;
