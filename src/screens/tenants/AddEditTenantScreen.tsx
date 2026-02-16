import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { ScreenContainer, Input, Button, ErrorMessage } from '../../components/ui';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

interface AddEditTenantScreenProps {
  route?: any;
  navigation: any;
}

export const AddEditTenantScreen: React.FC<AddEditTenantScreenProps> = ({
  route,
  navigation,
}) => {
  const tenantId = route?.params?.tenantId;
  const clientId = route?.params?.clientId;
  const isEdit = !!tenantId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userClientId, setUserClientId] = useState(clientId || '');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [employer, setEmployer] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!userClientId) {
      loadUserProfile();
    }
    if (isEdit) {
      loadTenantData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async () => {
    const user = await AuthService.getCurrentUser();
    if (user) {
      const { data } = await DatabaseService.getUserProfile(user.id);
      if (data) {
        setUserClientId(data.client_id);
      }
    }
  };

  const loadTenantData = async () => {
    setLoading(true);
    const { data, error: fetchError } = await DatabaseService.getTenantById(tenantId);
    if (fetchError || !data) {
      setError('Failed to load tenant data');
      setLoading(false);
      return;
    }

    setFirstName(data.first_name);
    setLastName(data.last_name);
    setEmail(data.email || '');
    setPhone(data.phone);
    setDateOfBirth(data.date_of_birth || '');
    setNationalId(data.national_id || '');
    setEmergencyContactName(data.emergency_contact_name || '');
    setEmergencyContactPhone(data.emergency_contact_phone || '');
    setCurrentAddress(data.current_address || '');
    setOccupation(data.occupation || '');
    setEmployer(data.employer || '');
    setMonthlyIncome(data.monthly_income?.toString() || '');
    setNotes(data.notes || '');

    setLoading(false);
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (email && !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const tenantData = {
      client_id: userClientId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim(),
      date_of_birth: dateOfBirth || null,
      national_id: nationalId.trim() || null,
      emergency_contact_name: emergencyContactName.trim() || null,
      emergency_contact_phone: emergencyContactPhone.trim() || null,
      current_address: currentAddress.trim() || null,
      occupation: occupation.trim() || null,
      employer: employer.trim() || null,
      monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
      profile_image_url: null,
      status: 'active' as const,
      notes: notes.trim() || null,
    };

    if (isEdit) {
      const { error: updateError } = await DatabaseService.updateTenant(tenantId, tenantData);
      if (updateError) {
        setError('Failed to update tenant');
        setLoading(false);
      } else {
        Alert.alert('Success', 'Tenant updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } else {
      const { error: createError } = await DatabaseService.createTenant(tenantData);
      if (createError) {
        setError('Failed to create tenant');
        setLoading(false);
      } else {
        Alert.alert('Success', 'Tenant created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{isEdit ? 'Edit Tenant' : 'Add New Tenant'}</Text>

          {error && <ErrorMessage message={error} />}

          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Input
            label="First Name *"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
          />
          <Input
            label="Last Name *"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone *"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionTitle}>Personal Details</Text>
          <Input
            label="Date of Birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
          />
          <Input
            label="National ID"
            value={nationalId}
            onChangeText={setNationalId}
            placeholder="Enter national ID"
          />
          <Input
            label="Current Address"
            value={currentAddress}
            onChangeText={setCurrentAddress}
            placeholder="Enter current address"
            multiline
          />

          <Text style={styles.sectionTitle}>Employment</Text>
          <Input
            label="Occupation"
            value={occupation}
            onChangeText={setOccupation}
            placeholder="Enter occupation"
          />
          <Input
            label="Employer"
            value={employer}
            onChangeText={setEmployer}
            placeholder="Enter employer name"
          />
          <Input
            label="Monthly Income"
            value={monthlyIncome}
            onChangeText={setMonthlyIncome}
            placeholder="Enter monthly income"
            keyboardType="numeric"
          />

          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <Input
            label="Contact Name"
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            placeholder="Enter emergency contact name"
          />
          <Input
            label="Contact Phone"
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
            placeholder="Enter emergency contact phone"
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionTitle}>Additional Information</Text>
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter any additional notes"
            multiline
            numberOfLines={4}
          />

          <Button
            title={isEdit ? 'Update Tenant' : 'Create Tenant'}
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
});
