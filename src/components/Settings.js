import React, { useState, useEffect } from 'react';
import { auth, database } from './firebase';

const Settings = ({ userUid }) => {
  const [userFirstName, setUserFirstName] = useState(null);
  const [userLastName, setUserLastName] = useState(null);
  const [role, setUserRole] = useState(null);
  const [UID, setUserUID] = useState(null);
  const [groupName, setGroupName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkUserProfile(user.uid);
        fetchGroups();
      }
    });
    return () => unsubscribe();
  }, []);

  const checkUserProfile = (uid) => {
    database.ref().child(`USERS/${uid}`).get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserFirstName(`${userData.firstName}`);
          setUserLastName(`${userData.lastName}`);
          setUserRole(`${userData.role}`);
          setUserUID(uid);
          setUserEmail(auth.currentUser.email);
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

  const fetchGroups = () => {
    database.ref('GROUPES').get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          const groupesData = snapshot.val();
          const groupesList = Object.keys(groupesData).map((key) => ({
            id: key,
            ...groupesData[key],
          }));
          setGroups(groupesList);
        }
      })
      .catch((error) => {
        console.error("Error fetching groups:", error);
      });
  };

  const handleSubmitResetPswrd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await auth.sendPasswordResetEmail(userEmail);
      setSuccess('Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChangeGroup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await database.ref(`USERS/${UID}`).update({ groupe: selectedGroup });
      fletchGroupName(selectedGroup); // Update group info after change
      setSuccess('Groupe mis à jour avec succès.');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChangeUserInfo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await database.ref(`USERS/${UID}`).update({
        firstName: userFirstName,
        lastName: userLastName,
      });
      setSuccess('Informations utilisateur mises à jour avec succès.');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="chart">
      <h2>Paramètres</h2>
      <div className="settings-info">
        <p><strong>Nom :</strong> {userLastName}</p>
        <p><strong>Prénom :</strong> {userFirstName}</p>
        <p><strong>Email :</strong> {userEmail}</p>
        <p><strong>Statut :</strong> {role}</p>
        <p><strong>Groupe :</strong> {groupName}</p>
        <p><strong>ID :</strong> {UID}</p>
      </div>
      <form className="settings-form" onSubmit={handleChangeUserInfo}>
        <label>
          Prénom:
          <input
            type="text"
            value={userFirstName}
            onChange={(e) => setUserFirstName(e.target.value)}
            required
          />
        </label>
        <label>
          Nom:
          <input
            type="text"
            value={userLastName}
            onChange={(e) => setUserLastName(e.target.value)}
            required
          />
        </label>
        <button className="settings-button" type="submit">Mettre à jour les informations</button>
      </form>
      <form className="settings-form" onSubmit={handleChangeGroup}>
        <label>
          Changer de groupe:
          <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} required>
            <option value="">Choisissez un groupe</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.nomGroupe}
              </option>
            ))}
          </select>
        </label>
        <button className="settings-button" type="submit">Mettre à jour le groupe</button>
      </form>
      <button className="settings-button" onClick={handleSubmitResetPswrd}>Réinitialiser le mot de passe</button>
      {error && <p className="settings-error">{error}</p>}
      {success && <p className="settings-success">{success}</p>}
    </div>
  );
};
export default Settings;
