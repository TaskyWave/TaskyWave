import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const UEManager = () => {
  const [ues, setUes] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [nomUE, setNomUE] = useState('');
  const [departements, setDepartements] = useState([]);
  const [ecoles, setEcoles] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState('');
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
      uesRef.off();
      anneesRef.off();
      ecolesRef.off();
      departementsRef.off();
    };
  }, []);

  const addUE = () => {
    const uesRef = firebase.database().ref('UES');
    const newId = uuidv4();
    uesRef.child(newId).set({
      id: newId,
      nomUE,
      annee: selectedAnnee,
    });
    setNomUE('');
    setSelectedAnnee('');
  };

  const editUE = (ue) => {
    setEditingUE(ue);
    setNomUE(ue.nomUE);
    setSelectedAnnee(ue.annee);
  };

  const saveUE = () => {
    const ueRef = firebase.database().ref(`UES/${editingUE.id}`);
    ueRef.set({
      id: editingUE.id,
      nomUE,
      annee: selectedAnnee,
    });
    setEditingUE(null);
  };

  const deleteUE = (ue) => {
    const ueRef = firebase.database().ref(`UES/${ue.id}`);
    ueRef.remove();
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
      <h2>Administration des Unités d'Enseignement</h2>
      <p>Options d'administration pour gérer les unités d'enseignement (UE).</p>
      <div>
        <input
          type="text"
          placeholder="Nom de l'UE"
          value={nomUE}
          onChange={(e) => setNomUE(e.target.value)}
          required
        />
        <select
          value={selectedAnnee}
          onChange={(e) => setSelectedAnnee(e.target.value)}
          required
        >
          <option value="" disabled>Choisissez une Année</option>
          {annees.map((annee) => (
            <option key={annee.id} value={annee.id}>
              {getAnneeInfo(annee.id)}
            </option>
          ))}
        </select>
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
            <th>Année</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ues.map((ue) => (
            <tr key={ue.id}>
              <td>{ue.id}</td>
              <td>{ue.nomUE}</td>
              <td>{getAnneeInfo(ue.annee)}</td>
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
