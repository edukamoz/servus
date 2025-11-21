import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile } from '../../services/db';
import { Customer, OrderItem, CatalogItem } from '../../types';
import { WebContainer } from '../../components/WebContainer';
import { styles } from './styles';
import { createAndSharePDF } from '../../services/pdfService';
import {
  createWorkOrder,
  getMyCustomers,
  createCustomer,
  getCatalogItems,
  addCatalogItem,
} from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { COLORS } from '../../constants/colors';
import { PhoneInput } from '../../components/PhoneInput';

export default function NewOrderScreen({ navigation }: any) {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);

  const [itemTitle, setItemTitle] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemType, setItemType] = useState<'service' | 'material'>('service');

  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogList, setCatalogList] = useState<CatalogItem[]>([]);

  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [savingClient, setSavingClient] = useState(false);

  const [isNewCatalogItemModalOpen, setIsNewCatalogItemModalOpen] = useState(false);
  const [newCatalogTitle, setNewCatalogTitle] = useState('');
  const [newCatalogPrice, setNewCatalogPrice] = useState('');
  const [newCatalogType, setNewCatalogType] = useState<'service' | 'material'>('service');
  const [savingCatalogItem, setSavingCatalogItem] = useState(false);

  const openCatalog = async () => {
    setIsCatalogOpen(true);
    if (catalogList.length === 0 && user?.uid) {
      const items = await getCatalogItems(user.uid);
      setCatalogList(items);
    }
  };

  const selectCatalogItem = (item: CatalogItem) => {
    setItemTitle(item.title);
    setItemPrice(item.unit_price.toString().replace('.', ','));
    setItemType(item.type);
    setIsCatalogOpen(false);
  };

  const loadCustomers = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingCustomers(true);
    try {
      const data = await getMyCustomers(user.uid);
      setCustomersList(data);
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao carregar clientes', e);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadCustomers();
    }
  }, [user, loadCustomers]);

  const addItem = () => {
    if (!itemTitle || !itemPrice) {
      Alert.alert('Erro', 'Preencha o nome e o preço do item.');
      return;
    }

    const newItem: OrderItem = {
      id: Date.now().toString(),
      title: itemTitle,
      unit_price: parseFloat(itemPrice.replace(',', '.')),
      quantity: parseFloat(itemQty.replace(',', '.')),
      type: itemType,
    };

    setItems([...items, newItem]);

    setItemTitle('');
    setItemPrice('');
    setItemQty('1');
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const total = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);

  const handleCreateCatalogItem = async () => {
    if (!newCatalogTitle || !newCatalogPrice) return Alert.alert('Erro', 'Preencha nome e preço.');

    setSavingCatalogItem(true);
    try {
      const newItem = await addCatalogItem(user!.uid, {
        title: newCatalogTitle,
        unit_price: parseFloat(newCatalogPrice.replace(',', '.')),
        type: newCatalogType,
      });

      setCatalogList([newItem as CatalogItem, ...catalogList]);
      selectCatalogItem(newItem as CatalogItem);

      setNewCatalogTitle('');
      setNewCatalogPrice('');
      setIsNewCatalogItemModalOpen(false);
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao salvar item.', error);
    } finally {
      setSavingCatalogItem(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientName) return Alert.alert('Erro', 'Nome é obrigatório');

    setSavingClient(true);
    try {
      const newClient = await createCustomer(user!.uid, {
        name: newClientName,
        phone: newClientPhone,
        address: '',
      });

      setCustomersList([newClient as Customer, ...customersList]);
      setCustomer(newClient as Customer);

      setIsNewClientModalOpen(false);
      setIsCustomerModalOpen(false);
      setNewClientName('');
      setNewClientPhone('');
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao criar cliente.', error);
    } finally {
      setSavingClient(false);
    }
  };

  const handleSave = async () => {
    const profile = await getUserProfile(user!.uid);

    if (!customer) return Alert.alert('Atenção', 'Selecione um cliente.');
    if (items.length === 0) return Alert.alert('Atenção', 'Adicione pelo menos um item.');
    if (!user?.uid) return;

    try {
      const orderId = await createWorkOrder({
        userId: user.uid,
        customer,
        items,
        total,
      });

      await createAndSharePDF({
        customer: customer!,
        items,
        total,
        orderId: orderId.slice(0, 6).toUpperCase(),
        companyProfile: profile,
      });

      Alert.alert('Sucesso', 'O.S. Salva e Gerada!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar a O.S.');
      console.error(error);
    }
  };

  return (
    <WebContainer>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nova O.S.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Seleção de Cliente */}
            <Text style={styles.label}>CLIENTE</Text>
            <TouchableOpacity
              onPress={() => setIsCustomerModalOpen(true)}
              activeOpacity={0.7}
              style={[
                styles.customerSelect,
                customer ? styles.customerSelectActive : styles.customerSelectEmpty,
              ]}
            >
              {customer ? (
                <View>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerAddress}>{customer.address}</Text>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="person-add-outline" size={20} color={COLORS.textLight} />
                  <Text style={styles.emptyStateText}>Toque para selecionar cliente</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Lista de Itens */}
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>ITENS DO SERVIÇO</Text>
            </View>

            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>
                    {item.quantity}x R$ {item.unit_price.toFixed(2)} (
                    {item.type === 'service' ? 'Serviço' : 'Peça'})
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.itemTotal}>
                    R$ {(item.quantity * item.unit_price).toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    style={{ marginLeft: 12, padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Formulário */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>ADICIONAR ITEM</Text>

              <TouchableOpacity onPress={openCatalog}>
                <Text style={{ color: '#0284c7', fontWeight: 'bold', fontSize: 12 }}>
                  + Buscar no Catálogo
                </Text>
              </TouchableOpacity>

              <TextInput
                placeholder="Descrição (ex: Troca de Capacitor)"
                style={styles.input}
                value={itemTitle}
                onChangeText={setItemTitle}
                placeholderTextColor={COLORS.placeholder}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.inputLabel}>Valor (R$)</Text>
                  <TextInput
                    placeholder="0,00"
                    keyboardType="numeric"
                    style={styles.input}
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
                <View style={{ width: 80 }}>
                  <Text style={styles.inputLabel}>Qtd</Text>
                  <TextInput
                    placeholder="1"
                    keyboardType="numeric"
                    style={[styles.input, { textAlign: 'center' }]}
                    value={itemQty}
                    onChangeText={setItemQty}
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
              </View>

              <View style={styles.typeSelector}>
                <TouchableOpacity
                  onPress={() => setItemType('service')}
                  style={[styles.typeButton, itemType === 'service' && styles.typeButtonActive]}
                >
                  <Text style={[styles.typeText, itemType === 'service' && styles.typeTextActive]}>
                    Serviço
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setItemType('material')}
                  style={[styles.typeButton, itemType === 'material' && styles.typeButtonActive]}
                >
                  <Text style={[styles.typeText, itemType === 'material' && styles.typeTextActive]}>
                    Peça/Material
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={addItem} style={styles.addButton}>
                <Text style={styles.addButtonText}>Adicionar Item</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Total Estimado</Text>
            <Text style={styles.footerTotal}>R$ {total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Criar Ordem de Serviço</Text>
          </TouchableOpacity>
        </View>

        {/* Modal Clientes */}
        <Modal
          visible={isCustomerModalOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          transparent={Platform.OS === 'web'}
        >
          <View
            style={
              Platform.OS === 'web'
                ? {
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                : { flex: 1 }
            }
          >
            <View
              style={
                Platform.OS === 'web'
                  ? {
                      width: 500,
                      height: 600,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      overflow: 'hidden',
                    }
                  : styles.modalContainer
              }
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione o Cliente</Text>
                <TouchableOpacity onPress={() => setIsCustomerModalOpen(false)}>
                  <Text style={styles.modalClose}>Fechar</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomWidth: 1,
                  borderColor: '#f1f5f9',
                  backgroundColor: '#f8fafc',
                }}
                onPress={() => setIsNewClientModalOpen(true)}
              >
                <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginLeft: 8 }}>
                  Cadastrar Novo Cliente
                </Text>
              </TouchableOpacity>

              <FlatList
                data={customersList}
                keyExtractor={(item) => item.id}
                refreshing={isLoadingCustomers}
                onRefresh={loadCustomers}
                ListEmptyComponent={
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.placeholder }}>Nenhum cliente encontrado.</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.customerItem}
                    onPress={() => {
                      setCustomer(item);
                      setIsCustomerModalOpen(false);
                    }}
                  >
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>{item.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.customerItemName}>{item.name}</Text>
                      <Text style={styles.customerItemAddress}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={isNewClientModalOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          transparent={Platform.OS === 'web'}
        >
          <View
            style={
              Platform.OS === 'web'
                ? {
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                : { flex: 1, backgroundColor: 'white' }
            }
          >
            <View
              style={
                Platform.OS === 'web'
                  ? { width: 400, backgroundColor: 'white', borderRadius: 12, padding: 20 }
                  : { flex: 1, padding: 20 }
              }
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.textDark }}>
                  Novo Cliente
                </Text>
                <TouchableOpacity onPress={() => setIsNewClientModalOpen(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Nome do Cliente *</Text>
              <TextInput
                style={styles.input}
                value={newClientName}
                onChangeText={setNewClientName}
                placeholder="Ex: Padaria Estrela"
                placeholderTextColor={COLORS.placeholder}
                autoFocus
              />

              <Text style={styles.inputLabel}>Telefone / WhatsApp</Text>
              <PhoneInput value={newClientPhone} onChangeText={setNewClientPhone} />

              <TouchableOpacity
                style={[styles.saveButton, { marginTop: 10 }]}
                onPress={handleCreateClient}
                disabled={savingClient}
              >
                {savingClient ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar e Selecionar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isCatalogOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          transparent={Platform.OS === 'web'}
        >
          <View
            style={
              Platform.OS === 'web'
                ? {
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                : { flex: 1, backgroundColor: 'white' }
            }
          >
            <View
              style={
                Platform.OS === 'web'
                  ? {
                      width: 500,
                      height: 600,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }
                  : { flex: 1 }
              }
            >
              {/* Header do Modal */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 20,
                  borderBottomWidth: 1,
                  borderColor: '#f1f5f9',
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.textDark }}>
                  Catálogo de Preços
                </Text>
                <TouchableOpacity onPress={() => setIsCatalogOpen(false)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomWidth: 1,
                  borderColor: '#f1f5f9',
                  backgroundColor: '#f8fafc',
                }}
                onPress={() => setIsNewCatalogItemModalOpen(true)}
              >
                <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginLeft: 8 }}>
                  Cadastrar Novo Item
                </Text>
              </TouchableOpacity>

              <FlatList
                data={catalogList}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListEmptyComponent={
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Ionicons
                      name="pricetags-outline"
                      size={48}
                      color="#e2e8f0"
                      style={{ marginBottom: 10 }}
                    />
                    <Text style={{ textAlign: 'center', color: '#94a3b8' }}>
                      Nenhum item cadastrado.{'\n'}Vá em Perfil {'>'} Meus Preços para adicionar.
                    </Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderColor: '#f1f5f9',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onPress={() => selectCatalogItem(item)}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.textDark }}>
                        {item.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>
                        {item.type === 'service' ? '🛠️ Serviço' : '📦 Peça/Material'}
                      </Text>
                    </View>
                    <Text style={{ fontWeight: 'bold', color: COLORS.primary, fontSize: 16 }}>
                      R$ {item.unit_price.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={isNewCatalogItemModalOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          transparent={Platform.OS === 'web'}
        >
          <View
            style={
              Platform.OS === 'web'
                ? {
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                : { flex: 1, backgroundColor: 'white' }
            }
          >
            <View
              style={
                Platform.OS === 'web'
                  ? { width: 400, backgroundColor: 'white', borderRadius: 12, padding: 20 }
                  : { flex: 1, padding: 20 }
              }
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.textDark }}>
                  Novo Item
                </Text>
                <TouchableOpacity onPress={() => setIsNewCatalogItemModalOpen(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Nome do Serviço/Peça *</Text>
              <TextInput
                style={styles.input}
                value={newCatalogTitle}
                onChangeText={setNewCatalogTitle}
                placeholder="Ex: Visita Técnica"
                placeholderTextColor={COLORS.placeholder}
                autoFocus
              />

              <Text style={styles.inputLabel}>Preço (R$) *</Text>
              <TextInput
                style={styles.input}
                value={newCatalogPrice}
                onChangeText={setNewCatalogPrice}
                placeholder="0,00"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="numeric"
              />

              {/* Seletor de Tipo */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={() => setNewCatalogType('service')}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: newCatalogType === 'service' ? '#e0f2fe' : '#f1f5f9',
                    borderWidth: 1,
                    borderColor: newCatalogType === 'service' ? COLORS.primary : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: newCatalogType === 'service' ? COLORS.primary : COLORS.textLight,
                    }}
                  >
                    Serviço
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewCatalogType('material')}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: newCatalogType === 'material' ? '#e0f2fe' : '#f1f5f9',
                    borderWidth: 1,
                    borderColor: newCatalogType === 'material' ? COLORS.primary : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: newCatalogType === 'material' ? COLORS.primary : COLORS.textLight,
                    }}
                  >
                    Peça
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleCreateCatalogItem}
                disabled={savingCatalogItem}
              >
                {savingCatalogItem ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar e Usar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </WebContainer>
  );
}
