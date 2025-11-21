import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import { WebContainer } from '../../components/WebContainer';
import { getMyOrders, getUserProfile, checkMonthlyLimit } from '../../services/db';
import { UserProfile, WorkOrder } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { COLORS } from '../../constants/colors';

const OrderCard = ({ item, onPress }: { item: WorkOrder; onPress: () => void }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return { bg: COLORS.successBg, text: COLORS.success, label: 'Pago' };
      case 'completed':
        return { bg: '#e0f2fe', text: '#0284c7', label: 'Concluído' };
      case 'open':
        return { bg: COLORS.warningBg, text: COLORS.warning, label: 'Aberto' };
      default:
        return { bg: COLORS.draftBg, text: COLORS.textLight, label: 'Rascunho' };
    }
  };
  const statusConfig = getStatusStyle(item.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardCustomer}>{item.customer_name}</Text>

        <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.badgeText, { color: statusConfig.text }]}>{statusConfig.label}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.items && item.items.length > 0
          ? item.items.map((i) => i.title).join(', ')
          : 'Sem itens registrados'}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>R$ {item.total?.toFixed(2)}</Text>
        <Text style={styles.cardDate}>
          {item.date ? item.date.split('-').reverse().join('/') : '-'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingLimit, setCheckingLimit] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [financeSummary, setSummary] = useState({
    totalMonth: 0,
    toReceive: 0,
  });

  const handleLogout = () => {
    setIsMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleProfile = () => {
    setIsMenuOpen(false);
    navigation.navigate('CompanyProfile');
  };

  const handleNewOrderPress = async () => {
    if (!user?.uid) return;

    setCheckingLimit(true);
    try {
      const canCreate = await checkMonthlyLimit(user.uid);

      if (canCreate) {
        navigation.navigate('NewOrder');
      } else {
        setShowLimitModal(true);
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível verificar seu plano.', error);
    } finally {
      setCheckingLimit(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, profileData] = await Promise.all([
        getMyOrders(user!.uid),
        getUserProfile(user!.uid),
      ]);
      setOrders(ordersData);
      setProfile(profileData);
      calculateSummary(ordersData);
    } catch (error) {
      console.error('Erro ao carregar home:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        loadData();
      }
    }, [user, loadData]),
  );

  const calculateSummary = (data: WorkOrder[]) => {
    const received = data
      .filter((o) => o.status === 'paid')
      .reduce((acc, curr) => acc + (curr.total || 0), 0);

    const pending = data
      .filter((o) => o.status === 'open' || o.status === 'completed')
      .reduce((acc, curr) => acc + (curr.total || 0), 0);

    setSummary({
      totalMonth: received,
      toReceive: pending,
    });
  };

  return (
    <WebContainer>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo,</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {profile?.businessName || 'Técnico'}
            </Text>
          </View>

          {/* Botão do Avatar (Toggle Menu) */}
          <TouchableOpacity
            style={[styles.avatar, { overflow: 'hidden' }]}
            onPress={() => setIsMenuOpen(!isMenuOpen)}
            activeOpacity={0.7}
          >
            {profile?.logoUrl ? (
              <Image
                source={{ uri: profile.logoUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {profile?.businessName?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* MENU DROPDOWN */}
        {isMenuOpen && (
          <View style={[styles.menuContainer]}>
            {/* Opção: Dados da Empresa */}
            <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
              <Ionicons name="business-outline" size={20} color={COLORS.textLight} />
              <Text style={styles.menuText}>Dados da Empresa</Text>
            </TouchableOpacity>

            {/* Opção: Meus Preços */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('ServiceCatalog');
              }}
            >
              <Ionicons name="pricetag-outline" size={20} color="#64748b" />
              <Text style={styles.menuText}>Meus Preços</Text>
            </TouchableOpacity>

            {/* Opção: Gerenciar Clientes */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('Customers');
              }}
            >
              <Ionicons name="people-outline" size={20} color="#64748b" />
              <Text style={styles.menuText}>Gerenciar Clientes</Text>
            </TouchableOpacity>

            {/* Opção: Relatórios Financeiros */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('Financial');
              }}
            >
              <Ionicons name="bar-chart-outline" size={20} color="#64748b" />
              <Text style={styles.menuText}>Relatórios Financeiros</Text>
            </TouchableOpacity>

            {/* Opção: PRO */}
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: '#fffbeb' }]}
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('Subscription');
              }}
            >
              <Ionicons name="diamond" size={20} color="#d97706" />
              <Text style={[styles.menuText, { color: '#d97706', fontWeight: 'bold' }]}>
                Seja PRO
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Opção: Sair */}
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
              <Text style={styles.menuTextDanger}>Sair do App</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Resumo Financeiro Dinâmico */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: COLORS.primary }]}>
              <Text style={[styles.summaryLabel, { color: '#bfdbfe' }]}>A receber</Text>
              <Text style={[styles.summaryValue, { color: 'white' }]}>
                R$ {financeSummary.toReceive.toFixed(2)}
              </Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: COLORS.textLight }]}>Total Gerado</Text>
              <Text style={[styles.summaryValue, { color: COLORS.black }]}>
                R$ {financeSummary.totalMonth.toFixed(2)}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: COLORS.textLight }]}>Ordens Recentes</Text>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.ordersListContainer}>
              {orders.length === 0 ? (
                <Text
                  style={{
                    textAlign: 'center',
                    color: COLORS.placeholder,
                    marginTop: 20,
                  }}
                >
                  Nenhuma O.S. encontrada. {'\n'}Clique no + para criar a primeira.
                </Text>
              ) : (
                orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    item={order}
                    onPress={() => navigation.navigate('OrderDetails', { order })}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* Botão Flutuante */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={handleNewOrderPress}
          disabled={checkingLimit}
        >
          {checkingLimit ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.fabText}>+</Text>
          )}
        </TouchableOpacity>

        <ConfirmModal
          visible={showLogoutModal}
          title="Sair da Conta"
          message="Tem a certeza que deseja encerrar sua sessão? Você precisará fazer login novamente."
          confirmText="Sair Agora"
          cancelText="Ficar"
          isDanger={true} // Botão vermelho
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={() => {
            setShowLogoutModal(false);
            signOut();
          }}
        />

        <ConfirmModal
          visible={showLimitModal}
          title="Limite Atingido 🔒"
          message="Você atingiu o limite gratuito de 5 Ordens neste mês. Faça o upgrade para continuar faturando!"
          confirmText="Ver Plano PRO"
          cancelText="Cancelar"
          onCancel={() => setShowLimitModal(false)}
          onConfirm={() => {
            setShowLimitModal(false);
            navigation.navigate('Subscription');
          }}
        />
      </SafeAreaView>
    </WebContainer>
  );
}
