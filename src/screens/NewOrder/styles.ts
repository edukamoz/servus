import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    width: '100%',
  },

  // Header
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  closeButton: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 20,
    cursor: 'pointer',
  } as any,

  content: {
    padding: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // Customer Select
  customerSelect: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    cursor: 'pointer',
  } as any,
  customerSelectEmpty: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  customerSelectActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginLeft: 8,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  customerAddress: {
    color: COLORS.textLight,
  },

  // Items List
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: { fontWeight: 'bold', color: COLORS.textDark },
  itemSubtitle: { fontSize: 12, color: COLORS.textLight },
  itemTotal: { fontWeight: 'bold', color: COLORS.textDark },
  trashButton: {
    cursor: 'pointer',
  } as any,

  // Form Add Item
  formCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },
  formTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.placeholder,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: COLORS.textDark,
  },
  row: { flexDirection: 'row', marginBottom: 12 },
  inputLabel: { fontSize: 12, color: COLORS.placeholder, marginBottom: 4 },

  // Type Selector
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 8,
  },
  typeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  typeButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeText: { fontWeight: 'bold', color: COLORS.placeholder },
  typeTextActive: { color: COLORS.primary },

  addButton: {
    backgroundColor: COLORS.textDark,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  addButtonText: { color: COLORS.white, fontWeight: 'bold' },

  // Footer
  footer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 32, // Extra padding para safe area
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerLabel: { color: COLORS.textLight },
  footerTotal: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    cursor: 'pointer',
  } as any,
  saveButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 },

  // Modal Clientes Interno
  modalContainer: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  modalClose: {
    color: '#2563eb',
    fontWeight: 'bold',
    cursor: 'pointer',
  } as any,
  customerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  avatarPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: { fontWeight: 'bold', color: COLORS.textLight },
  customerItemName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.textDark,
  },
  customerItemAddress: { color: COLORS.textLight },
});
