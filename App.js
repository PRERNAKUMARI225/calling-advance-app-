import React, { useState, useEffect } from 'react';
import { View, Text, Button, Linking, StyleSheet, TextInput, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const reasonsData = [
  "High Distance From Home",
  "High Service Cost",
  "High Waiting time",
  "Out of Station",
  "Poor Repair Quality",
  "Service Done at other Dealership",
  "Service Done at Private Workshop",
  "Service Done at Same Dealer",
  "Staff Behaviour",
  "Vehicle Sold",
  "Vehicle theft",
  "Wrong number"
];

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState(new Date());
  const [bookingDate, setBookingDate] = useState(new Date());
  const [isFollowUpDatePickerVisible, setFollowUpDatePickerVisibility] = useState(false);
  const [isBookingDatePickerVisible, setBookingDatePickerVisibility] = useState(false);
  const [isReasonsModalVisible, setReasonsModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [notComingReason, setNotComingReason] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://192.168.29.149:3000/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCall = (Mobno) => {
    const url = `tel:${Mobno.replace(/\s/g, '')}`;
    Linking.openURL(url);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const saveRemarks = async () => {
    try {
      if (!selectedCustomer || !selectedCustomer.id) {
        console.error('No customer selected');
        return;
      }

      const response = await fetch('http://192.168.29.149:3000/saveRemarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedCustomer.id,
          remarks: notComingReason ? 'Not Coming' : remarks,
          followUpDate: followUpDate.toISOString().split('T')[0],
          bookingDate: bookingDate.toISOString().split('T')[0],
          selectedReason: notComingReason ? notComingReason : selectedReason,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save remarks');
      }
      const data = await response.json();
      if (data.success) {
        Alert.alert('Remarks saved successfully!');
        fetchCustomers();
        setRemarks('');
        setBookingDate(new Date());
        setSelectedReason('');
        setNotComingReason('');
        setSelectedCustomer(null);
        if (notComingReason) {
          Alert.alert('Selected reason:', notComingReason); 
        }
      } else {
        throw new Error('Failed to save remarks');
      }
    } catch (error) {
      console.error('Error saving remarks:', error);
      Alert.alert('Failed to save remarks');
    }
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    setReasonsModalVisible(false);
  };

  const handleNotComingSelect = (reason) => {
    setNotComingReason(reason);
    setRemarks('Not Coming');
    setReasonsModalVisible(false);
  };

  const handleFollowUpDateChange = (date) => {
    setFollowUpDate(date);
    setFollowUpDatePickerVisibility(false);
  };

  return (
    <View style={styles.container}>
      {!selectedCustomer ? (
        <FlatList
          data={customers}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCustomerSelect(item)}>
              <View style={styles.customerItem}>
                <Text style={styles.customerName}>{item.Name}</Text>
                <Text>{item.Model}</Text>
                <Text>{item.JCNo}</Text>
                <Button title="Call" onPress={() => handleCall(item.Mobno)} />
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <View>
          <Text style={styles.heading}>CUSTOMER DETAILS</Text>
          <Text style={styles.text}>Customer ID: {selectedCustomer.id}</Text>
          <Text style={styles.text}>Customer Name: {selectedCustomer.Name}</Text>
          <Text style={styles.text}>Customer Phone: {selectedCustomer.Mobno}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter remarks"
            value={remarks}
            onChangeText={setRemarks}
          />
          <View>
            <Button title="Select Follow-up Date" onPress={() => setFollowUpDatePickerVisibility(true)} />
            <DateTimePickerModal
              isVisible={isFollowUpDatePickerVisible}
              mode="date"
              date={followUpDate}
              onConfirm={handleFollowUpDateChange}
              onCancel={() => setFollowUpDatePickerVisibility(false)}
              minimumDate={new Date()} // Set minimum date to current date
            />
            <Text>{followUpDate.toDateString()}</Text>
          </View>
          <View>
            <Button title="Select Booking Date" onPress={() => setBookingDatePickerVisibility(true)} />
            <DateTimePickerModal
              isVisible={isBookingDatePickerVisible}
              mode="date"
              onConfirm={(date) => { setBookingDate(date); setBookingDatePickerVisibility(false); }}
              onCancel={() => setBookingDatePickerVisibility(false)}
              maximumDate={new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 9))} // Set maximum date to 9 days from current date
            />
            <Text>{bookingDate.toDateString()}</Text>
          </View>
          <View style={{ marginTop: 20 }}>
            <Button title="Not Coming Reason" onPress={() => setReasonsModalVisible(true)} />
            <Modal
              animationType="slide"
              transparent={true}
              visible={isReasonsModalVisible}
              onRequestClose={() => setReasonsModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={reasonsData}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => handleNotComingSelect(item)}>
                        <Text style={styles.reasonText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />
                </View>
              </View>
            </Modal>
          </View>
          <View style={styles.buttonsContainer}>
            <Button title="Call Customer" onPress={() => handleCall(selectedCustomer.Mobno)} />
            <Button title="Save Remarks" onPress={saveRemarks} disabled={!remarks} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 20,
  },
  text: {
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'black',
    borderWidth: 2,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    maxHeight: 300,
  },
  reasonText: {
    fontSize: 16,
    paddingVertical: 10,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});

export default App;
