import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const CoursManager = () => {
  const [cours, setCours] = useState([]);
  const [ues, setUes] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [ecoles, setEcoles] = useState([]);
  const [nomCour, setNomCour] = useState('');
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [ueCoefficients, setUeCoefficients] = useState([]);
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
      coursRef.off();
      uesRef.off();
      anneesRef.off();
      departementsRef.off();
      ecolesRef.off();
    };
  }, []);

  const addCours = () => {
    const coursRef = firebase.database().ref('COURS');
    const newId = uuidv4();
    coursRef.child(newId).set({
      id: newId,
      nomCour,
      anneeId: selectedAnnee,
      ueCoefficients,
      profRef,
    });
    setNomCour('');
    setSelectedAnnee('');
    setUeCoefficients([]);
    setProfRef('');
  };

  const editCours = (cours) => {
    setEditingCours(cours);
    setNomCour(cours.nomCour);
    setProfRef(cours.profRef);
    setSelectedAnnee(cours.anneeId);
    setUeCoefficients(cours.ueCoefficients);
  };

  const saveCours = () => {
    const coursRef = firebase.database().ref(`COURS/${editingCours.id}`);
    coursRef.set({
      id: editingCours.id,
      nomCour,
      anneeId: selectedAnnee,
      ueCoefficients,
      profRef,
    });
    setEditingCours(null);
  };

  const deleteCours = (cours) => {
    const coursRef = firebase.database().ref(`COURS/${cours.id}`);
    coursRef.remove();
  };

  const handleUeChange = (index, event) => {
    const { name, value } = event.target;
    const updatedUeCoefficients = [...ueCoefficients];
    updatedUeCoefficients[index] = {
      ...updatedUeCoefficients[index],
      [name]: name === 'coef' ? parseFloat(value) : value,
    };
    setUeCoefficients(updatedUeCoefficients);
  };

  const addUeCoefficient = () => {
    setUeCoefficients([...ueCoefficients, { ueId: '', coef: '' }]);
  };

  const removeUeCoefficient = (index) => {
    const updatedUeCoefficients = ueCoefficients.filter((_, i) => i !== index);
    setUeCoefficients(updatedUeCoefficients);
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
    <div className="cours-manager">
      <h2>Administration des Cours</h2>
      <p>Options d'administration pour gérer les cours.</p>
      <div className="form-group">
        <input
          type="text"
          placeholder="Nom du cours"
          value={nomCour}
          onChange={(e) => setNomCour(e.target.value)}
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
        <div>
          {ueCoefficients.map((ueCoefficient, index) => (
            <div key={index} className="ue-coefficient">
              <select
                name="ueId"
                value={ueCoefficient.ueId}
                onChange={(e) => handleUeChange(index, e)}
                required
              >
                <option value="" disabled>Choisissez une UE</option>
                {ues.map((ueItem) => (
                  <option key={ueItem.id} value={ueItem.id}>
                    {ueItem.nomUE}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                name="coef"
                placeholder="Coefficient"
                value={ueCoefficient.coef}
                onChange={(e) => handleUeChange(index, e)}
                required
              />
              <button type="button" onClick={() => removeUeCoefficient(index)}>
                Supprimer
              </button>
            </div>
          ))}
          <button type="button" onClick={addUeCoefficient}>
            Ajouter UE et Coefficient
          </button>
        </div>
        <input
          type="text"
          placeholder="Professeur référence"
          value={profRef}
          onChange={(e) => setProfRef(e.target.value)}
          required
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
            <th>Année-Département-École</th>
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
              <td>{getAnneeInfo(cours.anneeId)}</td>
              <td>
                {cours.ueCoefficients.map((ueCoefficient) => {
                  const ue = ues.find((ueItem) => ueItem.id === ueCoefficient.ueId);
                  return `${ue ? ue.nomUE : 'UE non trouvée'} (Coef: ${ueCoefficient.coef})`;
                }).join(', ')}
              </td>
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
