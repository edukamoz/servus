import React from 'react';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { COLORS } from '../../constants/colors';
import { WebContainer } from '../../components/WebContainer';

export default function SubscriptionScreen() {
  const navigation = useNavigation();

  const WHATSAPP_SUPPORT = '5515991815264';

  const handleSubscribe = () => {
    const message = 'Olá! Gostaria de fazer o upgrade para o Plano PRO do App Servus.';
    const link = `https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(message)}`;

    if (Platform.OS === 'web') {
      window.open(link, '_blank');
    } else {
      Linking.openURL(link);
    }
  };

  const CheckItem = ({ text }: { text: string }) => (
    <View style={styles.benefitItem}>
      <View style={{ backgroundColor: '#dcfce7', padding: 4, borderRadius: 50 }}>
        <Ionicons name="checkmark" size={16} color={COLORS.success} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );

  return (
    <WebContainer
      style={{
        backgroundColor: '#0f172a',
      }}
    >
      <View style={styles.container}>
        {/* Botão Fechar */}
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="diamond" size={60} color="#f59e0b" style={{ marginBottom: 16 }} />
          <Text style={styles.title}>Desbloqueie o Poder Total</Text>
          <Text style={styles.subtitle}>
            Elimine limites, profissionalize sua empresa e ganhe mais tempo.
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>Plano PRO</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Recomendado</Text>
                </View>
              </View>
              <View>
                <Text style={styles.planPrice}>R$ 29,90</Text>
                <Text style={styles.planPeriod}>/mês</Text>
              </View>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: '#f1f5f9',
                marginBottom: 20,
              }}
            />

            <CheckItem text="Ordens de Serviço Ilimitadas" />
            <CheckItem text="Gestão Completa de Clientes" />
            <CheckItem text="Relatórios Financeiros Mensais" />
            <CheckItem text="Fotos de Evidências (Antes/Depois)" />
            <CheckItem text="Assinatura Digital no App" />
            <CheckItem text="Catálogo de Preços Salvo" />
            <CheckItem text="Suporte Prioritário" />

            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
              <Text style={styles.subscribeText}>Assinar Agora</Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: '#64748b' }}>
                Cancelamento a qualquer momento.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.footer} onPress={handleSubscribe}>
            <Text style={styles.restoreText}>Dúvidas? Fale com o Suporte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </WebContainer>
  );
}
