import React, { useState, useEffect } from 'react';
import { auth, database } from './firebase';

export function Header({ onLogout }) {

  const [userName, setUserName] = useState(null);
  const [groupName, setGroupName] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkUserProfile(user.uid);
      }
    });
    return () => unsubscribe();
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
        }
      })
      .catch((error) => {
        console.error("Error fetching group name:", error);
      });
  };

  return (
    <div className="header">
      <div className="search-bar">
        <h1>TaskyWave</h1>
      </div>
      <div className="user-info">
        {/*<img id="userpicture" src="user-icon.png" alt="User" width="40" height="40" />*/}
        <span id="username">{userName}, {groupName}</span>
        <button onClick={onLogout} className="logout-btn">Déconnexion</button>
      </div>
    </div>
  );
}