import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { backend } from '@/lib/backend';
import { Trash2, Plus, LogOut } from 'lucide-react-native';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (backend.isAuthenticated()) {
      setAuthenticated(true);
      loadTasks();
    }
  }, []);

  async function loadTasks() {
    const data = await backend.list('tasks');
    setTasks(data);
  }

  async function handleAuth(type) {
    try {
      if (type === 'login') await backend.login(email, password);
      else await backend.register(email, password);
      setAuthenticated(true);
      loadTasks();
    } catch (e) { alert('Auth failed'); }
  }

  async function addTask() {
    if (!newTask.trim()) return;
    const task = await backend.create('tasks', { title: newTask, status: 'todo' });
    setTasks([...tasks, task]);
    setNewTask('');
  }

  async function deleteTask(id) {
    await backend.delete('tasks', id);
    setTasks(tasks.filter(t => t.id !== id));
  }

  if (!authenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>TaskFlow Login</Text>
        <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
        <TouchableOpacity style={styles.button} onPress={() => handleAuth('login')}><Text style={styles.btnText}>Login</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleAuth('register')}><Text>Register</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity onPress={() => { backend.logout(); setAuthenticated(false); }}><LogOut size={24} /></TouchableOpacity>
      </View>
      <View style={styles.inputRow}>
        <TextInput style={styles.taskInput} placeholder="New task..." value={newTask} onChangeText={setNewTask} />
        <TouchableOpacity style={styles.addBtn} onPress={addTask}><Plus color="white" /></TouchableOpacity>
      </View>
      <FlatList data={tasks} keyExtractor={item => item.id} renderItem={({ item }) => (
        <View style={styles.taskItem}>
          <Text>{item.data.title}</Text>
          <TouchableOpacity onPress={() => deleteTask(item.id)}><Trash2 size={20} color="red" /></TouchableOpacity>
        </View>
      )} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 5, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputRow: { flexDirection: 'row', marginBottom: 20 },
  taskInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginRight: 10 },
  addBtn: { backgroundColor: '#28a745', padding: 10, borderRadius: 5 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: 'white', marginBottom: 10, borderRadius: 5 }
});