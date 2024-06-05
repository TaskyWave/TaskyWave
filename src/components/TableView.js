import React, { useState, useEffect } from 'react';
import Items from './Items';
import Modal from './Modal';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { getDatabase, ref, child, get } from "firebase/database";
import { getAuth } from "firebase/auth";

const Taches = [];

export const TableView = () => {
  const [products, setProducts] = useState(Taches);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTask, setNewTask] = useState({
    name: '',
    desc: '',
    jour: '',
    heure: '',
    groupe: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [userTasks, setUserTasks] = useState({});
  const [userRole, setUserRole] = useState('');
  const [userGroupId, setUserGroupId] = useState(null);
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    // Fetch user role and group
    if (userId) {
      const dbRef = ref(getDatabase());
      get(child(dbRef, `USERS/${userId}`)).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserRole(userData.role);
          setUserGroupId(userData.groupe);
        }
      }).catch((error) => {
        console.error("Error fetching user data: ", error);
      });
    }
  }, [userId]);

  useEffect(() => {
    // Fetch groups from Firebase
    const groupeRef = ref(getDatabase(), 'GROUPES');
    get(groupeRef).then((snapshot) => {
      const groupesData = snapshot.val();
      if (groupesData) {
        const groupesList = Object.keys(groupesData).map((key) => ({
          id: key,
          ...groupesData[key],
        }));
        setGroups(groupesList);
      } else {
        setGroups([]);
      }
    }).catch((error) => {
      console.error("Error fetching groups: ", error);
    });
  }, []);

  useEffect(() => {
    if (userId) {
      const dbRef = ref(getDatabase());
      // Fetch tasks from Firebase
      get(child(dbRef, 'TASKS')).then((snapshot) => {
        if (snapshot.exists()) {
          const tasksData = snapshot.val();
          let tasksList = Object.keys(tasksData).map((key) => {
            const task = tasksData[key];
            return {
              id: key,
              ...task,
              groupe: groups.find(group => group.id === task.IDgroupe)?.nomGroupe || '',
              isDone: false,
            };
          });
          if (userRole === 'user') {
            tasksList = tasksList.filter(task => task.IDgroupe === userGroupId);
          }

          // Now fetch user tasks to check if they are done
          get(child(dbRef, `USERS/${userId}/userTasks`)).then((snapshot) => {
            if (snapshot.exists()) {
              const userTasksData = snapshot.val();
              tasksList = tasksList.map(task => ({
                ...task,
                isDone: userTasksData[task.id]?.isDone || false
              }));
              setUserTasks(userTasksData);
            }
            setProducts(tasksList);
          }).catch((error) => {
            console.error("Error fetching user tasks: ", error);
            setProducts(tasksList); // Set tasks even if userTasks fetch fails
          });

        } else {
          setProducts([]);
        }
      }).catch((error) => {
        console.error("Error fetching tasks: ", error);
      });
    }
  }, [userId, groups, userRole, userGroupId]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredProducts = Taches.filter(product =>
      product.name.toLowerCase().includes(value)
    );
    setProducts(filteredProducts);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
  };

  const handleDeleteTask = (taskId) => {
    const updatedProducts = products.filter(task => task.id !== taskId);
    setProducts(updatedProducts);
  };

  const handleEditTask = (taskToEdit) => {
    setNewTask(taskToEdit);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (newTask.id) {
      const updatedProducts = products.map(task =>
        task.id === newTask.id ? newTask : task
      );
      setProducts(updatedProducts);
    } else {
      const newTaskWithId = { ...newTask, id: uuidv4() };
      setProducts([...products, newTaskWithId]);
    }

    setNewTask({ id: null, name: '', desc: '', jour: '', heure: '', groupe: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="table-view">
      <div className="header">
        <h1>Listes des exercices et des rendus</h1>
        {userRole === 'admin' && (
          <button className="add-btn" onClick={() => setIsModalOpen(true)}>Nouvelle Tâche</button>
        )}
      </div>
      <Items 
        products={products} 
        onDeleteTask={handleDeleteTask} 
        onEditTask={handleEditTask} 
        setProducts={setProducts} 
        userId={userId}
        userRole={userRole}
      />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleFormSubmit} className="add-task-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newTask.name}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="text"
            name="desc"
            placeholder="Description"
            value={newTask.desc}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="date"
            name="jour"
            placeholder="Jour"
            value={newTask.jour}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="time"
            name="heure"
            placeholder="Heure"
            value={newTask.heure}
            onChange={handleChange}
            required
          />
          <br />
          <select name="groupe" value={newTask.groupe} onChange={handleChange} required>
            <option value="">Sélectionner un groupe</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.nomGroupe}</option>
            ))}
          </select>
          <br />
          <button type="submit" className="add-btn">Confirmer</button>
        </form>
      </Modal>
    </div>
  );
};
