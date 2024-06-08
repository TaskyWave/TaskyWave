import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { auth } from './firebase';
import Modal from './Modal';

const TasksManager = () => {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [groupTasks, setGroupTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [userGroup, setUserGroup] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      setUser(currentUser);

      const userRef = firebase.database().ref(`USERS/${currentUser.uid}`);
      userRef.on('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          setUserGroup(userData.groupe);
          setUserRole(userData.role);
        } else {
          setUserGroup(null);
          setUserRole(null);
        }
      });

      const userTaskRef = firebase.database().ref(`USERS/${currentUser.uid}/userTasks`);
      userTaskRef.on('value', (snapshot) => {
        const userTasksData = snapshot.val();
        if (userTasksData) {
          const userTasksList = Object.keys(userTasksData).map((key) => ({
            id: key,
            ...userTasksData[key],
          }));
          setUserTasks(userTasksList);
        } else {
          setUserTasks([]);
        }
      });

      return () => {
        userRef.off();
        userTaskRef.off();
      };
    }
  }, []);

  useEffect(() => {
    const tasksRef = firebase.database().ref('TASKS');
    tasksRef.on('value', (snapshot) => {
      const tasksData = snapshot.val();
      let tasksList = [];
      if (tasksData) {
        tasksList = Object.keys(tasksData).map((key) => ({
          id: key,
          ...tasksData[key],
        }));

        if (userRole === 'user' && userGroup) {
          tasksList = tasksList.filter((task) =>
            task.groupes.some((groupTask) => groupTask.groupeID === userGroup)
          );
        }
      }
      setTasks(tasksList);
    });

    const groupsRef = firebase.database().ref('GROUPES');
    groupsRef.on('value', (snapshot) => {
      const groupsData = snapshot.val();
      if (groupsData) {
        const groupsList = Object.keys(groupsData).map((key) => ({
          id: key,
          ...groupsData[key],
        }));
        setGroups(groupsList);
      } else {
        setGroups([]);
      }
    });

    return () => {
      tasksRef.off();
      groupsRef.off();
    };
  }, [userRole, userGroup, userTasks]);

  const saveTask = useCallback(() => {
    const taskRef = firebase.database().ref(`TASKS/${editingTask.id}`);
    taskRef.set({
      id: editingTask.id,
      titre: taskTitle,
      description: taskDescription,
      groupes: groupTasks,
    });
    setEditingTask(null);
    setIsModalOpen(false);
  }, [editingTask, taskTitle, taskDescription, groupTasks]);

  const addTask = useCallback(() => {
    const taskRef = firebase.database().ref('TASKS');
    const newId = uuidv4();
    taskRef.child(newId).set({
      id: newId,
      titre: taskTitle,
      description: taskDescription,
      groupes: groupTasks,
    });
    setTaskTitle('');
    setTaskDescription('');
    setGroupTasks([]);
  }, [taskTitle, taskDescription, groupTasks]);

  const editTask = useCallback((task) => {
    setEditingTask(task);
    setTaskTitle(task.titre);
    setTaskDescription(task.description);
    setGroupTasks(task.groupes);
    setIsModalOpen(true);
  }, []);

  const deleteTask = useCallback((task) => {
    const taskRef = firebase.database().ref(`TASKS/${task.id}`);
    taskRef.remove();
  }, []);

  const handleGroupTaskChange = useCallback((index, event) => {
    const { name, value } = event.target;
    const updatedGroupTasks = [...groupTasks];
    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      parsedValue = value;
    }
    updatedGroupTasks[index] = {
      ...updatedGroupTasks[index],
      [name]: name === 'date' || name === 'heure' ? value : parsedValue,
    };
    setGroupTasks(updatedGroupTasks);
  }, [groupTasks]);

  const addGroupTask = useCallback(() => {
    setGroupTasks([...groupTasks, { groupeID: '', date: '', heure: '' }]);
  }, [groupTasks]);

  const removeGroupTask = useCallback((index) => {
    const updatedGroupTasks = groupTasks.filter((_, i) => i !== index);
    setGroupTasks(updatedGroupTasks);
  }, [groupTasks]);

  const markTaskAsDone = useCallback((taskId, isDone) => {
    const userTaskRef = firebase.database().ref(`USERS/${auth.currentUser.uid}/userTasks/${taskId}`);
    userTaskRef.set({ isDone });
  }, []);

  if (!tasks || !groups) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="chart">
      <h2>Tâches</h2>
      <p>Liste des exos</p>
      {userRole === 'admin' && (
        <div className="form-group">
          <input
            type="text"
            placeholder="Titre de la tâche"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description de la tâche"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            required
          />
          <div>
            {groupTasks.map((groupTask, index) => (
              <div key={index} className="group-task">
                <select
                  name="groupeID"
                  value={groupTask.groupeID}
                  onChange={(e) => handleGroupTaskChange(index, e)}
                  required
                >
                  <option value="" disabled>Choisissez un groupe</option>
                  {groups.map((groupItem) => (
                    <option key={groupItem.id} value={groupItem.id}>
                      {groupItem.nomGroupe}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  name="date"
                  placeholder="Date"
                  value={groupTask.date}
                  onChange={(e) => handleGroupTaskChange(index, e)}
                  required
                />
                <input
                  type="time"
                  name="heure"
                  placeholder="Heure"
                  value={groupTask.heure}
                  onChange={(e) => handleGroupTaskChange(index, e)}
                  required
                />
                <button type="button" onClick={() => removeGroupTask(index)}>
                  Supprimer
                </button>
              </div>
            ))}
            <button type="button" onClick={addGroupTask}>
              Ajouter un groupe et une date/heure
            </button>
          </div>
          <button className="check-btn done" onClick={addTask}>Ajouter</button>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Groupes</th>
            <th>Dates/Heures</th>
            <th>Actions</th>
            <th className='IDColumn' >ID</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const userTask = userTasks.find((userTaskItem) => userTaskItem.id === task.id);
            return (
              <tr key={task.id}>
                <td>{task.titre}</td>
                <td>{task.description}</td>
                {userRole === 'user' ? (
                  <>
                <td>
                  {task.groupes
                    .filter((groupTask) => groupTask.groupeID === userGroup)
                    .map((groupTask) => {
                      const group = groups.find((groupItem) => groupItem.id === groupTask.groupeID);
                      return `${group ? group.nomGroupe : 'Groupe non trouvé'}`;
                    })
                    .join(', ')}
                </td>
                <td>
                  {task.groupes
                    .filter((groupTask) => groupTask.groupeID === userGroup)
                    .map((groupTask) => {
                      return `${new Date(groupTask.date).toLocaleDateString("fr-FR")} à ${groupTask.heure}`;
                    })
                    .join(', ')}
                </td>
                </>
                ) : ( 
                <>
                <td>
                  {task.groupes.map((groupTask) => {
                    const group = groups.find((groupItem) => groupItem.id === groupTask.groupeID);
                    return `${group ? group.nomGroupe : 'Groupe non trouvé'}`;
                  }).join(', ')}
                </td>
                <td>
                  {task.groupes.map((groupTask) => {
                    const group = groups.find((groupItem) => groupItem.id === groupTask.groupeID);
                    return `${new Date(groupTask.date).toLocaleDateString("fr-FR")} à ${groupTask.heure}`;
                  }).join(', ')}
                </td>
                </>
              )}
                <td>
                  <button
                    className={`check-btn ${userTask && userTask.isDone ? 'done' : 'not-done'}`}
                    onClick={() => markTaskAsDone(task.id, !userTask || !userTask.isDone)}
                  >
                    {userTask && userTask.isDone ? 'Terminé' : 'Non terminé'}
                  </button>
                  {userRole === 'admin' && (
                    <>
                      <button className='edit-btn' onClick={() => editTask(task)}>Éditer</button>
                      <button className='delete-btn' onClick={() => deleteTask(task)}>Supprimer</button>
                    </>
                  )}
                </td>
                <td className='TaskID'>{task.id}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Titre de la tâche"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description de la tâche"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            required
          />
          <div>
            {groupTasks.map((groupTask, index) => (
              <div key={index} className="group-task">
                <select
                  name="groupeID"
                  value={groupTask.groupeID}
                  onChange={(e) => handleGroupTaskChange(index, e)}
                  required
                >
                  <option value="" disabled>Choisissez un groupe</option>
                  {groups.map((groupItem) => (
                    <option key={groupItem.id} value={groupItem.id}>
                      {groupItem.nomGroupe}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  name="date"
                  placeholder="Date"
                  value={groupTask.date}
                  onChange={(e) => handleGroupTaskChange(index, e)}
                  required
                />
                <input
                  type="time"
                  name="heure"
                  placeholder="Heure"
                  value={groupTask.heure}
                  onChange={(e) => handleGroupTaskChange(index, e)}
                  required
                />
                <button type="button" onClick={() => removeGroupTask(index)}>
                  Supprimer
                </button>
              </div>
            ))}
            <button type="button" onClick={addGroupTask}>
              Ajouter un groupe et une date/heure
            </button>
          </div>
          <button className="check-btn done" onClick={saveTask}>Sauvegarder</button>
        </div>
      </Modal>
    </div>
  );
};

export default TasksManager;
