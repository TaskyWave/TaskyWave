import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { auth, database } from './firebase';
import Modal from './Modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import des styles de ReactQuill

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
    console.log("OK !")
    const taskRef = database.ref(`TASKS/${task.id}`);
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
    <div className="chart2">
      <div className="info-grid">
        {userRole === 'admin' && (
          <>
            <button className='edit-btn' onClick={() => setIsModalOpen(true)}>New Task</button>
          </>
        )}
        <div className="posts-list">
          {tasks.map((task) => {
            const userTask = userTasks.find((userTaskItem) => userTaskItem.id === task.id);
            return (
              <div key={task.id} className="post">
                <h3>{task.titre}</h3>
                <div dangerouslySetInnerHTML={{ __html: task.description }}></div>
                <div>
                  {userRole === 'user'
                    ? task.groupes
                        .filter((groupTask) => groupTask.groupeID === userGroup)
                        .map((groupTask) => (
                          <div key={groupTask.groupeID}>
                            <p>{groups.find((group) => group.id === groupTask.groupeID)?.nomGroupe || 'Groupe non trouvé'}</p>
                            <p>{new Date(groupTask.date).toLocaleDateString("fr-FR")} à {groupTask.heure}</p>
                          </div>
                        ))
                    : task.groupes.map((groupTask) => (
                        <div key={groupTask.groupeID}>
                          <p>{groups.find((group) => group.id === groupTask.groupeID)?.nomGroupe || 'Groupe non trouvé'}</p>
                          <p>{new Date(groupTask.date).toLocaleDateString("fr-FR")} à {groupTask.heure}</p>
                        </div>
                      ))}
                </div>
                <div>
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
                </div>
              </div>
            );
          })}
        </div>

        {isModalOpen && (
          <div className="modal">
            <div className="text-modal-content">
              <span className="close" onClick={() => { setIsModalOpen(false); setEditingTask(null); }}>&times;</span>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Titre de la tâche"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
                <ReactQuill
                  value={taskDescription}
                  onChange={setTaskDescription}
                  theme="snow"
                  placeholder="Description de la tâche"
                />
                <div className="group-tasks">
                  {groupTasks.map((groupTask, index) => (
                    <div key={index} className="group-task">
                      <select
                        name="groupeID"
                        value={groupTask.groupeID}
                        onChange={(e) => handleGroupTaskChange(index, e)}
                      >
                        <option value="">Sélectionnez un groupe</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.nomGroupe}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        name="date"
                        value={groupTask.date}
                        onChange={(e) => handleGroupTaskChange(index, e)}
                      />
                      <input
                        type="time"
                        name="heure"
                        value={groupTask.heure}
                        onChange={(e) => handleGroupTaskChange(index, e)}
                      />
                      <button className='un-delete-button' onClick={() => removeGroupTask(index)}>Supprimer</button>
                    </div>
                  ))}
                  <button className='un-button' onClick={addGroupTask}>Ajouter un groupe</button>
                </div>
                <button className='un-button' onClick={editingTask ? saveTask : addTask}>
                  {editingTask ? 'Mettre à jour la tâche' : 'Ajouter la tâche'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksManager;
