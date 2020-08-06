import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

import AppText from "./AppText";
import colors from "../config/colors";

function SliderSection({
  onChange,
  style,
  title,
  initialValues,
  snapped,
  changeFilterLow,
  changeFilterHigh,
  extremes,
  step = 1
}) {
  const [touched, setTouched] = useState(false);

  return (
    <View style={[styles.sliderSection, style]}>
      <AppText style={styles.sliderTitle}>{title}</AppText>
      <MultiSlider
        allowOverlap
        enableLabel={touched}
        snapped={snapped}
        containerStyle={{ alignSelf: "center" }}
        onValuesChangeStart={() => {
          setTouched(true);
        }}
        onValuesChange={(values) => {
          changeFilterLow(values[0]);
          changeFilterHigh(values[1]);
        }}
        onValuesChangeFinish={() => {
          setTouched(false);
        }}
        selectedStyle={{
          backgroundColor: colors.primary,
        }}
        values={initialValues}
        min={extremes[0]}
        max={extremes[1]}
        touchDimensions={{
          height: 40,
          width: 40,
          borderRadius: 20,
          slipDisplacement: 100,
        }}
        sliderLength={Dimensions.get("window").width * 0.8}
        step={step}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sliderSection: {
    height: "14%",
    width: "100%",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  sliderTitle: {
    fontWeight: "bold",
    fontSize: 20,
    paddingLeft: 20,
  },
});

export default SliderSection;
