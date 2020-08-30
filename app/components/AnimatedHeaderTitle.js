import React, { useState, useRef, useEffect, useContext } from "react";
import { StyleSheet, Animated } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";

import AppText from "./AppText";
import SavedContext from "../firestore/context";

const fadeTime = 200;
const delayTime = 1500;

function AnimatedHeaderTitle({ headerTitle, color, textStyle, bannerStyle }) {
  const netInfo = useNetInfo();
  const offline =
    netInfo.type !== "unknown" && netInfo.isInternetReachable === false;

  const [fading, setFading] = useState(false);
  const [title, setTitle] = useState(headerTitle);

  const { heartPressed } = useContext(SavedContext);

  const opacityAnim = useRef(new Animated.Value(1)).current;

  const transition = () => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: fadeTime,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: fadeTime,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: fadeTime,
        useNativeDriver: true,
        delay: delayTime,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: fadeTime,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!fading && !offline) {
      setFading(true);
      setTimeout(() => {
        setTitle("Log In to Save Listings");
      }, fadeTime);
      setTimeout(() => {
        setTitle(headerTitle);
      }, fadeTime * 3 + delayTime);
      setTimeout(() => {
        setFading(false);
      }, fadeTime * 4 + delayTime);
      transition();
    }
  }, [heartPressed]);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: color, opacity: opacityAnim },
        bannerStyle,
      ]}
    >
      <AppText style={[styles.text, textStyle]}>
        {offline ? "No Internet Connection" : title}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
});

export default AnimatedHeaderTitle;