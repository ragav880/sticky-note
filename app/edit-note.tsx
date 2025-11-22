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
  Button,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addNote,
  updateNote,
  fetchNoteById,
  deleteNote,
} from "../src/db/notesDb";
import { Ionicons } from "@expo/vector-icons";

const COLORS = ["#fef3c7", "#bfdbfe", "#fecaca", "#bbf7d0", "#fde68a"];

export default function EditNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [color, setColor] = useState("#fef3c7");

  const [isEditing, setIsEditing] = useState(id ? false : true);

  const [showDatePicker, setShowDatePicker] = useState(false);

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
        reminder_enabled: 0,
        reminder_id: null,
        color,
      });
    } else {
      await addNote({
        title,
        content,
        date,
        reminder_enabled: 0,
        reminder_id: null,
        color,
      });
    }

    setIsEditing(false);
  }

  function onDateSelected(event, selectedDate) {
    setShowDatePicker(false);

    if (!selectedDate) return;

    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");

    setDate(`${yyyy}-${mm}-${dd}`);
  }

  async function onDelete() {
    if (!id) return;

    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(id);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>{isEditing ? "Edit Note" : "Note"}</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          {isEditing && (
            <TouchableOpacity onPress={onSave}>
              <Ionicons name="checkmark-outline" size={32} color="green" />
            </TouchableOpacity>
          )}

          {id && (
            <TouchableOpacity onPress={onDelete}>
              <Ionicons name="trash-outline" size={32} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* COLOR PICKER */}
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

      {/* MAIN NOTE AREA */}
      <ScrollView
        style={[styles.noteContainer, { backgroundColor: color }]}
        onScrollBeginDrag={() => (isScrolling.current = true)}
        onScrollEndDrag={() =>
          setTimeout(() => (isScrolling.current = false), 150)
        }
      >
        {/* VIEW MODE */}
        {!isEditing && (
          <Pressable
            onPress={() => {
              if (!isScrolling.current) setIsEditing(true);
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

            {/* DATE INPUT + ICON */}
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
              />

              <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* DATE PICKER */}
            {showDatePicker && (
              <DateTimePicker
                value={date ? new Date(date) : new Date()}
                mode="date"
                display="default"
                onChange={onDateSelected}
              />
            )}
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

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  calendarButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },
});
