import { Platform, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'rgba(0,0,0,0.5)' : COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.background,
    width: Platform.OS === 'web' ? '90%' : '100%',
    maxWidth: 600,
    height: Platform.OS === 'web' ? 500 : '100%',
    borderRadius: Platform.OS === 'web' ? 12 : 0,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  cancelText: { color: COLORS.primary, fontSize: 16 },

  canvasContainer: { flex: 1, backgroundColor: 'white' },
  webCanvasWrapper: { flex: 1, width: '100%', height: '100%' }, // Importante para Web

  footer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  clearButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  clearText: { color: COLORS.textDark, fontWeight: 'bold' },
  confirmButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  confirmText: { color: COLORS.white, fontWeight: 'bold' },
});
