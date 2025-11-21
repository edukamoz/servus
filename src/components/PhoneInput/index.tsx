import React, { forwardRef } from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '../../constants/colors';

interface PhoneInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

const formatPhone = (text: string) => {
  const cleaned = text.replace(/\D/g, '');

  // Celular (11 dígitos): (11) 99999-9999
  if (cleaned.length > 10) {
    return cleaned
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  }
  // Fixo (10 dígitos): (11) 9999-9999
  return cleaned
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 14);
};

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(
  ({ value, onChangeText, style, placeholder, ...props }, ref) => {
    const handleChange = (text: string) => {
      const formatted = formatPhone(text);
      onChangeText(formatted);
    };

    return (
      <TextInput
        ref={ref}
        style={[styles.input, style]}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder || '(00) 00000-0000'}
        placeholderTextColor={COLORS.placeholder}
        keyboardType="phone-pad"
        maxLength={15}
        {...props}
      />
    );
  },
);

PhoneInput.displayName = 'PhoneInput';

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textDark,
  },
});
