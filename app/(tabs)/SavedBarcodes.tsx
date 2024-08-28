import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Button, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

export default function SavedBarcodes() {
    const [barcodes, setBarcodes] = useState([]);

    // useEffect(() => {
    //     const loadBarcodes = async () => {
    //         const savedBarcodes = await AsyncStorage.getItem('savedBarcodes');
    //         if (savedBarcodes) {
    //             setBarcodes(JSON.parse(savedBarcodes));
    //         }
    //     };

    //     loadBarcodes();
    // }, []);

    useEffect(() => {
        loadBarcodes();
    }, []);

    const loadBarcodes = async () => {
        const savedBarcodes = await AsyncStorage.getItem('savedBarcodes');
        if (savedBarcodes) {
            setBarcodes(JSON.parse(savedBarcodes));
        }
    };

    const clearBarcodes = async () => {
        try {
            await AsyncStorage.removeItem('savedBarcodes'); // Clear the AsyncStorage
            setBarcodes([]); // Reset the state to clear the displayed list
        } catch (error) {
            console.error("Error clearing barcodes", error);
        }
    };

    // Permission handling
    const requestStoragePermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: "Storage Permission Required",
                    message: "This app needs access to your storage to save barcodes",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const saveToFile = async () => {
        const fileName = `GMB-BarCode-${new Date().getTime()}.txt`; // Unique file name
        const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

        try {
            await RNFS.writeFile(path, JSON.stringify(barcodes), 'utf8');
            Alert.alert('Success', `Barcodes saved to file:\n${path}`);
        } catch (error) {
            console.error('Failed to save file', error);
            Alert.alert('Error', 'Failed to save file');
        }
    };
    

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <FlatList
                data={barcodes}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Text>{item}</Text>}
            />
            <Button title="Save to File" onPress={saveToFile} color="green" />
            <TouchableOpacity style={styles.clearButton} onPress={clearBarcodes}>
                <Text style={styles.clearButtonText}>Clear Barcodes</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    clearButton: {
        backgroundColor: 'red',
        padding: 10,
        marginTop: 20,
        borderRadius: 5
    },
    clearButtonText: {
        color: 'white',
        fontSize: 16
    }
});