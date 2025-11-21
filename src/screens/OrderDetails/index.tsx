import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { styles } from './styles';
import { WebContainer } from '../../components/WebContainer';
import { ConfirmModal } from '../../components/ConfirmModal';
import { SignatureModal } from '../../components/SignatureModal';
import {
  updateOrderStatus,
  deleteOrder,
  getUserProfile,
  uploadSignature,
  addSignatureToOrder,
  uploadImageToCloudinary,
  addPhotoToOrder,
  removePhotoFromOrder,
} from '../../services/db';
import { createAndSharePDF } from '../../services/pdfService';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { OrderPhoto } from '../../types';

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params as { order: any };
  const { user } = useAuth();

  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPhotoDeleteModal, setShowPhotoDeleteModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<OrderPhoto | null>(null);
  const [loading, setLoading] = useState(false);

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [orderData, setOrderData] = useState(order);

  const getStatusConfig = (status: string) => {
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

  const handleAddPhoto = async (type: 'before' | 'after') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      setLoading(true);

      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
      );

      const url = await uploadImageToCloudinary(manipResult.uri, 'servus_evidence');

      const newPhoto: OrderPhoto = {
        id: Date.now().toString(),
        url,
        type,
        createdAt: new Date().toISOString(),
      };

      await addPhotoToOrder(orderData.id, newPhoto);

      const currentPhotos = orderData.photos || [];
      setOrderData({ ...orderData, photos: [...currentPhotos, newPhoto] });
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao enviar foto.', error);
    } finally {
      setLoading(false);
    }
  };

  // Remover Foto
  const handleDeletePhoto = (photo: OrderPhoto) => {
    setPhotoToDelete(photo);
    setShowPhotoDeleteModal(true);
  };

  // Alterar Status (Ciclo Financeiro)
  const handleStatusChange = async () => {
    // Lógica simples: Aberto -> Concluído -> Pago -> Aberto (Ciclo)
    let nextStatus: any = 'open';
    if (currentStatus === 'open') nextStatus = 'completed';
    else if (currentStatus === 'completed') nextStatus = 'paid';
    else if (currentStatus === 'paid') nextStatus = 'open';

    try {
      await updateOrderStatus(order.id, nextStatus);
      setCurrentStatus(nextStatus);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível atualizar o status.', error);
    }
  };

  // Gerar PDF (Reenvio)
  const handlePDF = async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile(user!.uid);

      await createAndSharePDF({
        customer: {
          name: order.customer_name,
          address: 'Endereço do Cliente',
          phone: 'Telefone',
          id: order.customerId,
        },
        items: order.items,
        total: order.total,
        orderId: order.id.slice(0, 6).toUpperCase(),
        companyProfile: profile,
        signatureUrl: orderData.signatureUrl,
        photos: orderData.photos,
      });
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao gerar PDF', e);
    } finally {
      setLoading(false);
    }
  };

  // Deletar
  const handleDelete = async () => {
    try {
      await deleteOrder(order.id);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao excluir.', error);
    }
  };

  const handleSignature = async (signatureBase64: string) => {
    setLoading(true);
    try {
      const url = await uploadSignature(signatureBase64);

      await addSignatureToOrder(orderData.id, url);

      setOrderData({ ...orderData, signatureUrl: url, status: 'completed' });
      setShowSignatureModal(false);

      Alert.alert('Sucesso', 'Assinatura salva!');
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao salvar assinatura.', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmPhotoDeletion = async () => {
    if (!photoToDelete) return;

    try {
      await removePhotoFromOrder(orderData.id, photoToDelete);

      setOrderData({
        ...orderData,
        photos: orderData.photos?.filter((p: OrderPhoto) => p.id !== photoToDelete.id),
      });
    } catch (e) {
      console.error(e);
      if (Platform.OS === 'web') alert('Erro ao apagar foto.');
      else Alert.alert('Erro', 'Não foi possível apagar a foto.');
    } finally {
      setShowPhotoDeleteModal(false);
      setPhotoToDelete(null);
    }
  };

  const statusUI = getStatusConfig(currentStatus);

  return (
    <WebContainer>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da O.S.</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Card de Status (Clicável para mudar) */}
          <TouchableOpacity
            style={styles.statusCard}
            onPress={handleStatusChange}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.statusLabel}>STATUS ATUAL (Toque para mudar)</Text>
              <Text style={{ fontSize: 12, color: COLORS.textLight }}>
                Criado em: {order.date ? order.date.split('-').reverse().join('/') : '-'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusUI.bg }]}>
              <Text style={[styles.statusText, { color: statusUI.text }]}>{statusUI.label}</Text>
            </View>
          </TouchableOpacity>

          {/* ADICIONADO: Seção de Evidências (Fotos) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Evidências (Antes e Depois)</Text>

            {/* Botões de Ação */}
            <View style={styles.photoButtonsRow}>
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => handleAddPhoto('before')}
                disabled={loading}
              >
                <Ionicons name="camera-outline" size={20} color={COLORS.textLight} />
                <Text style={styles.addPhotoText}>Add "Antes"</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => handleAddPhoto('after')}
                disabled={loading}
              >
                <Ionicons name="images-outline" size={20} color={COLORS.textLight} />
                <Text style={styles.addPhotoText}>Add "Depois"</Text>
              </TouchableOpacity>
            </View>

            {/* Grid de Fotos */}
            <View style={styles.photosGrid}>
              {orderData.photos?.map((photo: OrderPhoto) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image source={{ uri: photo.url }} style={styles.photoImage} resizeMode="cover" />

                  {/* Badge (Antes/Depois) */}
                  <View
                    style={[
                      styles.photoBadge,
                      {
                        backgroundColor: photo.type === 'after' ? COLORS.success : COLORS.warning,
                      },
                    ]}
                  >
                    <Text style={styles.photoBadgeText}>
                      {photo.type === 'before' ? 'Antes' : 'Depois'}
                    </Text>
                  </View>

                  {/* Botão Excluir */}
                  <TouchableOpacity
                    style={styles.deletePhoto}
                    onPress={() => handleDeletePhoto(photo)}
                  >
                    <Ionicons name="trash" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}

              {!orderData.photos?.length && (
                <Text
                  style={{
                    color: '#94a3b8',
                    fontSize: 12,
                    width: '100%',
                    textAlign: 'center',
                    padding: 10,
                  }}
                >
                  Nenhuma foto adicionada.
                </Text>
              )}
            </View>
          </View>

          {/* Cliente */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={styles.customerName}>{order.customer_name}</Text>
            {/* Aqui poderíamos buscar mais dados do cliente se quiséssemos */}
          </View>

          {/* Itens */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Itens do Serviço</Text>
            {order.items?.map((item: any, index: number) => (
              <View key={index} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSub}>
                    {item.quantity}x ({item.type === 'service' ? 'Serviço' : 'Peça'})
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  R$ {(item.unit_price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>R$ {order.total?.toFixed(2)}</Text>
            </View>
          </View>

          {orderData.signatureUrl && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Assinatura do Cliente</Text>
              <Image
                source={{ uri: orderData.signatureUrl }}
                style={{ width: '100%', height: 150, resizeMode: 'contain' }}
              />
            </View>
          )}

          {/* Botões de Ação */}
          <View style={styles.actionsContainer}>
            {!orderData.signatureUrl && (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: COLORS.primary }]}
                onPress={() => setShowSignatureModal(true)}
              >
                <Ionicons name="pencil" size={20} color={COLORS.primary} />
                <Text
                  style={{
                    color: COLORS.primary,
                    fontWeight: 'bold',
                    marginLeft: 8,
                  }}
                >
                  Coletar Assinatura
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={handlePDF}
            >
              <Ionicons name="share-social-outline" size={20} color="white" />
              <Text style={styles.primaryActionText}>{loading ? 'Gerando...' : 'Enviar PDF'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => setShowDeleteModal(true)}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              <Text style={styles.deleteActionText}>Excluir O.S.</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmModal
          visible={showDeleteModal}
          title="Excluir Ordem"
          message="Essa ação não pode ser desfeita. O registro financeiro será removido."
          confirmText="Sim, Excluir"
          isDanger
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            handleDelete();
          }}
        />

        <SignatureModal
          visible={showSignatureModal}
          onOK={handleSignature}
          onCancel={() => setShowSignatureModal(false)}
          loading={loading}
        />

        <ConfirmModal
          visible={showPhotoDeleteModal}
          title="Apagar Evidência"
          message="Tem certeza que deseja remover esta foto?"
          confirmText="Sim, Apagar"
          isDanger={true}
          onCancel={() => setShowPhotoDeleteModal(false)}
          onConfirm={confirmPhotoDeletion}
        />
      </SafeAreaView>
    </WebContainer>
  );
}
