import { View, Text, TextInput } from "react-native";
import React from "react";

const UserInfo = () => {
  return (
    <View>
      <TextInput
        placeholder="Enter Name"
        style={{
          backgroundColor: "#fff",
          padding: 10,
          margin: 20,
          borderRadius: 9,
        }}
      />
    </View>
  );
};

export default UserInfo;
