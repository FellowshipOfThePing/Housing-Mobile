import React, { useEffect, useRef, useState } from "react";
import { Animated, View, StyleSheet, FlatList, Dimensions } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  MapViewAnimated,
} from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";

import ActivityIndicator from "../components/ActivityIndicator";
import useApi from "../hooks/useApi";
import listingsApi from "../api/listings";
import MapCard from "../components/MapCard";
import CustomMarker from "../components/CustomMarker";
import colors from "../config/colors";

function MapScreen({ navigation, route }) {
  const getListingsApi = useApi(listingsApi.getListings);
  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const [markerPressed, setMarkerPressed] = useState(false);
  const [mapIndex, setMapIndex] = useState(0);
  let mapAnimation = new Animated.Value(0);

  const listing_data = getListingsApi.data.map((marker) => {
    return marker;
  });

  const addresses = getListingsApi.data.map((marker) => {
    return marker.address;
  });

  const waitForMapIndex = (newMapIndex) => {
    if (
      typeof newMapIndex !== "undefined" &&
      newMapIndex !== -1 &&
      newMapIndex !== mapIndex
    ) {
      console.log("New Map Index: " + newMapIndex);
      onMarkerPress(newMapIndex);
    } else {
      setTimeout(waitForMapIndex, 250);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (route.params) {
        if (route.params.sourceDetailScreen && listing_data.length > 0) {
          let newMapIndex = addresses.indexOf(route.params.listing.address);
          waitForMapIndex(newMapIndex);
        }
        route.params.sourceDetailScreen = false;
      }
    }, [route])
  );

  const { width, height } = Dimensions.get("window");
  const CARD_HEIGHT = 220;
  const CARD_WIDTH = width * 0.9;
  const SPACING_FOR_CARD_INSET = width * 0.05;

  const state = {
    region: {
      latitude: 44.583599,
      longitude: -123.272191,
      latitudeDelta: 0.04864195044303443,
      longitudeDelta: 0.040142817690068,
    },
  };

  useEffect(() => {});

  useEffect(() => {
    getListingsApi.request();
  }, []);

  useEffect(() => {
    if (getListingsApi.data.length > 0) {
      mapRef.current.animateToRegion(
        {
          latitude: getListingsApi.data[0].latitude,
          longitude: getListingsApi.data[0].longitude,
          latitudeDelta: state.region.latitudeDelta,
          longitudeDelta: state.region.longitudeDelta,
        },
        350
      );
    }
  }, [getListingsApi.data]);

  useEffect(() => {
    mapAnimation.addListener(({ value }) => {
      let index = Math.round(value / width);
      if (index >= listing_data.length) {
        index = listing_data.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      if (!markerPressed) {
        clearTimeout(regionTimeout);

        const regionTimeout = setTimeout(() => {
          if (mapIndex !== index) {
            setMapIndex(index);
            mapRef.current.animateToRegion(
              {
                latitude: listing_data[index].latitude,
                longitude: listing_data[index].longitude,
                latitudeDelta: state.region.latitudeDelta,
                longitudeDelta: state.region.longitudeDelta,
              },
              350
            );
          }
        }, 10);
      }
    });
  });

  const onMarkerPress = (index) => {
    const markerID = index;
    console.log("\nMarkerID: " + markerID);

    let offset = markerID * width;

    if (mapIndex !== markerID) {
      setMapIndex(markerID);
    }

    console.log("Current Object Price: " + listing_data[markerID].price_high);
    console.log("Current Object Beds: " + listing_data[markerID].beds);
    console.log("Current Object Baths: " + listing_data[markerID].baths);

    mapRef.current.animateToRegion(
      {
        latitude: listing_data[markerID].latitude,
        longitude: listing_data[markerID].longitude,
        latitudeDelta: state.region.latitudeDelta,
        longitudeDelta: state.region.longitudeDelta,
      },
      350
    );

    setMarkerPressed(true);

    setTimeout(() => {
      flatListRef.current.getNode().scrollToOffset({
        offset: offset,
        animated: true,
      });
    }, 10);

    setTimeout(() => {
      setMarkerPressed(false);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.container}
        provider={PROVIDER_GOOGLE}
        initialRegion={state.region}
      >
        {listing_data.map((marker, index) => {
          return (
            <CustomMarker
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              onPress={() => onMarkerPress(index)}
              tracksViewChanges={false}
            ></CustomMarker>
          );
        })}
      </MapView>
      <Animated.FlatList
        ref={flatListRef}
        data={listing_data}
        horizontal
        pagingEnabled
        removeClippedSubviews={false}
        scrollEventThrottle={1}
        style={styles.flatList}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal:
            Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0,
        }}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index: index,
        })}
        contentInset={{
          top: 0,
          left: SPACING_FOR_CARD_INSET,
          bottom: 0,
          right: SPACING_FOR_CARD_INSET,
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
        ListEmptyComponent={() => (
          <View
            style={[
              styles.defaultCard,
              {
                height: CARD_HEIGHT,
                width: CARD_WIDTH,
                marginHorizontal: width * 0.05,
              },
            ]}
          >
            <ActivityIndicator visible={true} />
          </View>
        )}
        keyExtractor={(listing, index) => index.toString()}
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
              marginHorizontal: width * 0.05,
            }}
          />
        )}
      ></Animated.FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  defaultCard: {
    elevation: 2,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    overflow: "hidden",
    borderRadius: 15,
    shadowOffset: { x: 2, y: -2 },
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapScreen;
