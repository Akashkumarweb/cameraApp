import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from "react-native";
import { CameraView, useCameraPermissions, CameraCapturedPicture, BarcodeScanningResult } from "expo-camera";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface Photo {
    uri: string;
}

export default function CameraTab() {
    const [facing, setFacing] = useState<"back" | "front">("back");
    const [zoom, setZoom] = useState(0);
    const [capturedPhotos, setCapturedPhotos] = useState<Array<{ uri: string }>>([]);
    const [permission, requestPermission] = useCameraPermissions();
    const [isBarcodeMode, setIsBarcodeMode] = useState(false);
    const [barcodeResult, setBarcodeResult] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);
    const [lastScanTime, setLastScanTime] = useState(0);
    const scanInterval = 3000; // 3000 milliseconds or 3 seconds between scans
    const [focusAreaSize, setFocusAreaSize] = useState({ width: 200, height: 200 });


    useEffect(() => {
        loadSavedPhotos();
    }, []);

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

    const savePhoto = useCallback(
        async (newPhoto: { uri: string }) => {
            try {
                const updatedPhotos = [newPhoto, ...capturedPhotos];
                await AsyncStorage.setItem("capturedPhotos", JSON.stringify(updatedPhotos));
                setCapturedPhotos(updatedPhotos);
            } catch (error) {
                console.error("Failed to save photo", error);
            }
        },
        [capturedPhotos]
    );

    const toggleCameraFacing = useCallback(() => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    }, []);

    const handleZoomChange = useCallback((value: number) => {
        setZoom(value);
    }, []);

    const takePicture = useCallback(async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1,
                base64: false,
                exif: false,
            });
    
            if (photo) {
                await savePhoto({ uri: photo.uri });
            } else {
                console.error("Failed to capture photo, photo is undefined");
            }
        }
    }, [savePhoto]);

    const toggleBarcodeMode = useCallback(() => {
        setIsBarcodeMode((prev) => !prev);
    }, []);

    const handleBarCodeScanned = useCallback(({ type, data }: BarcodeScanningResult) => {
        const now = Date.now();
        if (now - lastScanTime > scanInterval) {
            let newSize;
            switch (type) {
                case 'qr':
                    newSize = { width: 200, height: 200 };
                    break;
                case 'ean13':
                case 'ean8':
                    newSize = { width: 300, height: 100 };
                    break;
                default:
                    newSize = { width: 200, height: 200 };
                    break;
            }
    
            setFocusAreaSize(newSize);
            setBarcodeResult(data);
            setLastScanTime(now);
        }
    }, [lastScanTime, scanInterval, setFocusAreaSize, setBarcodeResult]);
    

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text >
                    We need your permission to show the camera
                </Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    

    const saveBarcode = async (barcode: string) => {
        if (!barcode) {
            console.error("No barcode to save");
            return;
        }
        console.log("Saving barcode:", barcode); // Debug: Check if the barcode is being passed correctly
        try {
            const savedBarcodesJson = await AsyncStorage.getItem('savedBarcodes');
            let savedBarcodes = savedBarcodesJson ? JSON.parse(savedBarcodesJson) : [];
            if (!savedBarcodes.includes(barcode)) {
                savedBarcodes.push(barcode);
                await AsyncStorage.setItem('savedBarcodes', JSON.stringify(savedBarcodes));
                setBarcodeResult(null);  // Close modal after saving
                Alert.alert('Success', 'Barcode saved successfully');
            } else {
                Alert.alert('Notice', 'Barcode already saved');
            }
        } catch (error) {
            console.error("Failed to save barcode", error);
            Alert.alert('Error', 'Failed to save barcode');
        }
    };
    
    
    
    

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                zoom={zoom}
                barcodeScannerSettings={{
                    barcodeTypes: [
                        "qr",
                        "ean13",
                        "ean8",
                        "pdf417",
                        "aztec",
                        "datamatrix",
                    ],
                }}
                onBarcodeScanned={isBarcodeMode ? handleBarCodeScanned : undefined}
            >
                <View style={[
                    styles.focusArea, 
                    { 
                        width: focusAreaSize.width, 
                        height: focusAreaSize.height,
                        transform: [
                            { translateX: -(focusAreaSize.width / 2) }, 
                            { translateY: -(focusAreaSize.height / 2) }
                        ]
                    }
                ]} />

                <View style={styles.controlsContainer}>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                            <Text style={styles.buttonText}>Flip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={toggleBarcodeMode}>
                            <Text style={styles.buttonText}>
                                {isBarcodeMode ? "Photo Mode" : "Barcode Mode"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.row}>
                        <Text>Zoom: {zoom.toFixed(1)}x</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={1}
                            value={zoom}
                            onValueChange={handleZoomChange}
                        />
                    </View>
                    {!isBarcodeMode && (
                        <View style={styles.row}>
                            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                                <Text style={styles.captureButtonText}>Take Photo</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </CameraView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!barcodeResult}
                onRequestClose={() => setBarcodeResult(null)}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Barcode Detected:</Text>
                    <Text style={styles.barcodeText}>{barcodeResult}</Text>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setBarcodeResult(null)}
                    >
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonSave]}
                        onPress={() => {
                            if (barcodeResult) {
                                saveBarcode(barcodeResult);
                            } else {
                                console.error("No barcode to save");
                            }
                        }}
                    >
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>

                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    camera: {
        flex: 1,
        width: "100%",
    },
    controlsContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        padding: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    button: {
        padding: 10,
        backgroundColor: "blue",
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
    },
    slider: {
        flex: 1,
        marginLeft: 10,
    },
    captureButton: {
        padding: 15,
        backgroundColor: "red",
        borderRadius: 50,
    },
    captureButtonText: {
        color: "white",
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 15,
        textAlign: "center",
        fontWeight: "bold",
    },
    barcodeText: {
        fontSize: 16,
        marginBottom: 15,
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    buttonSave: {
        backgroundColor: "#4CAF50",  // Green color for the save button
    },
    focusArea: {
        borderWidth: 2,
        borderColor: 'red',
        position: 'absolute',
        top: '50%',
        left: '50%',
       
    },
});
