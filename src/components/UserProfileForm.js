import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const UserProfileForm = ({ userUid, onProfileSaved }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState(null);
  const [groupes, setGroupes] = useState([]);
  const [groupe, setGroupe] = useState('');
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [departements, setDepartements] = useState([]);
  const [ecoles, setEcoles] = useState([]);
  const [annees, setAnnees] = useState([]);

  useEffect(() => {
    const checkUserProfile = () => {
      database.ref().child(`USERS/${userUid}`).get().then((snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.firstName && userData.lastName && userData.groupe) {
          setIsProfileComplete(true);
        }
        else{
          setIsProfileComplete(false);
        }
      }).catch((error) => {
        console.error("Error fetching user profile:", error);
      }).finally(() => {
        setIsLoading(false);
      });
    };

    const groupeRef = database.ref('GROUPES');
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

    checkUserProfile();
    
    return () => {
      groupeRef.off();
    };
  }, [userUid]);

  useEffect(() => {

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
      anneesRef.off();
      ecolesRef.off();
      departementsRef.off();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await database.ref(`USERS/${userUid}`).set({
        firstName,
        lastName,
        role: 'user',
        groupe,
      });
      onProfileSaved();
    } catch (err) {
      setError(err.message);
    }
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isProfileComplete) {
    return <div>Your profile is already complete.</div>;
  }

  return (
    <div className="chart">
      <h2>Votre profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <select
          value={groupe}
          onChange={(e) => setGroupe(e.target.value)}
          required
        >
          <option value="">Choisissez un groupe</option>
          {groupes.map((group) => (
              <option key={group.id} value={group.id}>
              {`${group.nomGroupe} - ${getAnneeInfo(group.anneeId)}`}
            </option>
          ))}
        </select>
        <button className='check-btn done' type="submit">Save</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default UserProfileForm;
