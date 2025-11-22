import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { initDB } from "../src/db/notesDb";
import { View, Text } from "react-native";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDB();  // wait for SQLite
      setDbReady(true);
    })();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading database...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="all-notes" options={{ title: "All Notes" }} />
      <Stack.Screen name="edit-note" options={{ title: "Edit Note" }} />
    </Stack>
  );
}
