import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './styles';
import { COLORS } from '../../constants/colors';
import { WebContainer } from '../../components/WebContainer';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { getMyCustomers, updateCustomer, deleteCustomer, createCustomer } from '../../services/db';
import { Customer } from '../../types';
import { PhoneInput } from '../../components/PhoneInput';

export default function CustomersScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Estados do Modal de Edição/Criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null); // Se null, é criação
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [saving, setSaving] = useState(false);

  // Estados de Exclusão
  const [itemToDelete, setItemToDelete] = useState<Customer | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getMyCustomers(user.uid);
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtro de Busca
  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text) {
      setFilteredCustomers(customers);
    } else {
      const lower = text.toLowerCase();
      setFilteredCustomers(
        customers.filter((c) => c.name.toLowerCase().includes(lower) || c.phone.includes(text)),
      );
    }
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormName(customer.name);
      setFormPhone(customer.phone);
      setFormAddress(customer.address);
    } else {
      setEditingCustomer(null);
      setFormName('');
      setFormPhone('');
      setFormAddress('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName) return Alert.alert('Erro', 'Nome é obrigatório');
    setSaving(true);
    try {
      if (editingCustomer) {
        // EDITAR
        await updateCustomer(editingCustomer.id, {
          name: formName,
          phone: formPhone,
          address: formAddress,
        });
        Alert.alert('Sucesso', 'Cliente atualizado!');
      } else {
        // CRIAR
        await createCustomer(user!.uid, {
          name: formName,
          phone: formPhone,
          address: formAddress,
        });
        Alert.alert('Sucesso', 'Cliente criado!');
      }
      setIsModalOpen(false);
      loadData(); // Recarrega lista
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao salvar.', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteCustomer(itemToDelete.id);
      setCustomers(customers.filter((c) => c.id !== itemToDelete.id));
      setFilteredCustomers(filteredCustomers.filter((c) => c.id !== itemToDelete.id));
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao excluir.', error);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <WebContainer>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Meus Clientes</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou telefone..."
            placeholderTextColor={COLORS.placeholder}
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadData}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
              Nenhum cliente encontrado.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.customerCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>{item.name}</Text>
                <Text style={styles.customerInfo}>{item.phone}</Text>
                {item.address ? <Text style={styles.customerInfo}>{item.address}</Text> : null}
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(item)}>
                  <Ionicons name="create-outline" size={22} color={COLORS.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    setItemToDelete(item);
                    setShowDeleteModal(true);
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => openModal()}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {/* MODAL DE FORMULÁRIO */}
        <Modal
          visible={isModalOpen}
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
            {/* Card do Modal */}
            <View
              style={
                Platform.OS === 'web'
                  ? {
                      width: 500,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      maxHeight: '90%',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }
                  : styles.modalContainer
              }
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <Text style={styles.modalClose}>Cancelar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome Completo</Text>
                  <TextInput
                    style={styles.input}
                    value={formName}
                    onChangeText={setFormName}
                    placeholder="Ex: João Silva"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Telefone / WhatsApp</Text>
                  <PhoneInput value={formPhone} onChangeText={setFormPhone} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Endereço</Text>
                  <TextInput
                    style={styles.input}
                    value={formAddress}
                    onChangeText={setFormAddress}
                    placeholder="Rua, Número, Bairro"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.saveText}>Salvar Cliente</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ConfirmModal
          visible={showDeleteModal}
          title="Excluir Cliente"
          message={`Deseja remover "${itemToDelete?.name}"?`}
          confirmText="Sim, Excluir"
          isDanger
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      </SafeAreaView>
    </WebContainer>
  );
}
