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

type Building = Database['public']['Tables']['buildings']['Row'];

interface AddEditRoomScreenProps {
  route?: any;
  navigation: any;
}

export const AddEditRoomScreen: React.FC<AddEditRoomScreenProps> = ({
  route,
  navigation,
}) => {
  const roomId = route?.params?.roomId;
  const buildingId = route?.params?.buildingId;
  const isEdit = !!roomId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState('');
  
  const [selectedBuilding, setSelectedBuilding] = useState<Building | undefined>();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roomNumber, setRoomNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [roomType, setRoomType] = useState('1bedroom');
  const [areaSqft, setAreaSqft] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [description, setDescription] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    loadUserProfile();
    if (isEdit) {
      loadRoomData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async () => {
    const user = await AuthService.getCurrentUser();
    if (user) {
      const { data } = await DatabaseService.getUserProfile(user.id);
      if (data) {
        setClientId(data.client_id);
        await loadBuildings(data.client_id);
      }
    }
  };

  const loadBuildings = async (clientIdParam: string) => {
    const { data, error: buildingsError } = await DatabaseService.getBuildings(clientIdParam);
    if (!buildingsError && data) {
      setBuildings(data);
      
      // If buildingId is passed from navigation, pre-select it
      if (buildingId && !isEdit) {
        const building = data.find(b => b.id === buildingId);
        if (building) {
          setSelectedBuilding(building);
        }
      }
    }
  };

  const loadRoomData = async () => {
    setLoading(true);
    const { data, error: fetchError } = await DatabaseService.getRoomById(roomId);
    if (fetchError || !data) {
      setError('Failed to load room data');
      setLoading(false);
      return;
    }

    setRoomNumber(data.room_number);
    setFloorNumber(data.floor_number?.toString() || '');
    setRoomType(data.room_type);
    setAreaSqft(data.area_sqft?.toString() || '');
    setBedrooms(data.bedrooms.toString());
    setBathrooms(data.bathrooms.toString());
    setDescription(data.description || '');
    setRentAmount(data.rent_amount.toString());
    setDepositAmount(data.deposit_amount?.toString() || '');
    setCurrency(data.currency);
    
    // Load building for this room
    const { data: buildingData } = await DatabaseService.getBuildingById(data.building_id);
    if (buildingData) {
      setSelectedBuilding(buildingData);
    }
    
    setLoading(false);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!roomNumber || !bedrooms || !bathrooms || !rentAmount || !selectedBuilding) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    const roomData = {
      client_id: clientId,
      building_id: selectedBuilding.id,
      room_number: roomNumber,
      floor_number: floorNumber ? parseInt(floorNumber, 10) : null,
      room_type: roomType as any,
      area_sqft: areaSqft ? parseFloat(areaSqft) : null,
      bedrooms: parseInt(bedrooms, 10),
      bathrooms: parseFloat(bathrooms),
      description: description || null,
      rent_amount: parseFloat(rentAmount),
      deposit_amount: depositAmount ? parseFloat(depositAmount) : null,
      currency,
      status: 'available' as const,
      amenities: null,
      image_urls: null,
      available_from: null,
    };

    try {
      if (isEdit) {
        const { error: updateError } = await DatabaseService.updateRoom(roomId, roomData);
        if (updateError) {
          setError('Failed to update room');
          setLoading(false);
          return;
        }
        Alert.alert('Success', 'Room updated successfully');
      } else {
        const { error: createError } = await DatabaseService.createRoom(roomData as any);
        if (createError) {
          setError('Failed to create room');
          setLoading(false);
          return;
        }
        Alert.alert('Success', 'Room created successfully');
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
        <Text style={styles.title}>{isEdit ? 'Edit Room' : 'Add New Room'}</Text>

        {error && <ErrorMessage message={error} />}

        <LookupInput
          label="Building *"
          placeholder="Select a building"
          value={selectedBuilding}
          data={buildings}
          onSelect={(building) => setSelectedBuilding(building)}
          displayField="name"
          secondaryField={(building) => `${building.address}, ${building.city}`}
          searchPlaceholder="Search buildings..."
          emptyMessage="No buildings found. Please create a building first."
          // Disabled in edit mode to prevent changing the building-room association
          // This maintains referential integrity in the one-to-many relationship
          disabled={isEdit}
        />

        <Input
          label="Room Number *"
          placeholder="e.g., 101, A1, etc."
          value={roomNumber}
          onChangeText={setRoomNumber}
        />

        <Input
          label="Floor Number"
          placeholder="Enter floor number"
          value={floorNumber}
          onChangeText={setFloorNumber}
          keyboardType="numeric"
        />

        <Input
          label="Bedrooms *"
          placeholder="Number of bedrooms"
          value={bedrooms}
          onChangeText={setBedrooms}
          keyboardType="numeric"
        />

        <Input
          label="Bathrooms *"
          placeholder="Number of bathrooms (e.g., 1.5)"
          value={bathrooms}
          onChangeText={setBathrooms}
          keyboardType="decimal-pad"
        />

        <Input
          label="Area (sqft)"
          placeholder="Enter area in square feet"
          value={areaSqft}
          onChangeText={setAreaSqft}
          keyboardType="numeric"
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
          label="Currency"
          placeholder="e.g., USD, EUR"
          value={currency}
          onChangeText={setCurrency}
        />

        <Input
          label="Description"
          placeholder="Enter room description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Button
          title={isEdit ? 'Update Room' : 'Create Room'}
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
