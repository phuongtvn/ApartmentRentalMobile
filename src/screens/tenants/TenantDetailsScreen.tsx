import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ScreenContainer, Card, Button, Loading, ErrorMessage } from '../../components/ui';
import { DatabaseService } from '../../services/database.service';
import type { Database } from '../../types/database.types';

type Tenant = Database['public']['Tables']['tenants']['Row'];

interface TenantDetailsScreenProps {
  route: any;
  navigation: any;
}

export const TenantDetailsScreen: React.FC<TenantDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { tenantId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [leases, setLeases] = useState<any[]>([]);

  const loadTenantDetails = useCallback(async () => {
    try {
      const { data, error: fetchError } = await DatabaseService.getTenantById(tenantId);
      if (fetchError || !data) {
        setError('Failed to load tenant details');
        setLoading(false);
        return;
      }

      setTenant(data);

      // Load tenant's leases
      const { data: leasesData } = await DatabaseService.getLeasesByTenant(tenantId);
      setLeases(leasesData || []);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadTenantDetails();
  }, [loadTenantDetails]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Tenant',
      'Are you sure you want to delete this tenant? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error: deleteError } = await DatabaseService.deleteTenant(tenantId);
            if (deleteError) {
              Alert.alert('Error', 'Failed to delete tenant');
            } else {
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: '#4CAF50',
      inactive: '#9E9E9E',
      blacklisted: '#F44336',
    };
    return colors[status as keyof typeof colors] || '#9E9E9E';
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

  if (loading) {
    return <Loading message="Loading tenant..." />;
  }

  if (!tenant) {
    return (
      <ScreenContainer>
        <ErrorMessage message="Tenant not found" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.tenantName}>
            {tenant.first_name} {tenant.last_name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tenant.status) }]}>
            <Text style={styles.statusText}>{tenant.status}</Text>
          </View>
        </View>
      </View>

      {error && <ErrorMessage message={error} />}

      <Card>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        {tenant.email && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{tenant.email}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{tenant.phone}</Text>
        </View>
        {tenant.current_address && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{tenant.current_address}</Text>
          </View>
        )}
      </Card>

      {(tenant.date_of_birth || tenant.national_id) && (
        <Card>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {tenant.date_of_birth && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date of Birth:</Text>
              <Text style={styles.value}>{tenant.date_of_birth}</Text>
            </View>
          )}
          {tenant.national_id && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>National ID:</Text>
              <Text style={styles.value}>{tenant.national_id}</Text>
            </View>
          )}
        </Card>
      )}

      {(tenant.occupation || tenant.employer || tenant.monthly_income) && (
        <Card>
          <Text style={styles.sectionTitle}>Employment Information</Text>
          {tenant.occupation && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Occupation:</Text>
              <Text style={styles.value}>{tenant.occupation}</Text>
            </View>
          )}
          {tenant.employer && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Employer:</Text>
              <Text style={styles.value}>{tenant.employer}</Text>
            </View>
          )}
          {tenant.monthly_income && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Monthly Income:</Text>
              <Text style={styles.value}>${tenant.monthly_income.toLocaleString()}</Text>
            </View>
          )}
        </Card>
      )}

      {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
        <Card>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          {tenant.emergency_contact_name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{tenant.emergency_contact_name}</Text>
            </View>
          )}
          {tenant.emergency_contact_phone && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{tenant.emergency_contact_phone}</Text>
            </View>
          )}
        </Card>
      )}

      <Card>
        <View style={styles.leasesHeader}>
          <Text style={styles.sectionTitle}>Leases ({leases.length})</Text>
        </View>
        {leases.length === 0 ? (
          <Text style={styles.noLeases}>No leases found for this tenant</Text>
        ) : (
          leases.map((lease: any) => (
            <TouchableOpacity
              key={lease.id}
              style={styles.leaseCard}
              onPress={() => navigation.navigate('ContractDetails', { contractId: lease.id })}
            >
              <View style={styles.leaseHeader}>
                <Text style={styles.leaseRoom}>
                  {lease.rooms?.buildings?.name} - Room {lease.rooms?.room_number}
                </Text>
                <View
                  style={[
                    styles.leaseStatusBadge,
                    { backgroundColor: getLeaseStatusColor(lease.status) },
                  ]}
                >
                  <Text style={styles.leaseStatusText}>{lease.status}</Text>
                </View>
              </View>
              <Text style={styles.leaseDetail}>
                {lease.start_date} → {lease.end_date}
              </Text>
              <Text style={styles.leaseDetail}>
                Rent: ${lease.rent_amount.toLocaleString()} / {lease.payment_frequency}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </Card>

      {tenant.notes && (
        <Card>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{tenant.notes}</Text>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          title="Edit Tenant"
          onPress={() => navigation.navigate('EditTenant', { tenantId })}
        />
        <Button
          title="Delete Tenant"
          onPress={handleDelete}
          variant="outline"
          style={styles.deleteButton}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    width: 140,
  },
  value: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  leasesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noLeases: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  leaseCard: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  leaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaseRoom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  leaseStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  leaseStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  leaseDetail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  actions: {
    marginTop: 16,
    marginBottom: 24,
  },
  deleteButton: {
    marginTop: 12,
  },
});
