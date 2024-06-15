import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import Notes from './Notes';

const SubjectNotesPanel = () => {
  const [notes, setNotes] = useState([]);
  const [cours, setCours] = useState([]);
  const [note, setNote] = useState('');
  const [coef, setCoef] = useState('');
  const [coursSelectionne, setCoursSelectionne] = useState('');
  const [nom, setNom] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [userUid, setUserUid] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUserUid(user.uid);
        fetchUserGroupeAndCours(user.uid);
        fetchNotes(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserGroupeAndCours = (uid) => {
    const userRef = firebase.database().ref(`USERS/${uid}`);
    userRef.once('value', (userSnapshot) => {
      const userData = userSnapshot.val();
      const userGroupe = userData.groupe;

      const groupesRef = firebase.database().ref(`GROUPES/${userGroupe}`);
      groupesRef.once('value', (groupeSnapshot) => {
        const groupeData = groupeSnapshot.val();
        const anneeId = groupeData.anneeId;

        fetchCoursByAnnee(anneeId);
      });
    });
  };

  const fetchCoursByAnnee = (anneeId) => {
    const coursRef = firebase.database().ref('COURS');
    coursRef.on('value', (snapshot) => {
      const coursData = snapshot.val();
      if (coursData) {
        const coursList = Object.keys(coursData)
          .map((key) => ({
            id: key,
            ...coursData[key],
          }))
          .filter((coursItem) => coursItem.anneeId === anneeId);
        setCours(coursList);
      } else {
        setCours([]);
      }
    });
  };

  const fetchNotes = (uid) => {
    const notesRef = firebase.database().ref(`USERS/${uid}/NOTES`);
    notesRef.on('value', (snapshot) => {
      const notesData = snapshot.val();
      if (notesData) {
        const notesList = Object.keys(notesData).map((key) => ({
          id: key,
          ...notesData[key],
        }));
        setNotes(notesList);
      } else {
        setNotes([]);
      }
    });
  };

  const addNote = () => {
    const noteUUID = uuidv4();
    const notesRef = firebase.database().ref(`USERS/${userUid}/NOTES/${noteUUID}`);
    const newNote = {
      id: noteUUID,
      note: parseFloat(note),
      coef: parseFloat(coef),
      cours: coursSelectionne,
      nom,
    };
    notesRef.set(newNote);
    resetForm();
  };

  const editNote = (note) => {
    setEditingNote(note);
    setNote(note.note);
    setCoef(note.coef);
    setCoursSelectionne(note.cours);
    setNom(note.nom);
    setIsModalOpen(true);
  };

  const saveNote = () => {
    const notesRef = firebase.database().ref(`USERS/${userUid}/NOTES/${editingNote.id}`);
    notesRef.set({
      id: editingNote.id,
      note: parseFloat(note),
      coef: parseFloat(coef),
      cours: coursSelectionne,
      nom,
    });
    setEditingNote(null);
    resetForm();
    setIsModalOpen(false);
  };

  const deleteNote = (note) => {
    const notesRef = firebase.database().ref(`USERS/${userUid}/NOTES/${note.id}`);
    notesRef.remove();
  };

  const resetForm = () => {
    setNote('');
    setCoef('');
    setCoursSelectionne('');
    setNom('');
  };

  const notesByCours = notes.reduce((acc, note) => {
    acc[note.cours] = acc[note.cours] || [];
    acc[note.cours].push(note);
    return acc;
  }, {});

  const getCoursNom = (coursId) => {
    const coursItem = cours.find((c) => c.id === coursId);
    return coursItem ? coursItem.nomCour : 'Cours inconnu';
  };

  const getMoyenneClassName = (moyenne) => {
    if (moyenne === '#') {
      return 'ya_r';
    } else if (moyenne < 8.5) {
      return 'TableNoteFillNoteCnon';
    } else if (moyenne < 10.5) {
      return 'TableNoteFillNoteBof';
    } else {
      return 'TableNoteFillNoteOK';
    }
  };

  return (
    <div className="chart">
      <h2>Gestion des Notes</h2>
      <form onSubmit={(e) => { e.preventDefault(); editingNote ? saveNote() : addNote(); }}>
        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Coefficient"
          value={coef}
          onChange={(e) => setCoef(e.target.value)}
          required
        />
        <select
          value={coursSelectionne}
          onChange={(e) => setCoursSelectionne(e.target.value)}
          required
        >
          <option value="">Choisissez un cours</option>
          {cours.map((coursItem) => (
            <option key={coursItem.id} value={coursItem.id}>
              {coursItem.nomCour}
            </option>
          ))}
        </select>
        <button className='edit-btn' type="submit">Ajouter</button>
      </form>

      {Object.keys(notesByCours).map((coursId) => (
        <div key={coursId} className="notes-section">
          <h3>{getCoursNom(coursId)}</h3>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Note</th>
                <th>Coef</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notesByCours[coursId].map((note) => (
                <tr key={note.id}>
                  <td>{note.nom}</td>
                  <td className={getMoyenneClassName(note.note)}>{note.note}</td>
                  <td>{note.coef}</td>
                  <td>
                    <button className='edit-btn' onClick={() => editNote(note)}>Éditer</button>
                    <button className='delete-btn' onClick={() => deleteNote(note)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <form onSubmit={(e) => { e.preventDefault(); saveNote(); }}>
              <input
                type="text"
                placeholder="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Coefficient"
                value={coef}
                onChange={(e) => setCoef(e.target.value)}
                required
              />
              <select
                value={coursSelectionne}
                onChange={(e) => setCoursSelectionne(e.target.value)}
                required
              >
                <option value="">Choisissez un cours</option>
                {cours.map((coursItem) => (
                  <option key={coursItem.id} value={coursItem.id}>
                    {coursItem.nomCour}
                  </option>
                ))}
              </select>
              <br></br>
              <button className='edit-btn' type="submit">Sauvegarder</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectNotesPanel;
