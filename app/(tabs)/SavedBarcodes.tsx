import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SavedBarcodes() {
    const [barcodes, setBarcodes] = useState([]);

    useEffect(() => {
        const loadBarcodes = async () => {
            const savedBarcodes = await AsyncStorage.getItem('savedBarcodes');
            if (savedBarcodes) {
                setBarcodes(JSON.parse(savedBarcodes));
            }
        };

        loadBarcodes();
    }, []);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <FlatList
                data={barcodes}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Text>{item}</Text>}
            />
        </View>
    );
}
