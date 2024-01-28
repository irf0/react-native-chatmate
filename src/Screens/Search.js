import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FIREBASE_DB } from "../../Firebase";

const Search = async ({ navigation }) => {
  const [searchName, setSearchName] = useState("irfan");
  const [searchPhone, setSearchPhone] = useState("");
  const usersRef = collection(FIREBASE_DB, "users");
  const q = query(
    usersRef,
    where("name", ">=", searchName)
    // where("name", "<=", searchName + "\uf8ff")
    // where("phone", "==", searchPhone)
  );

  const searchResults = await getDocs(q).then((quer) => {
    const queryData = quer.docs.map((doc) => doc.data());
    console.log("search result", queryData);
  });

  return (
    <SafeAreaView>
      <View
        style={{
          padding: 10,
          marginHorizontal: 12,
          marginTop: -16,
          borderWidth: 1,
          borderRadius: 6,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TextInput placeholder="Seach By Name or Phone" />
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <MaterialCommunityIcons
            name="magnify"
            size={25}
            style={{ fontWeight: "bold" }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Search;
