import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const AnneeManager = () => {
  const [annees, setAnnees] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [nomAnnee, setNomAnnee] = useState('');
  const [selectedDepartement, setSelectedDepartement] = useState('');
  const [editingAnnee, setEditingAnnee] = useState(null);

  useEffect(() => {
    // Fetch years
    const anneesRef = firebase.database().ref('ANNEES');
    anneesRef.on('value', (snapshot) => {
      const anneesData = snapshot.val();
      if (anneesData) {
        const anneesList = Object.keys(anneesData).map((key) => ({
          id: key,
          ...anneesData[key],
        }));
        setAnnees(anneesList);
      } else {
        setAnnees([]);
      }
    });

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

    return () => {
      anneesRef.off();
      departementsRef.off();
    };
  }, []);

  const addAnnee = () => {
    const anneeRef = firebase.database().ref('ANNEES');
    const newId = uuidv4();
    anneeRef.child(newId).set({
      id: newId,
      nomAnnee,
      departementId: selectedDepartement,
    });
    setNomAnnee('');
    setSelectedDepartement('');
  };

  const editAnnee = (annee) => {
    setEditingAnnee(annee);
    setNomAnnee(annee.nomAnnee);
    setSelectedDepartement(annee.departementId);
  };

  const saveAnnee = () => {
    const anneeRef = firebase.database().ref(`ANNEES/${editingAnnee.id}`);
    anneeRef.set({
      id: editingAnnee.id,
      nomAnnee,
      departementId: selectedDepartement,
    });
    setEditingAnnee(null);
    setNomAnnee('');
    setSelectedDepartement('');
  };

  const deleteAnnee = (annee) => {
    const anneeRef = firebase.database().ref(`ANNEES/${annee.id}`);
    anneeRef.remove();
  };

  return (
    <div>
      <h2>Gestion des Années</h2>
      <div>
        <input
          type="text"
          placeholder="Nom de l'année"
          value={nomAnnee}
          onChange={(e) => setNomAnnee(e.target.value)}
          required
        />
        <select
          value={selectedDepartement}
          onChange={(e) => setSelectedDepartement(e.target.value)}
          required
        >
          <option value="" disabled>Choisissez un département</option>
          {departements.map((departement) => (
            <option key={departement.id} value={departement.id}>{departement.nomDepartement}</option>
          ))}
        </select>
        {editingAnnee ? (
          <button className='check-btn done' onClick={saveAnnee}>Sauvegarder</button>
        ) : (
          <button className='check-btn done' onClick={addAnnee}>Ajouter</button>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom de l'Année</th>
            <th>Département</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {annees.map((annee) => {
            const departement = departements.find((dep) => dep.id === annee.departementId);
            return (
              <tr key={annee.id}>
                <td>{annee.id}</td>
                <td>{annee.nomAnnee}</td>
                <td>{departement ? departement.nomDepartement : 'Département non trouvé'}</td>
                <td>
                  <button className='edit-btn' onClick={() => editAnnee(annee)}>Éditer</button>
                  <button className='delete-btn' onClick={() => deleteAnnee(annee)}>Supprimer</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AnneeManager;
