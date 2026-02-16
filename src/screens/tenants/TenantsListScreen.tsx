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
import type { Database } from '../../types/database.types';

type Tenant = Database['public']['Tables']['tenants']['Row'];

interface TenantsListScreenProps {
  navigation: any;
}

export const TenantsListScreen: React.FC<TenantsListScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [clientId, setClientId] = useState('');

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

      setClientId(profile.client_id);

      const { data: tenantsData, error: tenantsError } = await DatabaseService.getTenants(
        profile.client_id,
      );
      if (tenantsError) {
        setError('Failed to load tenants');
      } else {
        setTenants(tenantsData || []);
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

  const navigateToTenant = (tenantId: string) => {
    navigation.navigate('TenantDetails', { tenantId });
  };

  const getTenantStatus = (tenant: Tenant) => {
    const statusColors = {
      active: '#4CAF50',
      inactive: '#9E9E9E',
      blacklisted: '#F44336',
    };
    return (
      <View style={[styles.statusBadge, { backgroundColor: statusColors[tenant.status] }]}>
        <Text style={styles.statusText}>{tenant.status}</Text>
      </View>
    );
  };

  if (loading) {
    return <Loading message="Loading tenants..." />;
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Tenants</Text>
        <Button
          title="+ Add Tenant"
          onPress={() => navigation.navigate('AddTenant', { clientId })}
          size="small"
        />
      </View>

      {error && <ErrorMessage message={error} />}

      {tenants.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No tenants yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the "+ Add Tenant" button to create your first tenant record
          </Text>
        </Card>
      ) : (
        <FlatList
          data={tenants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigateToTenant(item.id)}>
              <Card>
                <View style={styles.tenantHeader}>
                  <Text style={styles.tenantName}>
                    {item.first_name} {item.last_name}
                  </Text>
                  {getTenantStatus(item)}
                </View>
                {item.email && (
                  <Text style={styles.tenantDetail}>📧 {item.email}</Text>
                )}
                <Text style={styles.tenantDetail}>📱 {item.phone}</Text>
                {item.occupation && (
                  <Text style={styles.tenantDetail}>💼 {item.occupation}</Text>
                )}
              </Card>
            </TouchableOpacity>
          )}
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
    alignItems: 'center',
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
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  tenantDetail: {
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
