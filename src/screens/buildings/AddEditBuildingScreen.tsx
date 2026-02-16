import React, { useState, useEffect } from 'react';
import {
  View,
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

interface AddEditBuildingScreenProps {
  route?: any;
  navigation: any;
}

export const AddEditBuildingScreen: React.FC<AddEditBuildingScreenProps> = ({
  route,
  navigation,
}) => {
  const buildingId = route?.params?.buildingId;
  const isEdit = !!buildingId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState('');
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [description, setDescription] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [buildingType, setBuildingType] = useState('residential');

  useEffect(() => {
    loadUserProfile();
    if (isEdit) {
      loadBuildingData();
    }
  }, []);

  const loadUserProfile = async () => {
    const user = await AuthService.getCurrentUser();
    if (user) {
      const { data } = await DatabaseService.getUserProfile(user.id);
      if (data) {
        setClientId(data.client_id);
      }
    }
  };

  const loadBuildingData = async () => {
    setLoading(true);
    const { data, error: fetchError } = await DatabaseService.getBuildingById(buildingId);
    if (fetchError || !data) {
      setError('Failed to load building data');
      setLoading(false);
      return;
    }

    setName(data.name);
    setAddress(data.address);
    setCity(data.city);
    setState(data.state || '');
    setCountry(data.country);
    setPostalCode(data.postal_code || '');
    setDescription(data.description || '');
    setTotalFloors(data.total_floors.toString());
    setTotalRooms(data.total_rooms.toString());
    setYearBuilt(data.year_built?.toString() || '');
    setBuildingType(data.building_type);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name || !address || !city || !country || !totalFloors || !totalRooms) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    const buildingData = {
      client_id: clientId,
      name,
      address,
      city,
      state: state || null,
      country,
      postal_code: postalCode || null,
      description: description || null,
      total_floors: parseInt(totalFloors, 10),
      total_rooms: parseInt(totalRooms, 10),
      year_built: yearBuilt ? parseInt(yearBuilt, 10) : null,
      building_type: buildingType as 'residential' | 'commercial' | 'mixed',
      status: 'active' as const,
      amenities: null,
      image_url: null,
    };

    try {
      if (isEdit) {
        const { error: updateError } = await DatabaseService.updateBuilding(
          buildingId,
          buildingData,
        );
        if (updateError) {
          setError('Failed to update building');
          setLoading(false);
          return;
        }
        Alert.alert('Success', 'Building updated successfully');
      } else {
        const { error: createError } = await DatabaseService.createBuilding(buildingData);
        if (createError) {
          setError('Failed to create building');
          setLoading(false);
          return;
        }
        Alert.alert('Success', 'Building created successfully');
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
        <Text style={styles.title}>{isEdit ? 'Edit Building' : 'Add New Building'}</Text>

        {error && <ErrorMessage message={error} />}

        <Input
          label="Building Name *"
          placeholder="Enter building name"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Address *"
          placeholder="Enter street address"
          value={address}
          onChangeText={setAddress}
        />

        <Input
          label="City *"
          placeholder="Enter city"
          value={city}
          onChangeText={setCity}
        />

        <Input
          label="State/Province"
          placeholder="Enter state or province"
          value={state}
          onChangeText={setState}
        />

        <Input
          label="Country *"
          placeholder="Enter country"
          value={country}
          onChangeText={setCountry}
        />

        <Input
          label="Postal Code"
          placeholder="Enter postal code"
          value={postalCode}
          onChangeText={setPostalCode}
        />

        <Input
          label="Total Floors *"
          placeholder="Enter number of floors"
          value={totalFloors}
          onChangeText={setTotalFloors}
          keyboardType="numeric"
        />

        <Input
          label="Total Rooms *"
          placeholder="Enter total number of rooms"
          value={totalRooms}
          onChangeText={setTotalRooms}
          keyboardType="numeric"
        />

        <Input
          label="Year Built"
          placeholder="Enter year built"
          value={yearBuilt}
          onChangeText={setYearBuilt}
          keyboardType="numeric"
        />

        <Input
          label="Description"
          placeholder="Enter building description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Button
          title={isEdit ? 'Update Building' : 'Create Building'}
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
