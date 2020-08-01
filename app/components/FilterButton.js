import React from "react";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function FilterButton({ size = 25, color = "white", onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <MaterialCommunityIcons
        name="filter-outline"
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
}

export default FilterButton;
