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
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import AllChats from "./AllChats";
import Contacts from "./Contacts";

const Tab = createMaterialTopTabNavigator();

function Tab3() {
  const navigation = useNavigation();
  return (
    <ScrollView>
      <TouchableOpacity onPress={() => navigation.navigate("Audio")}>
        <View style={{ padding: 10, margin: 10 }}>
          <Text>Calls here</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

//Make it normal case
const CustomTabLabel = ({ focused, label }) => {
  const formattedLabel =
    label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  return <Text style={{ color: "white" }}>{formattedLabel}</Text>;
};

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
        name="Chats"
        component={() => <AllChats />}
        options={{
          tabBarLabel: () => <CustomTabLabel label="Chats" />,
          tabBarLabelStyle: {
            color: "white",
          },
        }}
      />

      <Tab.Screen
        name="Calls"
        component={() => <Tab3 />}
        options={{
          tabBarLabel: () => <CustomTabLabel label="Calls" />,

          tabBarOptions: {
            activeTintColor: "red",
          },
          tabBarLabelStyle: {
            color: "white",
          },
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={() => <Contacts />}
        options={{
          tabBarLabel: () => <CustomTabLabel label="Contacts" />,
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
