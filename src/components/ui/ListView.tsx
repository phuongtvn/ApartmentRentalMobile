import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Input } from './Input';

export interface ListViewItem {
  id: string;
  [key: string]: any;
}

interface ListViewProps<T extends ListViewItem> {
  data: T[];
  onSelectItem: (item: T) => void;
  displayField: keyof T | ((item: T) => string);
  secondaryField?: keyof T | ((item: T) => string);
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  containerStyle?: ViewStyle;
}

export function ListView<T extends ListViewItem>({
  data,
  onSelectItem,
  displayField,
  secondaryField,
  searchable = true,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No items found',
  containerStyle,
}: ListViewProps<T>): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');

  const getFieldValue = (item: T, field: keyof T | ((item: T) => string)): string => {
    if (typeof field === 'function') {
      return field(item);
    }
    return String(item[field] || '');
  };

  const filteredData = useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const primaryText = getFieldValue(item, displayField).toLowerCase();
      const secondaryText = secondaryField
        ? getFieldValue(item, secondaryField).toLowerCase()
        : '';
      return primaryText.includes(query) || secondaryText.includes(query);
    });
  }, [data, searchQuery, displayField, secondaryField, searchable]);

  const renderItem = ({ item }: { item: T }) => {
    const primaryText = getFieldValue(item, displayField);
    const secondaryText = secondaryField ? getFieldValue(item, secondaryField) : null;

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => onSelectItem(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <Text style={styles.primaryText}>{primaryText}</Text>
          {secondaryText && (
            <Text style={styles.secondaryText}>{secondaryText}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {searchable && (
        <View style={styles.searchContainer}>
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
        </View>
      )}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        }
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchInput: {
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  itemContent: {
    flex: 1,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 14,
    color: '#666666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
