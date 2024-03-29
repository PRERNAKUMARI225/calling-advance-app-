// App.js

import React, { useState, useEffect } from 'react';
import { View, Text, Button, Linking, StyleSheet } from 'react-native';

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);

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
      const url = `tel:${Mobno.replace(/\s/g, '')}`; // Remove any whitespace in the phone number
      Linking.openURL(url);
    } else {
      console.error('No customer data available or phone number missing');
    }
  };

  const handleNextCustomer = () => {
    setCurrentCustomerIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.text}>Customer Name: {currentCustomer ? currentCustomer.Name : 'Loading...'}</Text>
        <Text style={styles.text}>Customer Phone: {currentCustomer ? currentCustomer.Mobno : 'Loading...'}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <Button title="Call Customer" onPress={handleCall} />
        <Button title="Next Customer" onPress={handleNextCustomer} disabled={!currentCustomer} />
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
});

export default App;
