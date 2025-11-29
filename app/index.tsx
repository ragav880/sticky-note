import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";
import { Link, useFocusEffect, router } from "expo-router";
import NoteCard from "../src/components/NoteCard";
import { fetchTodayNotes } from "../src/db/notesDb";

export default function HomeScreen() {
  const [notes, setNotes] = useState([]);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  async function loadNotes() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // fetchTodayNotes needs todayStr passed correctly
    const result = await fetchTodayNotes(todayStr);
    setNotes(result);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today's Tasks</Text>

      {notes.length === 0 && (
        <Text style={styles.noNotes}>chandu yadav goddali 😴</Text>
      )}

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}   // FIX: ensure string id
        renderItem={({ item }) => (
          <NoteCard
            title={item.title}
            content={item.content}
            color={item.color}
            onDoublePress={() => {
              router.push({
                pathname: "/edit-note",
                params: { id: String(item.id) },   // FIX: id must be string
              });
            }}
          />
        )}
      />

      <View style={{ marginTop: 20 }}>
        <Link href="/all-notes" asChild>
          <Button title="ALL NOTES" />
        </Link>

        <View style={{ height: 10 }} />

        <Link
          href={{ pathname: "/edit-note", params: { id: "" } }}
          asChild
        >
          <Button title="Add New Note" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noNotes: {
    marginTop: 20,
    fontSize: 18,
    color: "#555",
  },
});
