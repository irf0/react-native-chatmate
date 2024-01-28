import { View, Text, ScrollView, TextInput } from "react-native";
import React, { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FIREBASE_DB } from "../../Firebase";

const Contacts = async () => {
  //   const [searchName, setSearchName] = useState("");
  //   const [searchPhone, setSearchPhone] = useState("");
  //   const usersRef = collection(FIREBASE_DB, "users");
  //   const q = query(
  //     usersRef,
  //     where("name", ">=", searchName),
  //     where("name", "<=", searchName + "\uf8ff"),
  //     where("phone", "==", searchPhone)
  //   );

  //   const searchResults = await getDocs(q);

  //   // Process the search results
  //   searchResults.forEach((userDoc) => {
  //     const userData = userDoc.data();
  //     console.log("Found user:", userData.username);
  //   });

  return (
    <ScrollView>
      <View style={{ padding: 10, margin: 10 }}>
        {/* <TextInput placeholder="Search By Name or Phone" /> */}
        <Text>Contacts here</Text>
      </View>
    </ScrollView>
  );
};

export default Contacts;
