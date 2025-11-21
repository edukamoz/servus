import React, { useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';

import SignatureScreen from 'react-native-signature-canvas';
import SignatureCanvas from 'react-signature-canvas';
import { styles } from './styles';

interface SignatureModalProps {
  visible: boolean;
  onOK: (signatureBase64: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const SignatureModal = ({ visible, onOK, onCancel, loading }: SignatureModalProps) => {
  const mobileRef = useRef<any>('');
  const webRef = useRef<any>('');

  const handleConfirm = () => {
    if (Platform.OS === 'web') {
      if (webRef.current.isEmpty()) {
        alert('Por favor, assine antes de confirmar.');
        return;
      }
      const signature = webRef.current.getTrimmedCanvas().toDataURL('image/png');
      onOK(signature);
    } else {
      mobileRef.current.readSignature();
    }
  };

  const handleClear = () => {
    if (Platform.OS === 'web') {
      webRef.current.clear();
    } else {
      mobileRef.current.clearSignature();
    }
  };

  const handleMobileOK = (signature: string) => {
    onOK(signature);
  };

  const mobileStyle = `.m-signature-pad--footer {display: none; margin: 0px;}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      transparent={Platform.OS === 'web'}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Assinatura do Cliente</Text>
            <TouchableOpacity onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.canvasContainer}>
            {Platform.OS === 'web' ? (
              <View style={styles.webCanvasWrapper}>
                <SignatureCanvas
                  ref={webRef}
                  penColor={COLORS.black}
                  canvasProps={{
                    className: 'sigCanvas',
                    style: { width: '100%', height: '100%' },
                  }}
                  backgroundColor={COLORS.white}
                />
              </View>
            ) : (
              <SignatureScreen
                ref={mobileRef}
                onOK={handleMobileOK}
                webStyle={mobileStyle}
                backgroundColor={COLORS.white}
                penColor={COLORS.black}
              />
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear} disabled={loading}>
              <Text style={styles.clearText}>Limpar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
