import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    Dimensions,
    Modal,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";

type PhotoItem = {
    uri: string;
};

const { width, height } = Dimensions.get("window");
const itemSize = width / 3;

export default function Detail() {
    const [capturedPhotos, setCapturedPhotos] = useState<PhotoItem[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
    const navigation = useNavigation();

    const loadSavedPhotos = useCallback(async () => {
        try {
            const savedPhotos = await AsyncStorage.getItem("capturedPhotos");
            if (savedPhotos) {
                setCapturedPhotos(JSON.parse(savedPhotos));
            }
        } catch (error) {
            console.error("Failed to load photos", error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            loadSavedPhotos();
        });
        return unsubscribe;
    }, [navigation, loadSavedPhotos]);

    const openPhoto = (item: PhotoItem) => {
        setSelectedPhoto(item);
    };

    const closePhoto = () => {
        setSelectedPhoto(null);
    };

    const renderItem = ({ item }: { item: PhotoItem }) => (
        <TouchableOpacity onPress={() => openPhoto(item)}>
            <Image source={{ uri: item.uri }} style={styles.photo} />
        </TouchableOpacity>
    );

    const renderFullScreenPhoto = () => (
        <Modal
            visible={selectedPhoto !== null}
            transparent={false}
            animationType="fade"
        >
            <SafeAreaView style={styles.fullScreenContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={closePhoto}>
                    <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
                <Image
                    source={{ uri: selectedPhoto?.uri }}
                    style={styles.fullScreenPhoto}
                    resizeMode="contain"
                />
            </SafeAreaView>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {capturedPhotos.length > 0 ? (
                <FlatList
                    data={capturedPhotos}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={3}
                />
            ) : (
                <Text style={styles.noPhotosText}>No photos captured yet.</Text>
            )}
            {renderFullScreenPhoto()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    photo: {
        width: itemSize,
        height: itemSize,
        margin: 2,
    },
    fullScreenContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
    fullScreenPhoto: {
        width: "100%",
        height: "100%",
    },
    closeButton: {
        position: "absolute",
        top: 30,
        right: 20,
        zIndex: 1,
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "bold",
    },
    noPhotosText: {
        fontSize: 18,
        color: "gray",
    },
});
