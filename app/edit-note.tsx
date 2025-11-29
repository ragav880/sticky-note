import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addNote,
  updateNote,
  fetchNoteById,
  deleteNote,
} from "../src/db/notesDb";
import { Ionicons } from "@expo/vector-icons";

const COLORS = ["#fef3c7", "#bfdbfe", "#fecaca", "#bbf7d0", "#fde68a"]; 
// yellow, blue, red, green, orange

export default function EditNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [reminderEnabled] = useState(false); // not used yet, just kept
  const [color, setColor] = useState("#fef3c7");

  // 👉 Existing notes open in VIEW mode; new note opens in EDIT mode
  const [isEditing, setIsEditing] = useState(id ? false : true);

  const isScrolling = useRef(false);

  useEffect(() => {
    if (id) loadExistingNote();
  }, [id]);

  async function loadExistingNote() {
    const note = await fetchNoteById(id);

    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setDate(note.date);
      setColor(note.color || "#fef3c7");
    }
  }

  async function onSave() {
    if (!title || !date) {
      alert("Title & Date are required");
      return;
    }

    if (id) {
      await updateNote({
        id,
        title,
        content,
        date,
        reminder_enabled: reminderEnabled ? 1 : 0,
        reminder_id: null,
        color,
      });
    } else {
      await addNote({
        title,
        content,
        date,
        reminder_enabled: reminderEnabled ? 1 : 0,
        reminder_id: null,
        color,
      });
    }

    setIsEditing(false); // back to view mode
  }

  async function onDelete() {
    if (!id) return;

    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteNote(id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>{isEditing ? "Edit Note" : "Note"}</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* Save only in edit mode */}
          {isEditing && (
            <TouchableOpacity onPress={onSave}>
              <Ionicons name="checkmark-outline" size={32} color="green" />
            </TouchableOpacity>
          )}

          {/* Delete icon (only for existing notes) */}
          {id && (
            <TouchableOpacity onPress={onDelete}>
              <Ionicons name="trash-outline" size={32} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* COLOR PICKER (only edit mode) */}
      {isEditing && (
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: c,
                  borderWidth: c === color ? 3 : 1,
                  borderColor: c === color ? "#000" : "#555",
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* MAIN NOTE BACKGROUND */}
      <ScrollView
        style={[styles.noteContainer, { backgroundColor: color }]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => (isScrolling.current = true)}
        onScrollEndDrag={() => {
          setTimeout(() => {
            isScrolling.current = false;
          }, 150);
        }}
      >
        {/* VIEW MODE */}
        {!isEditing && (
          <Pressable
            onPress={() => {
              if (!isScrolling.current) {
                setIsEditing(true);
              }
            }}
          >
            <Text style={styles.titleView}>{title}</Text>
            <Text style={styles.contentView}>{content}</Text>
            <Text style={styles.dateView}>📅 {date}</Text>
          </Pressable>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, { height: 120 }]}
              placeholder="Content"
              multiline
              value={content}
              onChangeText={setContent}
            />

            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={date}
              onChangeText={setDate}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  heading: {
    fontSize: 26,
    fontWeight: "bold",
  },

  colorRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },

  colorCircle: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },

  noteContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 15,
    minHeight: 300,
  },

  titleView: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  contentView: {
    fontSize: 18,
    marginBottom: 20,
    lineHeight: 26,
  },
  dateView: {
    marginTop: 15,
    fontSize: 16,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#555",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#ffffffaa",
  },
});
