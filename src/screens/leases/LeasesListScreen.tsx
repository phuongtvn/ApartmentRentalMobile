import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { ScreenContainer, Card, Button, Loading, ErrorMessage } from '../../components/ui';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';

interface LeasesListScreenProps {
  navigation: any;
}

export const LeasesListScreen: React.FC<LeasesListScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [leases, setLeases] = useState<any[]>([]);
  const [expiringLeases, setExpiringLeases] = useState<any[]>([]);
  const [showExpiring, setShowExpiring] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        navigation.replace('Auth');
        return;
      }

      const { data: profile, error: profileError } = await DatabaseService.getUserProfile(user.id);
      if (profileError || !profile) {
        setError('Failed to load user profile');
        setLoading(false);
        return;
      }

      // Load all leases
      const { data: leasesData, error: leasesError } = await DatabaseService.getLeases(
        profile.client_id,
      );
      if (leasesError) {
        setError('Failed to load leases');
      } else {
        setLeases(leasesData || []);
      }

      // Load expiring leases
      const { data: expiringData, error: expiringError } = await DatabaseService.getExpiringLeases(
        profile.client_id,
        30,
      );
      if (!expiringError) {
        setExpiringLeases(expiringData || []);
      }

      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const navigateToLease = (leaseId: string) => {
    navigation.navigate('ContractDetails', { contractId: leaseId });
  };

  const getLeaseStatusColor = (status: string) => {
    const colors = {
      draft: '#9E9E9E',
      active: '#4CAF50',
      expired: '#FF9800',
      terminated: '#F44336',
      renewed: '#2196F3',
    };
    return colors[status as keyof typeof colors] || '#9E9E9E';
  };

  const calculateDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderLeaseItem = ({ item }: { item: any }) => {
    const daysUntilExpiry = calculateDaysUntilExpiry(item.end_date);
    const isExpiringSoon = item.status === 'active' && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

    return (
      <TouchableOpacity onPress={() => navigateToLease(item.id)}>
        <Card>
          {isExpiringSoon && (
            <View style={styles.expiringBanner}>
              <Text style={styles.expiringText}>
                ⚠️ Expiring in {daysUntilExpiry} days
              </Text>
            </View>
          )}
          <View style={styles.leaseHeader}>
            <View style={styles.leaseInfo}>
              <Text style={styles.leaseTenant}>
                {item.tenants?.first_name} {item.tenants?.last_name}
              </Text>
              <Text style={styles.leaseRoom}>
                {item.rooms?.buildings?.name} - Room {item.rooms?.room_number}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getLeaseStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.leaseDetails}>
            <Text style={styles.detailText}>
              📅 {item.start_date} → {item.end_date}
            </Text>
            <Text style={styles.detailText}>
              💰 ${item.rent_amount.toLocaleString()} / {item.payment_frequency}
            </Text>
            {item.tenants?.phone && (
              <Text style={styles.detailText}>📱 {item.tenants.phone}</Text>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loading message="Loading leases..." />;
  }

  const displayLeases = showExpiring ? expiringLeases : leases;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Leases & Contracts</Text>
          {expiringLeases.length > 0 && (
            <Text style={styles.subtitle}>
              {expiringLeases.length} lease{expiringLeases.length !== 1 ? 's' : ''} expiring soon
            </Text>
          )}
        </View>
      </View>

      {error && <ErrorMessage message={error} />}

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, !showExpiring && styles.filterButtonActive]}
          onPress={() => setShowExpiring(false)}
        >
          <Text style={[styles.filterText, !showExpiring && styles.filterTextActive]}>
            All ({leases.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, showExpiring && styles.filterButtonActive]}
          onPress={() => setShowExpiring(true)}
        >
          <Text style={[styles.filterText, showExpiring && styles.filterTextActive]}>
            Expiring Soon ({expiringLeases.length})
          </Text>
        </TouchableOpacity>
      </View>

      {displayLeases.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            {showExpiring ? 'No expiring leases' : 'No leases yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {showExpiring
              ? 'All your leases are current'
              : 'Create a new contract from the room details screen'}
          </Text>
        </Card>
      ) : (
        <FlatList
          data={displayLeases}
          keyExtractor={(item) => item.id}
          renderItem={renderLeaseItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 4,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  expiringBanner: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  expiringText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    textAlign: 'center',
  },
  leaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leaseInfo: {
    flex: 1,
  },
  leaseTenant: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  leaseRoom: {
    fontSize: 14,
    color: '#666666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  leaseDetails: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
