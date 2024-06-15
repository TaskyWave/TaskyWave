import React, { useState, useEffect } from 'react';
import { auth, database } from './firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export function Header({ onLogout }) {

  const [userName, setUserName] = useState(null);
  const [groupName, setGroupName] = useState(null);
  const [groupAnneeId, setGroupAnneeId] = useState(null);

  const [departements, setDepartements] = useState([]);
  const [ecoles, setEcoles] = useState([]);
  const [annees, setAnnees] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkUserProfile(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const checkUserProfile = (uid) => {
    database.ref().child(`USERS/${uid}`).get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserName(`${userData.firstName} ${userData.lastName}`);
          fletchGroupName(userData.groupe);
        }
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  };
  
  const fletchGroupName = (groupId) => {
    database.ref().child(`GROUPES/${groupId}`).get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          const groupData = snapshot.val();
          setGroupName(groupData.nomGroupe);
          setGroupAnneeId(groupData.anneeId);
        }
      })
      .catch((error) => {
        console.error("Error fetching group name:", error);
      });
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
    <div className="header">
      <div className="search-bar">
        <h1>TaskyWave</h1>
      </div>
      <div className="user-info">
        {/*<img id="userpicture" src="user-icon.png" alt="User" width="40" height="40" />*/}
        <span id="username">{userName}, {groupName} - {getAnneeInfo(groupAnneeId)}</span>
        <button onClick={onLogout} className="logout-btn">Déconnexion</button>
      </div>
    </div>
  );
}