import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 50,
    position: 'relative',
  },
  welcomeText: {
    color: COLORS.textLight,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userName: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  } as any,
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  // --- Grid Financeiro ---
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  // --- Grid de Ordens (Web Responsivo) ---
  ordersListContainer: {
    paddingBottom: 100,
  },

  card: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardCustomer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: COLORS.textLight,
    fontSize: 14,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  cardPrice: {
    color: COLORS.textDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDate: {
    color: COLORS.placeholder,
    fontSize: 12,
  },

  // --- FAB ---
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
  // --- Menu Dropdown (Perfil) ---
  menuContainer: {
    position: 'absolute',
    top: 70,
    right: 24,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 100,
  } as any,

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    cursor: 'pointer',
  } as any,
  menuItemHover: {
    backgroundColor: '#f1f5f9',
  },
  menuText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  menuTextDanger: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: 'red',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
});
