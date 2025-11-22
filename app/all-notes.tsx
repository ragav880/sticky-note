import { useState, useCallback } from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import NoteCard from "../src/components/NoteCard";
import { fetchAllNotes } from "../src/db/notesDb";

export default function AllNotesScreen() {
  const [notes, setNotes] = useState([]);

  // Load notes from DB
  async function loadAllNotes() {
    const result = await fetchAllNotes();
    // Make sure all IDs are strings
    setNotes(result.map((n) => ({ ...n, id: String(n.id) })));
  }

  // Refresh screen on focus
  useFocusEffect(
    useCallback(() => {
      loadAllNotes();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>All Notes</Text>

      {notes.length === 0 && (
        <Text style={styles.noNotes}>No notes found 😶</Text>
      )}

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}   // FIX
        renderItem={({ item }) => (
          <NoteCard
            title={item.title}
            content={item.content}
            color={item.color}
            onDoublePress={() => {
              router.push({
                pathname: "/edit-note",
                params: { id: String(item.id) },  // FIX
              });
            }}
          />
        )}
      />

      <View style={{ marginTop: 20 }}>
        <Link href={{ pathname: "/edit-note", params: { id: "" } }} asChild>
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
  },
  noNotes: {
    marginTop: 20,
    fontSize: 18,
    color: "#555",
  },
});
