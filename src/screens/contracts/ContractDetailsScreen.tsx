import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { ScreenContainer, Card, Button, Loading, ErrorMessage } from '../../components/ui';
import { DatabaseService } from '../../services/database.service';

interface ContractDetailsScreenProps {
  route: any;
  navigation: any;
}

export const ContractDetailsScreen: React.FC<ContractDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { contractId, roomId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    loadContractDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  const loadContractDetails = async () => {
    try {
      const { data, error: fetchError } = await DatabaseService.getContractById(contractId);
      if (fetchError || !data) {
        setError('Failed to load contract details');
        setLoading(false);
        return;
      }

      setContract(data);

      const { data: roomData } = await DatabaseService.getRoomById(data.room_id);
      if (roomData) {
        setRoom(roomData);
      }

      const { data: tenantData } = await DatabaseService.getTenantById(data.tenant_id);
      if (tenantData) {
        setTenant(tenantData);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contract',
      'Are you sure you want to delete this contract? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error: deleteError } = await DatabaseService.deleteContract(contractId);
            if (deleteError) {
              Alert.alert('Error', 'Failed to delete contract');
            } else {
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  const handleUpdateStatus = async (newStatus: string) => {
    const { error: updateError } = await DatabaseService.updateContract(contractId, {
      status: newStatus as any,
    });
    if (updateError) {
      Alert.alert('Error', 'Failed to update contract status');
    } else {
      Alert.alert('Success', 'Contract status updated');
      loadContractDetails();
    }
  };

  if (loading) {
    return <Loading message="Loading contract..." />;
  }

  if (!contract) {
    return (
      <ScreenContainer>
        <ErrorMessage message="Contract not found" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>
          Contract {contract.lease_number || '(No Number)'}
        </Text>
        <View style={styles.headerButtons}>
          <Button
            title="Edit"
            onPress={() => navigation.navigate('EditContract', { contractId, roomId })}
            size="small"
            style={styles.editButton}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            size="small"
            variant="secondary"
          />
        </View>
      </View>

      {error && <ErrorMessage message={error} />}

      {tenant && (
        <Card>
          <Text style={styles.sectionTitle}>Tenant Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>
              {tenant.first_name} {tenant.last_name}
            </Text>
          </View>
          {tenant.email && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{tenant.email}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{tenant.phone}</Text>
          </View>
          <Button
            title="View Tenant Details"
            onPress={() => navigation.navigate('TenantDetails', { tenantId: tenant.id })}
            size="small"
            variant="outline"
            style={styles.viewTenantButton}
          />
        </Card>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Contract Information</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Lease Number:</Text>
          <Text style={styles.value}>{contract.lease_number || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[
            styles.value,
            styles.statusBadge,
            contract.status === 'active' && styles.status_active,
            contract.status === 'draft' && styles.status_draft,
            contract.status === 'expired' && styles.status_expired,
            contract.status === 'terminated' && styles.status_terminated,
            contract.status === 'renewed' && styles.status_renewed,
          ]}>
            {contract.status}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Start Date:</Text>
          <Text style={styles.value}>
            {new Date(contract.start_date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>End Date:</Text>
          <Text style={styles.value}>
            {new Date(contract.end_date).toLocaleDateString()}
          </Text>
        </View>
        {room && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Room:</Text>
            <Text style={styles.value}>Room {room.room_number}</Text>
          </View>
        )}
        {contract.notes && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Notes:</Text>
            <Text style={styles.value}>{contract.notes}</Text>
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Financial Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Rent Amount:</Text>
          <Text style={styles.priceValue}>${contract.rent_amount}/month</Text>
        </View>
        {contract.deposit_amount && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Deposit:</Text>
            <Text style={styles.value}>${contract.deposit_amount}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.label}>Payment Due:</Text>
          <Text style={styles.value}>Day {contract.payment_due_day} of each month</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Frequency:</Text>
          <Text style={styles.value}>{contract.payment_frequency}</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.statusButtons}>
          <Button
            title="Draft"
            onPress={() => handleUpdateStatus('draft')}
            size="small"
            variant={contract.status === 'draft' ? 'primary' : 'outline'}
            style={styles.statusButton}
          />
          <Button
            title="Active"
            onPress={() => handleUpdateStatus('active')}
            size="small"
            variant={contract.status === 'active' ? 'primary' : 'outline'}
            style={styles.statusButton}
          />
          <Button
            title="Expired"
            onPress={() => handleUpdateStatus('expired')}
            size="small"
            variant={contract.status === 'expired' ? 'primary' : 'outline'}
            style={styles.statusButton}
          />
          <Button
            title="Terminated"
            onPress={() => handleUpdateStatus('terminated')}
            size="small"
            variant={contract.status === 'terminated' ? 'primary' : 'outline'}
            style={styles.statusButton}
          />
        </View>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    width: 120,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  priceValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  status_active: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  status_draft: {
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
  },
  status_expired: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  status_terminated: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  status_renewed: {
    backgroundColor: '#F3E5F5',
    color: '#6A1B9A',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    minWidth: '45%',
  },
  viewTenantButton: {
    marginTop: 8,
  },
});
