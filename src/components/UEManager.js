import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const UEManager = () => {
  const [ues, setUes] = useState([]);
  const [nomUE, setNomUE] = useState('');
  const [editingUE, setEditingUE] = useState(null);

  useEffect(() => {
    const uesRef = firebase.database().ref('UES');
    uesRef.on('value', (snapshot) => {
      const uesData = snapshot.val();
      if (uesData) {
        const uesList = Object.keys(uesData).map((key) => ({
          id: key,
          ...uesData[key],
        }));
        setUes(uesList);
      } else {
        setUes([]);
      }
    });

    return () => {
      uesRef.off();
    };
  }, []);

  const addUE = () => {
    const uesRef = firebase.database().ref('UES');
    const newId = uuidv4();
    uesRef.child(newId).set({
      id: newId,
      nomUE,
    });
    setNomUE('');
  };

  const editUE = (ue) => {
    setEditingUE(ue);
    setNomUE(ue.nomUE);
  };

  const saveUE = () => {
    const ueRef = firebase.database().ref(`UES/${editingUE.id}`);
    ueRef.set({
      id: editingUE.id,
      nomUE,
    });
    setEditingUE(null);
  };

  const deleteUE = (ue) => {
    const ueRef = firebase.database().ref(`UES/${ue.id}`);
    ueRef.remove();
  };

  return (
    <div>
      <h2>Administration des Unités d'Enseignement</h2>
      <p>Options d'administration pour gérer les unités d'enseignement (UE).</p>
      <div>
        <input
          type="text"
          placeholder="Nom de l'UE"
          value={nomUE}
          onChange={(e) => setNomUE(e.target.value)}
        />
        {editingUE ? (
          <button className='check-btn done' onClick={saveUE}>Sauvegarder</button>
        ) : (
          <button className='check-btn done' onClick={addUE}>Ajouter</button>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom UE</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ues.map((ue) => (
            <tr key={ue.id}>
              <td>{ue.id}</td>
              <td>{ue.nomUE}</td>
              <td>
                <button className='edit-btn' onClick={() => editUE(ue)}>Éditer</button>
                <button className='delete-btn' onClick={() => deleteUE(ue)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UEManager;