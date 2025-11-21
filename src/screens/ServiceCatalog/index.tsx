import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './styles';
import { COLORS } from '../../constants/colors';
import { WebContainer } from '../../components/WebContainer';
import { useAuth } from '../../context/AuthContext';
import { addCatalogItem, getCatalogItems, deleteCatalogItem } from '../../services/db';
import { CatalogItem } from '../../types';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function ServiceCatalogScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'service' | 'material'>('service');

  // Delete Modal States
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadCatalog = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getCatalogItems(user.uid);
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const handleAdd = async () => {
    if (!title || !price) return Alert.alert('Erro', 'Preencha nome e preço.');

    setAdding(true);
    try {
      const newItem = await addCatalogItem(user!.uid, {
        title,
        unit_price: parseFloat(price.replace(',', '.')),
        type,
      });

      setItems([...items, newItem as CatalogItem]);
      setTitle('');
      setPrice('');
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao salvar item.', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteCatalogItem(itemToDelete.id);
      setItems(items.filter((i) => i.id !== itemToDelete.id));
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meus Preços (Catálogo)</Text>
        </View>

        <View style={styles.content}>
          {/* FORMULÁRIO DE ADIÇÃO */}
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>Novo Item</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome (ex: Visita Técnica)"
              placeholderTextColor={COLORS.placeholder}
              value={title}
              onChangeText={setTitle}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Preço (R$)"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />

              <View style={{ flexDirection: 'row', flex: 1, gap: 5 }}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'service' && styles.typeButtonActive]}
                  onPress={() => setType('service')}
                >
                  <Text style={[styles.typeText, type === 'service' && styles.typeTextActive]}>
                    Serv
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'material' && styles.typeButtonActive]}
                  onPress={() => setType('material')}
                >
                  <Text style={[styles.typeText, type === 'material' && styles.typeTextActive]}>
                    Peça
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={adding}>
              {adding ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.addButtonText}>Cadastrar Item</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.listTitle}>Itens Cadastrados</Text>
        </View>

        {/* LISTA */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
          refreshing={loading}
          onRefresh={loadCatalog}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemPrice}>R$ {item.unit_price.toFixed(2)}</Text>
                <Text style={styles.itemType}>
                  {item.type === 'service' ? 'Serviço' : 'Material'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  setItemToDelete(item);
                  setShowDeleteModal(true);
                }}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
        />

        <ConfirmModal
          visible={showDeleteModal}
          title="Excluir Item"
          message={`Deseja remover "${itemToDelete?.title}" do catálogo?`}
          confirmText="Sim, Excluir"
          isDanger
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />

        <ConfirmModal
          visible={showSuccessModal}
          title="Sucesso"
          message="Item adicionado ao catálogo!"
          confirmText="OK"
          showCancel={false}
          onConfirm={() => setShowSuccessModal(false)}
          onCancel={() => setShowSuccessModal(false)}
        />
      </SafeAreaView>
    </WebContainer>
  );
}
