import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './styles';
import { COLORS } from '../../constants/colors';
import { WebContainer } from '../../components/WebContainer';
import { useAuth } from '../../context/AuthContext';
import { getOrdersByMonth } from '../../services/db';
import { WorkOrder } from '../../types';
import { PieChart } from 'react-native-gifted-charts';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const STATUS_TRANSLATIONS: Record<string, string> = {
  all: 'Todos',
  open: 'Aberto',
  completed: 'Concluído',
  paid: 'Pago',
  draft: 'Rascunho',
};

export default function FinancialScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [, setOrders] = useState<WorkOrder[]>([]);

  const [allOrders, setAllOrders] = useState<WorkOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);

  // Estado do Mês Atual (0 = Janeiro, 11 = Dezembro)
  const [currentDate, setCurrentDate] = useState(new Date());

  const [, setCount] = useState(0);

  // Filtros
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modal Calendário
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  // Totais (Baseado nos filtrados)
  const [totalInvoiced, setTotalInvoiced] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getOrdersByMonth(
        user.uid,
        currentDate.getMonth(),
        currentDate.getFullYear(),
      );
      setOrders(data);
      setAllOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, user?.uid]);

  useEffect(() => {
    loadData();
  }, [currentDate, loadData]);

  const applyFilters = useCallback(() => {
    let result = allOrders;

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter((o) => o.customer_name.toLowerCase().includes(lower));
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (minPrice) {
      result = result.filter((o) => o.total >= parseFloat(minPrice.replace(',', '.')));
    }
    if (maxPrice) {
      result = result.filter((o) => o.total <= parseFloat(maxPrice.replace(',', '.')));
    }

    setFilteredOrders(result);
    calculateTotals(result);
  }, [allOrders, maxPrice, minPrice, searchText, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [searchText, statusFilter, minPrice, maxPrice, allOrders, applyFilters]);

  const calculateTotals = (data: WorkOrder[]) => {
    let invoiced = 0;
    let pending = 0;

    data.forEach((o) => {
      // Somamos tudo no "Faturado"
      invoiced += o.total;
      // "A Receber" são os que não estão pagos
      if (o.status !== 'paid') {
        pending += o.total;
      }
    });

    setTotalInvoiced(invoiced);
    setTotalPending(pending);
    setCount(data.length);
  };

  const pieData = [
    { value: totalInvoiced - totalPending, color: COLORS.success, text: 'Rec' },
    { value: totalPending, color: COLORS.warning, text: 'Pen' },
  ];

  // Verifica se tem dados para não mostrar gráfico vazio
  const hasData = totalInvoiced > 0;

  const getStatusColor = (status: string) => {
    if (status === 'paid') return COLORS.success;
    if (status === 'open') return COLORS.warning;
    return COLORS.textLight;
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(pickerYear);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  return (
    <WebContainer>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Relatórios</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 50 }} size="large" color={COLORS.primary} />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 50 }}
            // ALTERADO: Todo o topo da tela agora faz parte da lista rolável
            ListHeaderComponent={
              <>
                {/* Seletor de Mês */}
                <TouchableOpacity
                  style={styles.monthSelector}
                  onPress={() => {
                    setPickerYear(currentDate.getFullYear());
                    setShowDatePicker(true);
                  }}
                >
                  <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.monthText}>
                    {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
                </TouchableOpacity>

                <View style={styles.content}>
                  {/* Cards de Resumo */}
                  <View style={styles.summaryRow}>
                    <View
                      style={[
                        styles.summaryCard,
                        { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
                      ]}
                    >
                      <Text style={[styles.summaryLabel, { color: '#d97706' }]}>PENDENTE</Text>
                      <Text style={[styles.summaryValue, { color: '#d97706' }]}>
                        R$ {totalPending.toFixed(2)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.summaryCard,
                        { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
                      ]}
                    >
                      <Text style={[styles.summaryLabel, { color: '#0284c7' }]}>
                        TOTAL (LISTADO)
                      </Text>
                      <Text style={[styles.summaryValue, { color: '#0284c7' }]}>
                        R$ {totalInvoiced.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Gráfico */}
                  {hasData && (
                    <View
                      style={{
                        alignItems: 'center',
                        marginBottom: 30,
                        backgroundColor: 'white',
                        padding: 20,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: COLORS.textLight,
                          marginBottom: 20,
                        }}
                      >
                        STATUS DOS RECEBIMENTOS
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 40 }}>
                        <PieChart
                          data={pieData}
                          donut
                          radius={60}
                          innerRadius={40}
                          innerCircleColor={'white'}
                        />
                        <View>
                          <View
                            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                          >
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: COLORS.success,
                                marginRight: 8,
                              }}
                            />
                            <Text style={{ color: COLORS.textDark, fontWeight: 'bold' }}>
                              Recebido
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: COLORS.warning,
                                marginRight: 8,
                              }}
                            />
                            <Text style={{ color: COLORS.textDark, fontWeight: 'bold' }}>
                              Pendente
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Filtros */}
                  <View style={styles.filtersContainer}>
                    <TextInput
                      style={[styles.filterInput, { marginBottom: 10 }]}
                      placeholder="Buscar cliente..."
                      value={searchText}
                      onChangeText={setSearchText}
                      placeholderTextColor={COLORS.placeholder}
                    />

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.statusFilterScroll}
                    >
                      {['all', 'open', 'completed', 'paid'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            statusFilter === status && styles.statusButtonActive,
                          ]}
                          onPress={() => setStatusFilter(status)}
                        >
                          <Text
                            style={[
                              styles.statusButtonText,
                              statusFilter === status && styles.statusButtonTextActive,
                            ]}
                          >
                            {STATUS_TRANSLATIONS[status] || status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <View style={styles.filterRow}>
                      <TextInput
                        style={[styles.filterInput, { flex: 1 }]}
                        placeholder="Min R$"
                        keyboardType="numeric"
                        value={minPrice}
                        onChangeText={setMinPrice}
                        placeholderTextColor={COLORS.placeholder}
                      />
                      <TextInput
                        style={[styles.filterInput, { flex: 1 }]}
                        placeholder="Max R$"
                        keyboardType="numeric"
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                        placeholderTextColor={COLORS.placeholder}
                      />
                    </View>
                  </View>

                  <Text style={styles.listTitle}>Lançamentos ({filteredOrders.length})</Text>
                </View>
              </>
            }
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
                Nenhum resultado encontrado.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: 16 }}>
                <View style={styles.orderRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.orderCustomer}>{item.customer_name}</Text>
                    <Text
                      style={{ fontSize: 12, color: '#64748b', marginVertical: 2 }}
                      numberOfLines={1}
                    >
                      {item.items?.map((i: any) => i.title).join(', ') || 'Serviços diversos'}
                    </Text>
                    <Text style={styles.orderDate}>{item.date.split('-').reverse().join('/')}</Text>
                    <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
                      {STATUS_TRANSLATIONS[item.status]?.toUpperCase() || item.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.orderValue}>R$ {item.total.toFixed(2)}</Text>
                </View>
              </View>
            )}
          />
        )}

        <Modal visible={showDatePicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.yearRow}>
                <TouchableOpacity onPress={() => setPickerYear(pickerYear - 1)}>
                  <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.yearText}>{pickerYear}</Text>
                <TouchableOpacity onPress={() => setPickerYear(pickerYear + 1)}>
                  <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.monthsGrid}>
                {MONTHS.map((m, index) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.monthItem,
                      currentDate.getMonth() === index &&
                        currentDate.getFullYear() === pickerYear &&
                        styles.monthItemActive,
                    ]}
                    onPress={() => handleMonthSelect(index)}
                  >
                    <Text
                      style={[
                        styles.monthItemText,
                        currentDate.getMonth() === index &&
                          currentDate.getFullYear() === pickerYear &&
                          styles.monthItemTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={{ marginTop: 20, alignItems: 'center' }}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={{ color: COLORS.textLight }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </WebContainer>
  );
}
