import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function SavedBarcodes() {
    const [barcodes, setBarcodes] = useState([]);
    const [isSharing, setIsSharing] = useState(false);

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
            await AsyncStorage.removeItem('savedBarcodes');
            setBarcodes([]);
        } catch (error) {
            console.error("Error clearing barcodes", error);
        }
    };

    const saveToFile = async () => {
        if (isSharing) {
            Alert.alert('Please wait', 'A sharing action is already in progress.');
            return;
        }

        const fileName = `GMB-BarCode-${new Date().getTime()}.txt`;
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
    
        try {
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(barcodes), {
                encoding: FileSystem.EncodingType.UTF8
            });
    
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('Sharing not available', 'Your platform does not support sharing files.');
                return;
            }
            
            setIsSharing(true);
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/plain', // Mime type can be changed depending on what type of file you are sharing
                dialogTitle: 'Share your barcode file',
                UTI: 'public.text' // For iOS
            });
            setIsSharing(false);
        } catch (error) {
            console.error('Failed to save or share file', error);
            Alert.alert('Error', 'Failed to save or share file');
            setIsSharing(false);
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