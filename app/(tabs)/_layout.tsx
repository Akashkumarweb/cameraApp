import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{tabBarActiveTintColor: "blue"}}>
            <Tabs.Screen 
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({color}) => (
                        <FontAwesome  size={28} name="camera" color={color} />
                    )
                }}
            />
            <Tabs.Screen 
                name="Detail"
                options={{
                    title: "Photos",
                    tabBarIcon: ({color}) => (
                        <FontAwesome  size={28} name="photo" color={color} />
                    )
                }}
            />
              <Tabs.Screen 
                name="SavedBarcodes"
                options={{
                    title: "Barcodes",
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="barcode" color={color} />
                }}
            />
        </Tabs>
    )
}