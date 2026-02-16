import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ListView, ListViewItem } from './ListView';

interface LookupInputProps<T extends ListViewItem> {
  label?: string;
  placeholder?: string;
  value?: T;
  data: T[];
  onSelect: (item: T | undefined) => void;
  displayField: keyof T | ((item: T) => string);
  secondaryField?: keyof T | ((item: T) => string);
  searchPlaceholder?: string;
  emptyMessage?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  disabled?: boolean;
}

export function LookupInput<T extends ListViewItem>({
  label,
  placeholder = 'Select an item...',
  value,
  data,
  onSelect,
  displayField,
  secondaryField,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No items found',
  error,
  containerStyle,
  inputStyle,
  disabled = false,
}: LookupInputProps<T>): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);

  const getDisplayValue = (item: T): string => {
    if (typeof displayField === 'function') {
      return displayField(item);
    }
    return String(item[displayField] || '');
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    setModalVisible(false);
  };

  const handleClear = () => {
    onSelect(undefined);
  };

  const displayValue = value ? getDisplayValue(value) : '';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={[
            styles.inputContainer,
            error && styles.inputError,
            disabled && styles.inputDisabled,
            inputStyle,
          ]}
          onPress={() => !disabled && setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.inputText,
              !displayValue && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {displayValue || placeholder}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.lookupButton}
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
        >
          <Text style={styles.lookupIcon}>🔍</Text>
        </TouchableOpacity>

        {value && !disabled && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {label || 'Select Item'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ListView
            data={data}
            onSelectItem={handleSelect}
            displayField={displayField}
            secondaryField={secondaryField}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
            searchable={true}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  inputText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
  },
  lookupButton: {
    marginLeft: 8,
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookupIcon: {
    fontSize: 20,
  },
  clearButton: {
    marginLeft: 8,
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  error: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#F8F8F8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
