import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ScreenContainer, Input, Button, ErrorMessage, LookupInput } from '../../components/ui';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import type { Database } from '../../types/database.types';

type Tenant = Database['public']['Tables']['tenants']['Row'];

interface AddEditContractScreenProps {
  route?: any;
  navigation: any;
}

export const AddEditContractScreen: React.FC<AddEditContractScreenProps> = ({
  route,
  navigation,
}) => {
  const contractId = route?.params?.contractId;
  const roomId = route?.params?.roomId;
  const isEdit = !!contractId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState('');

  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leaseNumber, setLeaseNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentDueDay, setPaymentDueDay] = useState('1');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadUserProfile();
    if (isEdit) {
      loadContractData();
    } else if (roomId) {
      loadRoomRentAmount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async () => {
    const user = await AuthService.getCurrentUser();
    if (user) {
      const { data } = await DatabaseService.getUserProfile(user.id);
      if (data) {
        setClientId(data.client_id);
        await loadTenants(data.client_id);
      }
    }
  };

  const loadTenants = async (clientIdParam: string) => {
    const { data, error: tenantsError } = await DatabaseService.getTenants(clientIdParam);
    if (!tenantsError && data) {
      setTenants(data);
    }
  };

  const loadRoomRentAmount = async () => {
    if (!roomId) return;
    const { data } = await DatabaseService.getRoomById(roomId);
    if (data) {
      setRentAmount(data.rent_amount.toString());
      if (data.deposit_amount) {
        setDepositAmount(data.deposit_amount.toString());
      }
    }
  };

  const loadContractData = async () => {
    setLoading(true);
    const { data, error: fetchError } = await DatabaseService.getContractById(contractId);
    if (fetchError || !data) {
      setError('Failed to load contract data');
      setLoading(false);
      return;
    }

    setLeaseNumber(data.lease_number || '');
    setStartDate(data.start_date);
    setEndDate(data.end_date);
    setRentAmount(data.rent_amount.toString());
    setDepositAmount(data.deposit_amount?.toString() || '');
    setPaymentDueDay(data.payment_due_day.toString());
    setPaymentFrequency(data.payment_frequency);
    setNotes(data.notes || '');

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || !rentAmount) {
      setError('Please fill in all required fields (start date, end date, rent amount)');
      return;
    }

    if (!isEdit && !selectedTenant) {
      setError('Please select a tenant');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    const dueDayNum = parseInt(paymentDueDay, 10);
    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) {
      setError('Payment due day must be between 1 and 31');
      return;
    }

    setLoading(true);
    setError('');

    const contractData: any = {
      client_id: clientId,
      room_id: roomId,
      lease_number: leaseNumber || null,
      start_date: startDate,
      end_date: endDate,
      rent_amount: parseFloat(rentAmount),
      deposit_amount: depositAmount ? parseFloat(depositAmount) : null,
      payment_due_day: dueDayNum,
      payment_frequency: paymentFrequency as any,
      notes: notes || null,
      status: 'draft' as const,
    };

    if (!isEdit && selectedTenant) {
      contractData.tenant_id = selectedTenant.id;
    }

    try {
      if (isEdit) {
        const { error: updateError } = await DatabaseService.updateContract(contractId, contractData);
        if (updateError) {
          setError('Failed to update contract');
          setLoading(false);
          return;
        }
        Alert.alert('Success', 'Contract updated successfully');
      } else {
        const { error: createError } = await DatabaseService.createContract(contractData);
        if (createError) {
          setError('Failed to create contract. A room can only have one active contract.');
          setLoading(false);
          return;
        }
        Alert.alert('Success', 'Contract created successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Text style={styles.title}>{isEdit ? 'Edit Contract' : 'Add New Contract'}</Text>

        {error && <ErrorMessage message={error} />}

        {!isEdit && (
          <LookupInput
            label="Tenant *"
            placeholder="Select a tenant"
            value={selectedTenant}
            data={tenants}
            onSelect={(tenant) => setSelectedTenant(tenant)}
            displayField={(tenant) => `${tenant.first_name} ${tenant.last_name}`}
            secondaryField={(tenant) => tenant.phone}
            searchPlaceholder="Search tenants..."
            emptyMessage="No tenants found. Please create a tenant first."
          />
        )}

        <Input
          label="Lease Number"
          placeholder="e.g., LEASE-001"
          value={leaseNumber}
          onChangeText={setLeaseNumber}
        />

        <Input
          label="Start Date *"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
        />

        <Input
          label="End Date *"
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={setEndDate}
        />

        <Input
          label="Rent Amount *"
          placeholder="Monthly rent amount"
          value={rentAmount}
          onChangeText={setRentAmount}
          keyboardType="numeric"
        />

        <Input
          label="Deposit Amount"
          placeholder="Security deposit"
          value={depositAmount}
          onChangeText={setDepositAmount}
          keyboardType="numeric"
        />

        <Input
          label="Payment Due Day (1-31)"
          placeholder="Day of month rent is due"
          value={paymentDueDay}
          onChangeText={setPaymentDueDay}
          keyboardType="numeric"
        />

        <Input
          label="Notes"
          placeholder="Additional contract notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <Button
          title={isEdit ? 'Update Contract' : 'Create Contract'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
        />

        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
});
