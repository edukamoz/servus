import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    cursor: 'pointer',
  } as any,
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },

  content: { padding: 16 },

  // Status Card
  statusCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },

  // Customer Card
  sectionCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  customerName: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  customerInfo: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },

  // Items List
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemTitle: { fontWeight: 'bold', color: COLORS.textDark, flex: 1 },
  itemSub: { fontSize: 12, color: COLORS.textLight },
  itemPrice: { fontWeight: 'bold', color: COLORS.textDark },

  // Total Section
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },

  // Actions Buttons
  actionsContainer: { marginTop: 24, gap: 12 },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    cursor: 'pointer',
  } as any,

  primaryAction: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  primaryActionText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },

  secondaryActionText: {
    color: COLORS.textDark,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  deleteActionText: { color: COLORS.danger, fontWeight: 'bold', marginLeft: 8 },
  photosSection: {
    marginTop: 16,
  },

  // Grid de botões para adicionar
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addPhotoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.textLight,
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
  } as any,
  addPhotoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginLeft: 8,
  },

  // Grid de imagens
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e2e8f0',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  photoBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  deletePhoto: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.danger,
    padding: 6,
    borderRadius: 20,
    cursor: 'pointer',
  } as any,
});
