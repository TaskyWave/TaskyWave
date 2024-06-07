import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const GroupesManager = () => {
  const [groupes, setGroupes] = useState([]);
  const [nomGroupe, setNomGroupe] = useState('');
  const [annee, setAnnee] = useState('');
  const [ecole, setEcole] = useState('');
  const [departement, setDepartement] = useState('');
  const [editingGroupe, setEditingGroupe] = useState(null);

  useEffect(() => {
    const groupeRef = firebase.database().ref('GROUPES');
    groupeRef.on('value', (snapshot) => {
      const groupesData = snapshot.val();
      if (groupesData) {
        const groupesList = Object.keys(groupesData).map((key) => ({
          id: key,
          ...groupesData[key],
        }));
        setGroupes(groupesList);
      } else {
        setGroupes([]);
      }
    });

    return () => {
      groupeRef.off();
    };
  }, []);

  const addGroupe = () => {
    const groupeRef = firebase.database().ref('GROUPES');
    const newId = uuidv4();
    groupeRef.child(newId).set({
      id: newId,
      nomGroupe,
      annee,
      ecole,
      departement,
    });
    setNomGroupe('');
    setAnnee('');
    setEcole('');
    setDepartement('');
  };

  const editGroupe = (groupe) => {
    setEditingGroupe(groupe);
    setNomGroupe(groupe.nomGroupe);
    setAnnee(groupe.annee);
    setEcole(groupe.ecole);
    setDepartement(groupe.departement);
  };

  const saveGroupe = () => {
    const groupeRef = firebase.database().ref(`GROUPES/${editingGroupe.id}`);
    groupeRef.set({
      id: editingGroupe.id,
      nomGroupe,
      annee,
      ecole,
      departement,
    });
    setEditingGroupe(null);
  };

  const deleteGroupe = (groupe) => {
    const groupeRef = firebase.database().ref(`GROUPES/${groupe.id}`);
    groupeRef.remove();
  };

  return (
    <div >
      <h2>Administration</h2>
      <p>Options d'administration pour gérer les groupes.</p>
      <div>
        <input
          type="text"
          placeholder="Nom du groupe"
          value={nomGroupe}
          onChange={(e) => setNomGroupe(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Année"
          value={annee}
          onChange={(e) => setAnnee(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="École"
          value={ecole}
          onChange={(e) => setEcole(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Département"
          value={departement}
          onChange={(e) => setDepartement(e.target.value)}
          required
        />
        {editingGroupe ? (
          <button className='check-btn done' onClick={saveGroupe}>Sauvegarder</button>
        ) : (
          <button className='check-btn done' onClick={addGroupe}>Ajouter</button>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom du groupe</th>
            <th>Année</th>
            <th>École</th>
            <th>Département</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groupes.map((groupe) => (
            <tr key={groupe.id}>
              <td>{groupe.id}</td>
              <td>{groupe.nomGroupe}</td>
              <td>{groupe.annee}</td>
              <td>{groupe.ecole}</td>
              <td>{groupe.departement}</td>
              <td>
                <button className='edit-btn' onClick={() => editGroupe(groupe)}>Éditer</button>
                <button className='delete-btn' onClick={() => deleteGroupe(groupe)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupesManager;
