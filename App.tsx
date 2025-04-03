import {
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';

const App = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [id, setId] = useState('');

  const [nameError, setNameError] = useState(false);
  const [ageError, setAgeError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const APIData = async () => {
    const url = 'http://10.0.2.2:3000/users';

    try {
      let result = await fetch(url,{
        method:'GET'
      });

      if (!result.ok) return;

      let jsonData = await result.json();
      console.log('Fetched Data:', jsonData);

      if (Array.isArray(jsonData)) {
        setData(jsonData);
        setFilteredData(jsonData); // Initially, filteredData = API Data
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const saveData = async () => {
    if (!name || !age || !email) {
      setError('All fields are required');
      return;
    }
    setError('');
    let userData = {name, age: parseInt(age), email};

    try {
      let result = await fetch('http://10.0.2.2:3000/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData),
      });
      if (result.ok) {
        APIData();
        setShowModal(false);
        setName('');
        setAge('');
        setEmail('');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const searchUser = async text => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredData(data); // Reset to API data when search is empty
    } else {
      const filtered = data.filter(
        user =>
          user.name.toLowerCase().includes(text.toLowerCase()) ||
          user.email.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredData(filtered);
    }

    const url = `http://10.0.2.2:3000/users?q=${text}`;
    try {
      let result = await fetch(url);
      let jsonData = await result.json();
      setSearchData(jsonData);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching user:', error);
    }
  };

  const UserDelete = async id => {
    const url = `http://10.0.2.2:3000/users/${id}`;
    try {
      let result = await fetch(url, {method: 'DELETE'});

      if (result.ok) {
        console.warn('User Deleted');
        setData(prevData => prevData.filter(user => user.id !== id));
      } else {
        console.warn('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  useEffect(() => {
    APIData();
  }, []);

  const updateUser = data => {
    setShowModal(true);
    setSelectedUser(data);
    setIsEditMode(true);
    setId(data.id || ''); // ✅ ID ko set karo
    setName(data.name || '');
    setAge(data.age ? data.age.toString() : '');
    setEmail(data.email || '');
  };

  const addUser = () => {
    setShowModal(true);
    setSelectedUser(null);
    setIsEditMode(false); // Ye add mode hai
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Data</Text>
      <View style={{marginRight: 275, marginBottom: -40}}>
        <Button title="Add User" onPress={addUser} />
      </View>

      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter Name"
            />
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter Age"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter Email"
            />
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title={isEditMode ? 'Update' : 'Save'}
              onPress={isEditMode ? updateUser : saveData}
              color={isEditMode ? 'blue' : 'green'}
            />
            <Button title="Close" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
      <TextInput
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          width: 150,
          marginLeft: 185,
          borderRadius: 5,
        }}
        placeholder={'Search'}
        value={searchText}
        onChangeText={searchUser}
      />

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.dataWrapper}>
            <View>
              <Text style={styles.text}>Name: {item.name}</Text>
            </View>
            <View>
              <Text style={styles.text}>Age: {item.age}</Text>
            </View>
            <View>
              <Text style={styles.text}>Id: {item.id}</Text>
            </View>
            <View style={styles.updateSection}>
              <Button
                title="Update"
                onPress={() => updateUser(item)}
                color="blue"
              />
            </View>

            {/* Delete Button Section */}
            <View style={styles.deleteSection}>
              <Button
                title="Delete"
                onPress={() => UserDelete(item.id)}
                color="red"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noData}>No Users Found</Text>} // Show when no users match
      />

      <Modal visible={showModal} transparent={true} animationType="slide">
        <UserModal
          setShowModal={setShowModal}
          selectedUser={selectedUser}
          APIData={APIData}
          id={id}
        />
      </Modal>
    </View>
  );
};

const UserModal = ({setShowModal, selectedUser, APIData,id}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(id);

  useEffect(() => {
    if (selectedUser) {
      setName(selectedUser.name || '');
      setEmail(selectedUser.email || '');
      setAge(selectedUser.age ? selectedUser.age.toString() : '');
    }
  }, [selectedUser]);

  const updateUser = async () => {
    console.log('Selected User:', selectedUser); // Debugging
    if (!selectedUser || !selectedUser.id) {
      console.warn('Error: User id is missing');
      return;
    }
    console.warn(name, age, email, selectedUser.id);
    const id = selectedUser.id;
    const url = `http://10.0.2.2:3000/users/${id}`;
    console.log('Updating User:', {name, age, email});
    try {
      let response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          age: age ? parseInt(age, 10) : null,
          email: email.trim(),
        }),
      });

      let result = await response.json();
      console.log('Response:', result); // Log response data

      if (response.ok) {
        console.warn('✅ User Updated Successfully');
        APIData(); // Fetch updated data
        setShowModal(false); // Close modal
      } else {
        console.warn('❌ Failed to update user');
      }

       // Close modal only after updating
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <TextInput
          style={styles.input}
          value={id ? id.toString() : ''} // ✅ Ensure ID is correctly displayed
          editable={false}
          placeholder="Enter ID"
        />
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={text => setName(text)}
          placeholder="Enter Name"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={text => setEmail(text)}
          placeholder="Enter Email"
        />
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={text => setAge(text)}
          placeholder="Enter age"
          keyboardType="numeric"
        />
        <View style={{marginBottom: 5}}>
          <Button title="Update" onPress={updateUser} color="blue" />
        </View>
        <Button title="Close" onPress={() => setShowModal(false)} />
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'skyblue',
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: '#FFF',
  },
  dataWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 10,
    marginVertical: 5,
    width: '97%',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'column', // Stack buttons vertically
    alignItems: 'center', // Align them properly
    justifyContent: 'space-evenly', // Even spacing
    height: 80, // Ensures proper spacing
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    fontSize: 20,
    borderColor: 'green',
    width: 300,
    marginBottom: 10,
  },
});
