import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

import { styles } from './styles';
import { WebContainer } from '../../components/WebContainer';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, saveUserProfile, uploadLogo } from '../../services/db';
import { auth } from '../../lib/firebase';
import { ConfirmModal } from '../../components/ConfirmModal';
import { UserProfile } from '../../types';
import { COLORS } from '../../constants/colors';
import { PhoneInput } from '../../components/PhoneInput';

const formatCNPJ = (text: string) => {
  return text
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

export default function CompanyProfileScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados do Formulário
  const [logo, setLogo] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  // Estados de Senha
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [cnpj, setCnpj] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const profile = await getUserProfile(user!.uid);
    if (profile) {
      setBusinessName(profile.businessName || '');
      setPhone(profile.phone || '');
      setPixKey(profile.pixKey || '');
      setAddress(profile.address || '');
      setEmail(profile.email || '');
      setLogo(profile.logoUrl || null);
      setPhone(profile.phone || '');
      setCnpj(profile.cnpj || '');
      setPixKey(profile.pixKey || '');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user, loadData]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!businessName) return Alert.alert('Erro', 'O nome da empresa é obrigatório.');

    setSaving(true);
    try {
      let finalLogoUrl = logo;

      if (logo && (logo.startsWith('file') || logo.startsWith('blob'))) {
        finalLogoUrl = await uploadLogo(user!.uid, logo);
      }

      const data: UserProfile = {
        businessName,
        phone,
        pixKey,
        address,
        email,
        logoUrl: finalLogoUrl || undefined,
        cnpj,
      };

      await saveUserProfile(user!.uid, data);
      Alert.alert('Sucesso', 'Dados da empresa atualizados!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Erro', 'Preencha todos os campos de senha.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Erro', 'A nova senha e a confirmação não batem.');
    }
    if (newPassword.length < 6) {
      return Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres.');
    }

    setChangingPassword(true);
    try {
      if (auth.currentUser && user?.email) {
        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);

        await updatePassword(auth.currentUser, newPassword);

        setShowSuccessModal(true);

        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        Alert.alert('Erro', 'A senha antiga está incorreta.');
      } else {
        Alert.alert('Erro', 'Falha ao alterar senha. Tente novamente.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <WebContainer>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dados da Empresa</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 50 }} color={COLORS.primary} />
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* ÁREA DA FOTO DE PERFIL */}
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                <View style={styles.avatar}>
                  {logo ? (
                    <Image source={{ uri: logo }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="business" size={40} color="#cbd5e1" />
                  )}
                </View>
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              </TouchableOpacity>
              <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textLight }}>
                Toque para alterar logo
              </Text>
            </View>

            {/* DADOS GERAIS */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Informações do Negócio</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome do Negócio</Text>
                <TextInput
                  style={styles.input}
                  value={businessName}
                  onChangeText={setBusinessName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CNPJ</Text>
                <TextInput
                  style={styles.input}
                  value={cnpj}
                  onChangeText={(t) => setCnpj(formatCNPJ(t))}
                  keyboardType="numeric"
                  maxLength={18}
                  placeholder="00.000.000/0000-00"
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefone / WhatsApp</Text>
                <PhoneInput value={phone} onChangeText={setPhone} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Público</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Financeiro</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Chave PIX</Text>
                  <TextInput
                    style={styles.input}
                    value={pixKey}
                    onChangeText={setPixKey}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveText}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>

            {/* SEGURANÇA / SENHA */}
            <View style={[styles.card, { marginTop: 30, borderColor: COLORS.border }]}>
              <Text style={styles.cardTitle}>Segurança</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha Atual</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.inputPassword}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry={!showOldPassword}
                    placeholder="Digite sua senha atual"
                    placeholderTextColor={COLORS.placeholder}
                  />
                  <TouchableOpacity
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showOldPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Nova Senha</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="Mín 6 caracteres"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Confirmar</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Repita a senha"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.passwordButton}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color={COLORS.textDark} />
                ) : (
                  <Text style={styles.passwordButtonText}>Redefinir Senha</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
        )}

        <ConfirmModal
          visible={showSuccessModal}
          title="Tudo certo!"
          message="Sua senha foi alterada com segurança."
          confirmText="OK"
          showCancel={false}
          onConfirm={() => setShowSuccessModal(false)}
          onCancel={() => setShowSuccessModal(false)}
        />
      </SafeAreaView>
    </WebContainer>
  );
}
