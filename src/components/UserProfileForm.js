import React, { useState, useEffect } from 'react';
import { database } from './firebase'; // Assume you have a firebase.js where you initialize Firebase

const UserProfileForm = ({ userUid, onProfileSaved }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState(null);
  const [groupes, setGroupes] = useState([]);
  const [groupe, setGroupe] = useState('');

  useEffect(() => {
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
  
    return () => {
      groupeRef.off();
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

  return (
    <div className="user-profile-form">
      <h2>Complete your profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
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
          {groupes.map((groupeItem) => (
            <option key={groupeItem.id} value={groupeItem.id}>
              {groupeItem.nomGroupe}
            </option>
          ))}
        </select>
        <button type="submit">Save</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default UserProfileForm;
