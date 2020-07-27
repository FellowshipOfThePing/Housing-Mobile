// TODO:
// https://hackernoon.com/how-to-optimize-react-native-map-in-your-application-eeo3nib
// https://www.npmjs.com/package/react-native-map-clustering?ref=hackernoon.com

import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import MapView from "react-native-map-clustering";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";

import { mapDarkStyle, mapStandardStyle, markers } from "../model/mapData";
import useApi from "../hooks/useApi";
import listingsApi from "../api/listings";
import MapCard from "../components/MapCard";
import colors from "../config/colors";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = 220;
const CARD_WIDTH = width * 0.8;
const SPACING_FOR_CARD_INSET = width * 0.1 - 10;

const MapScreen = ({ navigation }) => {
  const theme = useTheme();
  const getListingsApi = useApi(listingsApi.getListings);
  const _map = useRef(null);

  useEffect(() => {
    getListingsApi.request();
  }, []);

  const state = {
    markers: markers,
    region: {
      latitude: markers[0].latitude,
      longitude: markers[0].longitude,
      latitudeDelta: 0.04864195044303443,
      longitudeDelta: 0.040142817690068,
    },
  };

  let mapIndex = 0;
  let mapAnimation = new Animated.Value(0);

  useEffect(() => {
    mapAnimation.addListener(({ value }) => {
      let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
      if (index >= state.markers.length) {
        index = state.markers.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      clearTimeout(regionTimeout);

      const regionTimeout = setTimeout(() => {
        if (mapIndex !== index) {
          mapIndex = index;
          const { latitude, longitude } = state.markers[index];
          _map.current.animateToRegion(
            {
              ...{ latitude, longitude },
              latitudeDelta: state.region.latitudeDelta,
              longitudeDelta: state.region.longitudeDelta,
            },
            350
          );
        }
      }, 10);
    });
  });

  const onMarkerPress = (index) => {
    const markerID = index;

    let x = markerID * CARD_WIDTH + markerID * 20;
    if (Platform.OS === "ios") {
      x = x - SPACING_FOR_CARD_INSET;
    }

    _flatList.current.getNode().scrollToOffset({ offset: x, animated: true });
  };

  const _flatList = useRef(null);

  return (
    <View style={styles.container}>
      <MapView
        ref={_map}
        initialRegion={state.region}
        style={styles.container}
        provider={PROVIDER_GOOGLE}
        customMapStyle={theme.dark ? mapDarkStyle : mapStandardStyle}
        clusterColor={colors.black}
      >
        {state.markers.map((marker, index) => {
          return (
            <Marker
              tracksViewChanges={false}
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              onPress={() => onMarkerPress(index)}
            >
              <View style={styles.outerCircle}>
                <View style={styles.innerCircle} />
              </View>
            </Marker>
          );
        })}
      </MapView>
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search here"
          placeholderTextColor="#000"
          autoCapitalize="none"
          style={{ flex: 1, padding: 0 }}
        />
        <Ionicons name="ios-search" size={20} />
      </View>
      <Animated.FlatList
        ref={_flatList}
        pagingEnabled
        scrollEventThrottle={1}
        horizontal
        showsVerticalScrollIndicator={false}
        data={getListingsApi.data}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 20}
        snapToAlignment="center"
        decelerationRate={0.9}
        disableIntervalMomentum
        style={styles.flatList}
        removeClippedSubviews={true}
        contentInset={{
          top: 0,
          left: SPACING_FOR_CARD_INSET,
          bottom: 0,
          right: SPACING_FOR_CARD_INSET,
        }}
        contentContainerStyle={{
          paddingHorizontal:
            Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0,
        }}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: mapAnimation,
                },
              },
            },
          ],
          { useNativeDriver: true }
        )}
        keyExtractor={(listing) => listing.raw_id.toString()}
        renderItem={({ item }) => (
          <MapCard
            listing={item}
            onPress={() =>
              navigation.navigate("ListingDetailNavigator", {
                screen: "ListingDetailScreen",
                params: { listing: item },
              })
            }
            style={{
              shadowOffset: { x: 2, y: -2 },
              height: CARD_HEIGHT,
              width: CARD_WIDTH,
            }}
          />
        )}
      ></Animated.FlatList>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(130,4,150, 0.9)",
  },
  ring: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(130,4,150, 0.3)",
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(130,4,150, 0.5)",
  },
  flatList: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  searchBox: {
    position: "absolute",
    marginTop: Platform.OS === "ios" ? 40 : 20,
    flexDirection: "row",
    backgroundColor: "#fff",
    width: "90%",
    alignSelf: "center",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  outerCircle: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
    backgroundColor: colors.primaryFade,
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
});