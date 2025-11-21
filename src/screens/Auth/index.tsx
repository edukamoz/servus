import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { auth } from '../../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { styles } from './styles';
import { WebContainer } from '../../components/WebContainer';
import { Ionicons } from '@expo/vector-icons';
import { saveUserProfile, uploadLogo } from '../../services/db';
import * as ImagePicker from 'expo-image-picker';
import { ConfirmModal } from '../../components/ConfirmModal';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState<string | null>(null);

  const cnpjRef = React.useRef<TextInput>(null);
  const phoneRef = React.useRef<TextInput>(null);
  const emailRef = React.useRef<TextInput>(null);
  const passwordRef = React.useRef<TextInput>(null);
  const confirmPasswordRef = React.useRef<TextInput>(null);

  const [, setResetEmailSent] = useState(false);

  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const handleCnpjChange = (text: string) => setCnpj(formatCNPJ(text));

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorModal({
        visible: true,
        title: 'Email necessário',
        message: 'Digite seu email no campo acima para recuperar a senha.',
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setErrorModal({
        visible: true,
        title: 'Email Enviado',
        message: `Enviamos um link de recuperação para: ${email}.\nVerifique sua caixa de entrada e spam.`,
      });
    } catch (error: any) {
      let msg = error.message;
      if (error.code === 'auth/user-not-found') msg = 'Este email não está cadastrado.';
      if (error.code === 'auth/invalid-email') msg = 'Email inválido.';

      setErrorModal({ visible: true, title: 'Erro', message: msg });
    } finally {
      setLoading(false);
    }
  };

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

  async function handleAuth() {
    if (!email || !password) return Alert.alert('Erro', 'Preencha todos os campos');
    setLoading(true);

    try {
      if (isSignUp) {
        // Validações de Cadastro
        if (!email || !password || !businessName) {
          throw {
            code: 'custom/missing-fields',
            message: 'Preencha todos os campos obrigatórios.',
          };
        }
        if (password !== confirmPassword) {
          throw {
            code: 'custom/password-mismatch',
            message: 'As senhas não conferem.',
          };
        }
        if (cnpj && cnpj.length < 14) {
          throw { code: 'custom/invalid-cnpj', message: 'CNPJ inválido.' };
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        let uploadedLogoUrl: string | undefined = undefined;
        if (logo) {
          uploadedLogoUrl = await uploadLogo(uid, logo);
        }

        await saveUserProfile(userCredential.user.uid, {
          businessName,
          address: '',
          pixKey: '',
          email,
          phone,
          ...(uploadedLogoUrl && { logoUrl: uploadedLogoUrl }),
          cnpj: cnpj,
        });

        if (userCredential.user) {
          await sendEmailVerification(userCredential.user);
          await signOut(auth);
        }

        Alert.alert(
          'Verifique seu Email',
          'Conta criada! Enviamos um link para seu email. Confirme-o e faça login para entrar.',
        );

        setIsSignUp(false);
      } else {
        if (!email || !password)
          throw {
            code: 'custom/missing-fields',
            message: 'Informe email e senha.',
          };

        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (!userCredential.user.emailVerified) {
          await signOut(auth); // Desloga na hora
          throw {
            code: 'custom/email-not-verified',
            message: 'Verifique seu email antes de entrar.',
          };
        }
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      let msg = error.message || 'Ocorreu um erro';
      if (error.code === 'custom/email-not-verified') msg = error.message;
      if (error.code === 'custom/missing-fields') msg = error.message;
      if (error.code === 'custom/password-mismatch') msg = error.message;
      if (error.code === 'custom/invalid-cnpj') msg = error.message;
      if (error.code === 'auth/invalid-email') msg = 'Email inválido';
      if (error.code === 'auth/user-not-found') msg = 'Usuário não encontrado';
      if (error.code === 'auth/wrong-password') msg = 'Senha incorreta';
      if (error.code === 'auth/email-already-in-use') msg = 'Email já cadastrado';
      setErrorModal({ visible: true, title: 'Atenção', message: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <WebContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo_longa.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Seu escritório no bolso</Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <>
                <View style={styles.avatarContainer}>
                  <TouchableOpacity onPress={pickImage} style={styles.avatar}>
                    {logo ? (
                      <Image source={{ uri: logo }} style={styles.avatarImage} />
                    ) : (
                      <Ionicons name="camera-outline" size={32} color={COLORS.placeholder} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.avatarText}>Logo (Opcional)</Text>
                </View>

                <Text style={styles.label}>Nome da Empresa *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Silva Refrigeração"
                  placeholderTextColor={COLORS.placeholder}
                  value={businessName}
                  onChangeText={setBusinessName}
                  returnKeyType="next"
                  onSubmitEditing={() => cnpjRef.current?.focus()}
                  blurOnSubmit={false}
                />

                <Text style={styles.label}>CNPJ (Opcional)</Text>
                <TextInput
                  ref={cnpjRef}
                  style={styles.input}
                  placeholder="00.000.000/0000-00"
                  placeholderTextColor={COLORS.placeholder}
                  value={cnpj}
                  onChangeText={handleCnpjChange}
                  keyboardType="numeric"
                  maxLength={18}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  blurOnSubmit={false}
                />

                <Text style={styles.label}>Telefone / WhatsApp (Opcional)</Text>
                <PhoneInput
                  ref={phoneRef}
                  value={phone}
                  onChangeText={setPhone}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </>
            )}
            <Text style={styles.label}>Email *</Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="tecnico@exemplo.com"
              placeholderTextColor={COLORS.placeholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Senha *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordRef}
                style={styles.inputPassword}
                placeholder="******"
                placeholderTextColor={COLORS.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType={isSignUp ? 'next' : 'go'}
                onSubmitEditing={() => {
                  if (isSignUp) {
                    confirmPasswordRef.current?.focus();
                  } else {
                    handleAuth();
                  }
                }}
                blurOnSubmit={!isSignUp}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <>
                <Text style={styles.label}>Confirmar Senha *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.inputPassword}
                    placeholder="Repita a senha"
                    placeholderTextColor={COLORS.placeholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    returnKeyType="go"
                    onSubmitEditing={handleAuth}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color={COLORS.textLight}
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {!isSignUp && (
              <TouchableOpacity
                style={{ alignSelf: 'flex-end', marginBottom: 20, padding: 5 }}
                onPress={handleForgotPassword}
              >
                <Text style={{ color: '#003366', fontWeight: 'bold', fontSize: 14 }}>
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>{isSignUp ? 'Criar Conta Grátis' : 'Entrar'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.switchButton}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Já tem conta? Faça Login' : 'Não tem conta? Cadastre-se'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <ConfirmModal
          visible={errorModal.visible}
          title={errorModal.title}
          message={errorModal.message}
          confirmText="Entendi"
          showCancel={false} // Apenas um botão de OK
          onConfirm={() => setErrorModal({ ...errorModal, visible: false })}
          onCancel={() => setErrorModal({ ...errorModal, visible: false })}
          isDanger={true} // Título ou botão em vermelho para chamar atenção (opcional)
        />
      </KeyboardAvoidingView>
    </WebContainer>
  );
}
