import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

import AppText from "./AppText";

const height = Dimensions.get("window").height / 22;
const animationDuration = 300;

function TimeToCampusBanner({ minutes, mode, visible, colors }) {
  const positionAnim = useRef(new Animated.Value(-height)).current;
  const [initiaLoad, setInitialLoad] = useState(true);
  const [moving, setMoving] = useState(false);

  const raiseBanner = () => {
    Animated.timing(positionAnim, {
      toValue: 0,
      animationDuration: animationDuration,
    }).start();
  };

  const lowerBanner = () => {
    Animated.timing(positionAnim, {
      toValue: -height,
      animationDuration: animationDuration,
    }).start();
  };

  useEffect(() => {
    if (!initiaLoad) {
      if (visible) {
        raiseBanner();
      } else {
        lowerBanner();
      }
    } else {
      setInitialLoad(false);
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.navHeaderBackground, bottom: positionAnim },
      ]}
    >
      <AppText style={{ color: colors.navHeaderText }}>
        {minutes} minutes {mode} to campus
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    height: height,
    width: "100%",
    position: "absolute",
  },
});

export default TimeToCampusBanner;
