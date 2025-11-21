import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    cursor: 'pointer',
    marginRight: 10,
  } as any,
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    flex: 1,
  },

  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 64,
    height: 64,
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    cursor: 'pointer',
  } as any,
  fabText: {
    color: 'white',
    fontSize: 36,
    marginTop: -4,
  },

  // Barra de Busca
  searchContainer: { padding: 16, paddingBottom: 0 },
  searchInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textDark,
  },

  // Lista
  listContent: { padding: 16 },
  customerCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  customerInfo: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },

  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { padding: 8, cursor: 'pointer' } as any,

  // Modal de Edição
  modalContainer: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  modalClose: {
    color: COLORS.primary,
    fontWeight: 'bold',
    cursor: 'pointer',
  } as any,
  modalForm: { padding: 20 },

  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    color: COLORS.textDark,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    cursor: 'pointer',
  } as any,
  saveText: { color: 'white', fontWeight: 'bold' },
});
