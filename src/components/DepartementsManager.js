import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const DepartementsManager = () => {
  const [departements, setDepartements] = useState([]);
  const [ecoles, setEcoles] = useState([]);
  const [nomDepartement, setNomDepartement] = useState('');
  const [selectedEcole, setSelectedEcole] = useState('');
  const [editingDepartement, setEditingDepartement] = useState(null);

  useEffect(() => {
    // Fetch departments
    const departementsRef = firebase.database().ref('DEPARTEMENTS');
    departementsRef.on('value', (snapshot) => {
      const departementsData = snapshot.val();
      if (departementsData) {
        const departementsList = Object.keys(departementsData).map((key) => ({
          id: key,
          ...departementsData[key],
        }));
        setDepartements(departementsList);
      } else {
        setDepartements([]);
      }
    });

    // Fetch schools
    const ecolesRef = firebase.database().ref('ECOLES');
    ecolesRef.on('value', (snapshot) => {
      const ecolesData = snapshot.val();
      if (ecolesData) {
        const ecolesList = Object.keys(ecolesData).map((key) => ({
          id: key,
          ...ecolesData[key],
        }));
        setEcoles(ecolesList);
      } else {
        setEcoles([]);
      }
    });

    return () => {
      departementsRef.off();
      ecolesRef.off();
    };
  }, []);

  const addDepartement = () => {
    const departementRef = firebase.database().ref('DEPARTEMENTS');
    const newId = uuidv4();
    departementRef.child(newId).set({
      id: newId,
      nomDepartement,
      ecoleId: selectedEcole,
    });
    setNomDepartement('');
    setSelectedEcole('');
  };

  const editDepartement = (departement) => {
    setEditingDepartement(departement);
    setNomDepartement(departement.nomDepartement);
    setSelectedEcole(departement.ecoleId);
  };

  const saveDepartement = () => {
    const departementRef = firebase.database().ref(`DEPARTEMENTS/${editingDepartement.id}`);
    departementRef.set({
      id: editingDepartement.id,
      nomDepartement,
      ecoleId: selectedEcole,
    });
    setEditingDepartement(null);
    setNomDepartement('');
    setSelectedEcole('');
  };

  const deleteDepartement = (departement) => {
    const departementRef = firebase.database().ref(`DEPARTEMENTS/${departement.id}`);
    departementRef.remove();
  };

  return (
    <div>
      <h2>Gestion des Départements</h2>
      <div>
        <input
          type="text"
          placeholder="Nom du département"
          value={nomDepartement}
          onChange={(e) => setNomDepartement(e.target.value)}
          required
        />
        <select
          value={selectedEcole}
          onChange={(e) => setSelectedEcole(e.target.value)}
          required
        >
          <option value="" disabled>Choisissez une école</option>
          {ecoles.map((ecole) => (
            <option key={ecole.id} value={ecole.id}>
              {ecole.ecole}
              </option>
          ))}
        </select>
        {editingDepartement ? (
          <button className='check-btn done' onClick={saveDepartement}>Sauvegarder</button>
        ) : (
          <button className='check-btn done' onClick={addDepartement}>Ajouter</button>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom du Département</th>
            <th>École</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departements.map((departement) => {
            const ecole = ecoles.find((ecole) => ecole.id === departement.ecoleId);
            return (
              <tr key={departement.id}>
                <td>{departement.id}</td>
                <td>{departement.nomDepartement}</td>
                <td>{ecole ? ecole.ecole : 'École non trouvée'}</td>
                <td>
                  <button className='edit-btn' onClick={() => editDepartement(departement)}>Éditer</button>
                  <button className='delete-btn' onClick={() => deleteDepartement(departement)}>Supprimer</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DepartementsManager;
