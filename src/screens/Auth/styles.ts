import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoImage: {
    width: 300,
    height: 100,
    marginBottom: 10,
  },
  tagline: { color: COLORS.textLight, marginTop: 5 },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: { fontWeight: 'bold', color: '#475569', marginBottom: 5 },
  input: {
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#003366' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  inputPassword: {
    flex: 1,
    padding: 15,
    color: COLORS.black,
  },
  eyeIcon: {
    padding: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
  },
});
