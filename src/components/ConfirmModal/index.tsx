import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  showCancel?: boolean;
}

export const ConfirmModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = false,
  showCancel = true,
}: ConfirmModalProps) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel} // Fecha se apertar voltar no Android
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {/* Botão Cancelar */}
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.textCancel}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            {/* Botão Confirmar */}
            <TouchableOpacity
              style={[
                styles.button,
                isDanger ? styles.buttonDanger : styles.buttonPrimary,
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.textConfirm}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
