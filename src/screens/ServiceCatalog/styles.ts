import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    cursor: "pointer",
  } as any,
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark },

  content: { padding: 16 },

  // Formulário de Adição Rápida
  addCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  addTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 12,
    textTransform: "uppercase",
  },

  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: COLORS.textDark,
  },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },

  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    cursor: "pointer",
  } as any,
  typeButtonActive: {
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  typeText: { fontWeight: "bold", color: COLORS.textLight },
  typeTextActive: { color: COLORS.secondary },

  addButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
    cursor: "pointer",
  } as any,
  addButtonText: { color: "white", fontWeight: "bold" },

  // Lista
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.textDark },
  itemPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "bold",
    marginTop: 2,
  },
  itemType: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: "uppercase",
    marginTop: 2,
  },

  deleteButton: { padding: 8, cursor: "pointer" } as any,
});
