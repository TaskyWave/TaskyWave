import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const CoursManager = () => {
  const [cours, setCours] = useState([]);
  const [ues, setUes] = useState([]);
  const [nomCour, setNomCour] = useState('');
  const [ecole, setEcole] = useState('');
  const [ue, setUe] = useState('');
  const [profRef, setProfRef] = useState('');
  const [editingCours, setEditingCours] = useState(null);

  useEffect(() => {
    const coursRef = firebase.database().ref('COURS');
    coursRef.on('value', (snapshot) => {
      const CoursData = snapshot.val();
      if (CoursData) {
        const coursList = Object.keys(CoursData).map((key) => ({
          id: key,
          ...CoursData[key],
        }));
        setCours(coursList);
      } else {
        setCours([]);
      }
    });

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
      coursRef.off();
      uesRef.off();
    };
  }, []);

  const addCours = () => {
    const coursRef = firebase.database().ref('COURS');
    const newId = uuidv4();
    coursRef.child(newId).set({
      id: newId,
      nomCour,
      ecole,
      ue,
      profRef,
    });
    setNomCour('');
    setEcole('');
    setUe('');
    setProfRef('');
  };

  const editCours = (cours) => {
    setEditingCours(cours);
    setNomCour(cours.nomCour);
    setProfRef(cours.profRef);
    setEcole(cours.ecole);
    setUe(cours.ue);
  };

  const saveCours = () => {
    const coursRef = firebase.database().ref(`COURS/${editingCours.id}`);
    coursRef.set({
      id: editingCours.id,
      nomCour,
      ecole,
      ue,
      profRef,
    });
    setEditingCours(null);
  };

  const deleteCours = (cours) => {
    const coursRef = firebase.database().ref(`COURS/${cours.id}`);
    coursRef.remove();
  };

  return (
    <div >
      <h2>Administration des Cours</h2>
      <p>Options d'administration pour gérer les cours.</p>
      <div>
        <input
          type="text"
          placeholder="Nom du cours"
          value={nomCour}
          onChange={(e) => setNomCour(e.target.value)}
        />
        <input
          type="text"
          placeholder="École"
          value={ecole}
          onChange={(e) => setEcole(e.target.value)}
        />
        <select
          value={ue}
          onChange={(e) => setUe(e.target.value)}
          required
        >
          <option value="">Choisissez une UE</option>
          {ues.map((ueItem) => (
            <option key={ueItem.id} value={ueItem.id}>
              {ueItem.nomUE}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Professeur référence"
          value={profRef}
          onChange={(e) => setProfRef(e.target.value)}
        />
        {editingCours ? (
          <button className='check-btn done' onClick={saveCours}>Sauvegarder</button>
        ) : (
          <button className='check-btn done' onClick={addCours}>Ajouter</button>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom du Cours</th>
            <th>Professeur Référence</th>
            <th>École</th>
            <th>Unité d'Enseignement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cours.map((cours) => (
            <tr key={cours.id}>
              <td>{cours.id}</td>
              <td>{cours.nomCour}</td>
              <td>{cours.profRef}</td>
              <td>{cours.ecole}</td>
              <td>{ues.find((ueItem) => ueItem.id === cours.ue)?.nomUE}</td>
              <td>
                <button className='edit-btn' onClick={() => editCours(cours)}>Éditer</button>
                <button className='delete-btn' onClick={() => deleteCours(cours)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoursManager;
