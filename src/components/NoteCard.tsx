import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRef } from "react";

export default function NoteCard({ title, content, color, onDoublePress }) {
  const lastTap = useRef(null);

  function handlePress() {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      onDoublePress && onDoublePress();
    }
    lastTap.current = now;
  }

  return (
    <Pressable onPress={handlePress} style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content} numberOfLines={3}>{content}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00000020",
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    marginTop: 5,
    fontSize: 16,
  },
});
