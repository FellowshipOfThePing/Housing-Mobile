import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
import colors from "../config/colors";
import AppText from "./AppText";

const animationDuration = 300;

function MapButtonTitles({ visible }) {
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [initialLoad, setInitialLoad] = useState(true);

  const fadeOut = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
  };

  const fadeIn = () => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    setTimeout(() => {
      fadeOut();
      setInitialLoad(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (visible) {
      fadeIn();
    } else if (!initialLoad) {
      fadeOut();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.titleContainer, { opacity: opacityAnim }]}>
      <AppText style={styles.title}>Zoom Out</AppText>
      <AppText style={styles.title}>Zoom to Marker</AppText>
      <AppText style={styles.title}>Toggle Map-Follows-Scroll</AppText>
      <AppText style={styles.title}>Scroll to Beginning of List</AppText>
      <AppText style={styles.title}>Toggle Dropdown</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    position: "absolute",
    top: Dimensions.get("window").height / 8,
    left: 59,
    height: Dimensions.get("window").height * 0.375,
    paddingHorizontal: 10,
    justifyContent: "space-around",
    alignItems: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 7,
  },
  title: {
    color: colors.light,
  },
});

export default MapButtonTitles;
