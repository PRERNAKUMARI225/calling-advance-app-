import React, { useState, useEffect } from 'react';
import { View, Text, Button, Linking, StyleSheet, TextInput, Alert } from 'react-native';

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
  const [remarks, setRemarks] = useState('');

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

  const currentCustomer = customers[currentCustomerIndex];

  const handleCall = () => {
    if (currentCustomer && currentCustomer.Mobno) {
      const { Mobno } = currentCustomer;
      const url = `tel:${Mobno.replace(/\s/g, '')}`;
      Linking.openURL(url);
    } else {
      console.error('No customer data available or phone number missing');
    }
  };

  const handleNextCustomer = () => {
    setCurrentCustomerIndex((prevIndex) => prevIndex + 1);
    setRemarks('');
  };

  const saveRemarks = async () => {
    try {
      if (!currentCustomer || !currentCustomer.id) {
        console.error('No customer selected');
        return;
      }

      const response = await fetch('http://192.168.29.149:3000/saveRemarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentCustomer.id,
          remarks: remarks,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save remarks');
      }
      Alert.alert('Remarks saved successfully!');
      fetchCustomers();
      setCurrentCustomerIndex((prevIndex) => prevIndex + 1); // Move to the next customer
      setRemarks(''); // Clear remarks input
    } catch (error) {
      console.error('Error saving remarks:', error);
      Alert.alert('Failed to save remarks');
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.text}>Customer ID: {currentCustomer ? currentCustomer.id : 'Loading...'}</Text>
        <Text style={styles.text}>Customer Name: {currentCustomer ? currentCustomer.Name : 'Loading...'}</Text>
        <Text style={styles.text}>Customer Phone: {currentCustomer ? currentCustomer.Mobno : 'Loading...'}</Text>
        <Text style={styles.text}>JCNo: {currentCustomer ? currentCustomer.JCNo : 'Loading...'}</Text>
        <Text style={styles.text}>Model: {currentCustomer ? currentCustomer.Model : 'Loading...'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter remarks"
          value={remarks}
          onChangeText={setRemarks}
        />
      </View>
      <View style={styles.buttonsContainer}>
        <Button title="Call Customer" onPress={handleCall} />
        <Button title="Next Customer" onPress={handleNextCustomer} disabled={!currentCustomer} />
        <Button title="Save Remarks" onPress={saveRemarks} disabled={!remarks} />
      </View>
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
  text: {
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
});

export default App;
