import { View, Text, StyleSheet, TextInput } from "react-native";
import { Controller } from "react-hook-form";
import { responsiveWidth } from "react-native-responsive-dimensions";
// import AsyncStorage from '@react-native-community/async-storage';

export default function CustomInput({
  control,
  name,
  rules = {},
  placeholder,
  keyboardType,
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <>
          <View
            style={[
              styles.container,
              { borderColor: error ? "red" : "#e8e8e8" },
            ]}
          >
            <TextInput
              style={{
                backgroundColor: "#fff",
                padding: 14,
                marginLeft: 10,
                borderRadius: 9,
                fontSize: 14,
                marginBottom: 5,
                width: responsiveWidth(65),
              }}
              value={value}
              onChangeText={onChange}
              // onChange={(text) => {
              //     if (text.includes('')) {
              //         SafeAreaInsetsContext(text.trim());
              //     } else {
              //         setText(text);
              //     }
              // }
              // }
              onBlur={onBlur}
              placeholder={placeholder}
              keyboardType={keyboardType}
            />
          </View>
          {error && (
            <Text style={{ color: "red", width: "80%" }}>
              {error.message || "Invalid Data"}
            </Text>
          )}
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'white',
    // width: '88%',
    // height: 40,

    borderBottomColor: "#e8e8e8",
    borderBottomWidth: 1,
    borderRadius: 5,

    // paddingHorizontal: 10,
    // marginVertical: 5,
    paddingTop: 5,
  },
});
