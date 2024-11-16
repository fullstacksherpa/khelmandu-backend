import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import DateList from "@/components/date-list";
import DatePicker from "@/components/datepicker-modal";
import SportPicker from "@/components/sport-picker";
import { getItem } from "@/core/storage";

// eslint-disable-next-line max-lines-per-function
const CreateActivity = () => {
  const router = useRouter();
  const { taggedVenue } = useLocalSearchParams();
  const { timeInterval } = useLocalSearchParams();
  const [selected, setSelected] = useState(["Public"]);
  const [sport, setSport] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [noOfPlayers, setnoOfPlayers] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // const selectDate = (date) => {
  //   setModalVisible(false);
  //   setDate(date);
  // };
  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const [timeIntervaal, setTimeIntervaal] = useState("");

  useEffect(() => {
    console.log("Time Interval");
    if (timeInterval) {
      setTimeIntervaal(timeInterval);
    }
  }, [timeInterval]);

  // useEffect(() => {
  //   if (route.params?.timeInterval) {
  //     setTimeInterval(route.params.timeInterval);
  //   }
  // }, [route.params]);

  // console.log(timeInterval);

  const createGame = async () => {
    try {
      const userId = getItem("userId");
      const admin = userId;
      const time = timeIntervaal;
      const gameData = {
        sport,
        area: taggedVenue,
        date,
        time,
        admin,
        totalPlayers: noOfPlayers,
      };

      const response = await axios.post(
        "http://localhost:8000/game/creategame",
        gameData
      );
      console.log("Game created:", response.data);
      if (response.status === 200) {
        Alert.alert("Success!", "Game created Successfully", [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "OK", onPress: () => router.back() },
        ]);

        setSport("");
        setArea("");
        setDate("");
        setTimeIntervaal("");
      }
      // Handle success or navigate to another screen
    } catch (error) {
      console.error("Failed to create game:", error);
      // Handle error
    }
  };

  const [selectedVenue, setSelectedVenue] = useState("");

  useEffect(() => {
    console.log("I run");
    if (taggedVenue) {
      setSelectedVenue(taggedVenue);
    }
  }, [taggedVenue]);

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "white",
          paddingTop: Platform.OS === "android" ? 35 : 0,
        }}
      >
        <ScrollView>
          <View style={{ marginHorizontal: 10 }}>
            <Ionicons
              onPress={() => router.back()}
              name="arrow-back"
              size={24}
              color="black"
            />
          </View>
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>
              Create Activity
            </Text>
            <SportPicker sport={sport} setSport={setSport} />

            <Text
              style={{ borderColor: "#E0E0E0", borderWidth: 0.7, height: 1 }}
            />

            <Pressable
              onPress={() => router.push("/tag-venue")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
                marginTop: 10,
                marginVertical: 10,
              }}
            >
              <Entypo name="location" size={24} color="gray" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "500" }}>Area</Text>
                <TextInput
                  value={area ? area : selectedVenue}
                  onChangeText={setArea}
                  placeholderTextColor="gray"
                  style={{ marginTop: 7, fontSize: 15, color: "black" }}
                  placeholder={"Locality or venue name"}
                />
              </View>
              <AntDesign name="arrowright" size={24} color="gray" />
            </Pressable>

            <Text
              style={{ borderColor: "#E0E0E0", borderWidth: 0.7, height: 1 }}
            />

            <Pressable
              onPress={() => {
                setIsModalVisible(true);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
                marginTop: 10,
                marginVertical: 10,
              }}
            >
              <Feather name="calendar" size={24} color="gray" />
              <Pressable style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "500" }}>Date</Text>
                <TextInput
                  editable={false}
                  placeholderTextColor={date ? "black" : "gray"}
                  style={{ marginTop: 7, fontSize: 15 }}
                  placeholder={date ? date : "Pick a Day"}
                />
              </Pressable>
              <DatePicker isVisible={isModalVisible} onClose={onModalClose}>
                <DateList onSelect={setDate} onCloseModal={onModalClose} />
              </DatePicker>
            </Pressable>

            <Text
              style={{ borderColor: "#E0E0E0", borderWidth: 0.7, height: 1 }}
            />

            <Pressable
              onPress={() => router.push("/select-time-screen")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
                marginTop: 7,
                marginVertical: 10,
              }}
            >
              <AntDesign name="clockcircleo" size={24} color="gray" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "500" }}>Time</Text>
                <TextInput
                  placeholderTextColor={timeInterval ? "black" : "gray"}
                  style={{ marginTop: 7, fontSize: 15 }}
                  placeholder={timeInterval ? timeInterval : "Pick Exact Time"}
                />
              </View>
              <AntDesign name="arrowright" size={24} color="gray" />
            </Pressable>

            <Text
              style={{ borderColor: "#E0E0E0", borderWidth: 0.7, height: 1 }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
                marginTop: 7,
                marginVertical: 10,
              }}
            >
              <Feather name="activity" size={24} color="black" />

              <View>
                <Text
                  style={{ marginBottom: 10, fontSize: 15, fontWeight: "500" }}
                >
                  Activity Access
                </Text>

                <Pressable
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Pressable
                    onPress={() => setSelected("Public")}
                    style={
                      selected.includes("Public")
                        ? {
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            backgroundColor: "#07bc0c",
                            width: 140,
                            justifyContent: "center",
                            borderRadius: 3,
                            padding: 10,
                          }
                        : {
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            backgroundColor: "white",
                            width: 140,
                            justifyContent: "center",
                            borderRadius: 3,
                            padding: 10,
                          }
                    }
                  >
                    <Ionicons
                      name="earth"
                      size={24}
                      color={selected.includes("Public") ? "white" : "black"}
                    />
                    <Text
                      style={
                        selected.includes("Public")
                          ? { color: "white", fontWeight: "bold", fontSize: 15 }
                          : { color: "black", fontWeight: "bold", fontSize: 15 }
                      }
                    >
                      Public
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelected("invite only")}
                    style={
                      selected.includes("invite only")
                        ? {
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            backgroundColor: "#07bc0c",
                            width: 140,
                            justifyContent: "center",
                            borderRadius: 3,
                            padding: 10,
                          }
                        : {
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            backgroundColor: "white",
                            width: 140,
                            justifyContent: "center",
                            borderRadius: 3,
                            padding: 10,
                          }
                    }
                  >
                    <AntDesign
                      name="lock1"
                      size={24}
                      color={
                        selected.includes("invite only") ? "white" : "black"
                      }
                    />
                    <Text
                      style={
                        selected.includes("invite only")
                          ? { color: "white", fontWeight: "bold", fontSize: 15 }
                          : { color: "black", fontWeight: "bold", fontSize: 15 }
                      }
                    >
                      Invite Only
                    </Text>
                  </Pressable>
                </Pressable>
              </View>
            </View>
            <Text
              style={{
                borderColor: "#E0E0E0",
                borderWidth: 0.7,
                height: 1,
                marginTop: 7,
              }}
            />

            <Text style={{ marginTop: 20, fontSize: 16 }}>Total Players</Text>

            <View
              style={{
                padding: 10,
                backgroundColor: "#F0F0F0",
                marginTop: 10,
                borderRadius: 6,
              }}
            >
              <View style={{ marginVertical: 5 }}>
                <View>
                  <TextInput
                    value={noOfPlayers}
                    onChangeText={setnoOfPlayers}
                    style={{
                      padding: 10,
                      backgroundColor: "white",
                      borderColor: "#D0D0D0",
                      borderWidth: 1,
                    }}
                    placeholder="Total Players (including you)"
                  />
                </View>
              </View>
            </View>
            <Text
              style={{
                borderColor: "#E0E0E0",
                borderWidth: 0.7,
                height: 1,
                marginTop: 12,
              }}
            />

            <Text style={{ marginTop: 20, fontSize: 16 }}>
              Add Instructions
            </Text>

            <View
              style={{
                padding: 10,
                backgroundColor: "#F0F0F0",
                marginTop: 10,
                borderRadius: 6,
              }}
            >
              <View
                style={{
                  marginVertical: 5,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="bag-check" size={24} color="red" />

                <Text style={{ flex: 1, fontStyle: 15, fontWeight: "500" }}>
                  Bring your own equipment
                </Text>

                <FontAwesome name="check-square" size={24} color="green" />
              </View>

              <View
                style={{
                  marginVertical: 5,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="directions-fork"
                  size={24}
                  color="#FEBE10"
                />

                <Text style={{ flex: 1, fontStyle: 15, fontWeight: "500" }}>
                  Cost Shared
                </Text>

                <FontAwesome name="check-square" size={24} color="green" />
              </View>

              <View
                style={{
                  marginVertical: 5,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FontAwesome5 name="syringe" size={24} color="green" />

                <Text style={{ flex: 1, fontStyle: 15, fontWeight: "500" }}>
                  Covid Vaccinated players preferred
                </Text>

                <FontAwesome name="check-square" size={24} color="green" />
              </View>

              <TextInput
                style={{
                  padding: 10,
                  backgroundColor: "white",
                  borderColor: "#D0D0D0",
                  borderWidth: 1,
                  marginVertical: 8,
                  borderRadius: 6,
                }}
                placeholder="Add Additional Instructions"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
                marginTop: 15,
                marginVertical: 10,
              }}
            >
              <AntDesign name="setting" size={24} color="black" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "500" }}>
                  Advanced Settings
                </Text>
              </View>
              <AntDesign name="arrowright" size={24} color="gray" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Pressable
        onPress={() => {
          createGame();
        }}
        style={{
          backgroundColor: "#07bc0c",
          marginTop: "auto",
          marginBottom: 30,
          padding: 12,
          marginHorizontal: 10,
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "white",
            fontSize: 15,
            fontWeight: "500",
          }}
        >
          Create Activity
        </Text>
      </Pressable>
    </>
  );
};

export default CreateActivity;
