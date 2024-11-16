import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";

// eslint-disable-next-line max-lines-per-function
const SelectTimeScreen: React.FC = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const router = useRouter();

  // Generate time slots from 6:00 AM to 9:00 PM
  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let hour = 6; hour <= 21; hour++) {
      const startHour = hour % 12 || 12;
      const startAMPM = hour < 12 ? "AM" : "PM";
      const endHour = (hour + 1) % 12 || 12;
      const endAMPM = hour + 1 < 12 ? "AM" : "PM";
      const timeSlot = `${startHour}:00 ${startAMPM} - ${endHour}:00 ${endAMPM}`;
      timeSlots.push(timeSlot);
    }
    return timeSlots;
  };

  const timeSlots = generateTimeSlots();

  // Handle time selection
  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    bottomSheetModalRef.current?.dismiss();

    // Pass selected time interval to the next screen
    router.replace({
      pathname: "/create-activity",
      params: { timeInterval: time },
    });
  };

  // callbacks for BottomSheet
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <View style={styles.container}>
      <Button
        onPress={handlePresentModalPress}
        title="Select Time"
        color="black"
      />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onChange={handleSheetChanges}
        snapPoints={["25%", "50%", "90%"]}
      >
        <BottomSheetView style={styles.contentContainer}>
          <FlatList
            data={timeSlots}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Button
                title={item}
                onPress={() => handleSelectTime(item)}
                color={selectedTime === item ? "green" : "black"}
              />
            )}
          />
        </BottomSheetView>
      </BottomSheetModal>

      {selectedTime && (
        <View style={styles.selectedTimeContainer}>
          <Text style={styles.selectedTimeText}>
            Selected Time: {selectedTime}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  selectedTimeContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  selectedTimeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SelectTimeScreen;
