import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 10,
    cursor: "pointer",
  } as any,
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark },

  // Seletor de Mês
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  monthButton: { padding: 10, cursor: "pointer" } as any,
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    textTransform: "capitalize",
  },

  content: { paddingHorizontal: 16 },

  // Cards de Resumo
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
    fontWeight: "bold",
  },
  summaryValue: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark },

  // Lista
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  orderRow: {
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
  orderCustomer: { fontSize: 16, fontWeight: "bold", color: COLORS.textDark },
  orderDate: { fontSize: 12, color: COLORS.textLight },
  orderStatus: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
    textTransform: "uppercase",
  },
  orderValue: { fontSize: 16, fontWeight: "bold", color: COLORS.primary },
  filtersContainer: { paddingHorizontal: 16, marginBottom: 16, gap: 10 },

  filterInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: COLORS.textDark,
  },

  filterRow: { flexDirection: "row", gap: 10 },

  // Botões de Status
  statusFilterScroll: { flexGrow: 0, marginBottom: 5 },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginRight: 8,
    cursor: "pointer",
  } as any,
  statusButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textLight,
  },
  statusButtonTextActive: { color: "white" },

  // Modal de Calendário
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: 300,
  },
  yearRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  yearText: { fontSize: 20, fontWeight: "bold", color: COLORS.textDark },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  monthItem: {
    width: "30%",
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  monthItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  monthItemText: { color: COLORS.textDark },
  monthItemTextActive: { color: "white", fontWeight: "bold" },
});
