import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const EcolesManager = () => {
  const [ecoles, setEcoles] = useState([]);
  const [ecole, setEcole] = useState('');
  const [editingEcole, setEditingEcole] = useState(null);

  useEffect(() => {
    const ecolesRef = firebase.database().ref('ECOLES');
    ecolesRef.on('value', (snapshot) => {
      const ecoleData = snapshot.val();
      if (ecoleData) {
        const ecolesList = Object.keys(ecoleData).map((key) => ({
          id: key,
          ...ecoleData[key],
        }));
        setEcoles(ecolesList);
      } else {
        setEcoles([]);
      }
    });

    return () => {
      ecolesRef.off();
    };
  }, []);

  const addEcole = () => {
    const ecolesRef = firebase.database().ref('ECOLES');
    const newId = uuidv4();
    ecolesRef.child(newId).set({
      id: newId,
      ecole,
    });
    setEcole('');
  };

  const editEcole = (ecole) => {
    setEditingEcole(ecole);
    setEcole(ecole.ecole);
  };

  const saveEcole = () => {
    const ecoleRef = firebase.database().ref(`ECOLES/${editingEcole.id}`);
    ecoleRef.set({
      id: editingEcole.id,
      ecole,
    });
    setEditingEcole(null);
  };

  const deleteEcole = (ecole) => {
    const ecoleRef = firebase.database().ref(`ECOLES/${ecole.id}`);
    ecoleRef.remove();
  };

  return (
    <div >
      <h2>Administration</h2>
      <p>Options d'administration pour gérer les ecoles.</p>
      <div>
        <input
          type="text"
          placeholder="École"
          value={ecole}
          onChange={(e) => setEcole(e.target.value)}
          required
        />
        {editingEcole ? (
          <button className='check-btn done' onClick={saveEcole}>Sauvegarder</button>
        ) : (
          <button className='check-btn done' onClick={addEcole}>Ajouter</button>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>École</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ecoles.map((ecole) => (
            <tr key={ecole.id}>
              <td>{ecole.id}</td>
              <td>{ecole.ecole}</td>
              <td>
                <button className='edit-btn' onClick={() => editEcole(ecole)}>Éditer</button>
                <button className='delete-btn' onClick={() => deleteEcole(ecole)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EcolesManager;
