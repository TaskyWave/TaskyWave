import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const GroupesManager = () => {
  const [groupes, setGroupes] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [ecoles, setEcoles] = useState([]);
  const [nomGroupe, setNomGroupe] = useState('');
  const [selectedAnnee, setSelectedAnnee] = useState('');
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
      groupeRef.off();
      anneesRef.off();
      departementsRef.off();
      ecolesRef.off();
    };
  }, []);

  const addGroupe = () => {
    const groupeRef = firebase.database().ref('GROUPES');
    const newId = uuidv4();
    groupeRef.child(newId).set({
      id: newId,
      nomGroupe,
      anneeId: selectedAnnee,
    });
    setNomGroupe('');
    setSelectedAnnee('');
  };

  const editGroupe = (groupe) => {
    setEditingGroupe(groupe);
    setNomGroupe(groupe.nomGroupe);
    setSelectedAnnee(groupe.anneeId);
  };

  const saveGroupe = () => {
    const groupeRef = firebase.database().ref(`GROUPES/${editingGroupe.id}`);
    groupeRef.set({
      id: editingGroupe.id,
      nomGroupe,
      anneeId: selectedAnnee,
    });
    setEditingGroupe(null);
  };

  const deleteGroupe = (groupe) => {
    const groupeRef = firebase.database().ref(`GROUPES/${groupe.id}`);
    groupeRef.remove();
  };

  const getAnneeInfo = (anneeId) => {
    const annee = annees.find((a) => a.id === anneeId);
    if (annee) {
      const departement = departements.find((d) => d.id === annee.departementId);
      const ecole = ecoles.find((e) => e.id === departement?.ecoleId);
      return `${departement?.nomDepartement || 'Département non trouvé'}-${annee.nomAnnee}-${ecole?.ecole || 'École non trouvée'}`;
    }
    return 'Information non trouvée';
  };

  return (
    <div>
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
        <select
          value={selectedAnnee}
          onChange={(e) => setSelectedAnnee(e.target.value)}
          required
        >
          <option value="" disabled>Choisissez une année</option>
          {annees.map((annee) => (
            <option key={annee.id} value={annee.id}>
              {getAnneeInfo(annee.id)}
            </option>
          ))}
        </select>
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
            <th>Année-Département-École</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groupes.map((groupe) => (
            <tr key={groupe.id}>
              <td>{groupe.id}</td>
              <td>{groupe.nomGroupe}</td>
              <td>{getAnneeInfo(groupe.anneeId)}</td>
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
