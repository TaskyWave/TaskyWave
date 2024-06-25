import React, { useState, useEffect } from 'react';
import { database, auth } from './firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

const Bulletin = () => {
  const [coursMoyennes, setCoursMoyennes] = useState([]);
  const [ueMoyennes, setUeMoyennes] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser.uid;
    const userRef = database.ref(`USERS/${uid}`);
    const coursRef = database.ref('COURS');
    const notesRef = database.ref(`USERS/${uid}/NOTES`);
    const uesRef = database.ref('UES');

    userRef.once('value', (userSnapshot) => {
      const userData = userSnapshot.val();
      const userGroupe = userData.groupe;

      const groupesRef = database.ref(`GROUPES/${userGroupe}`);
      groupesRef.once('value', (groupeSnapshot) => {
        const groupeData = groupeSnapshot.val();
        const anneeId = groupeData.anneeId;

        coursRef.once('value', (coursSnapshot) => {
          let coursMoyennesTemp = [];

          coursSnapshot.forEach((coursData) => {
            const cours = coursData.val();
            if (cours.anneeId === anneeId) {
              let total = 0;
              let totalCoef = 0;

              notesRef.once('value', (notesSnapshot) => {
                notesSnapshot.forEach((noteData) => {
                  const note = noteData.val();

                  if (note.cours === cours.id) {
                    total += note.note * note.coef;
                    totalCoef += note.coef;
                  }
                });

                if (totalCoef === 0) {
                  coursMoyennesTemp.push({ ...cours, moyenne: '#' });
                } else {
                  coursMoyennesTemp.push({ ...cours, moyenne: (total / totalCoef).toFixed(2) });
                }
              });
            }
          });

          setCoursMoyennes(coursMoyennesTemp);

          uesRef.once('value', (uesSnapshot) => {
            let ueMoyennesTemp = [];

            uesSnapshot.forEach((ueData) => {
              const ue = ueData.val();
              if (ue.annee === anneeId) {
                let total = 0;
                let totalCoef = 0;

                coursMoyennesTemp.forEach((coursMoyenneTemp) => {
                  if (coursMoyenneTemp.ueCoefficients) {
                    coursMoyenneTemp.ueCoefficients.forEach((ueCoefficient) => {
                      if (ueCoefficient.ueId === ue.id && coursMoyenneTemp.moyenne !== '#') {
                        total += parseFloat(coursMoyenneTemp.moyenne) * ueCoefficient.coef;
                        totalCoef += ueCoefficient.coef;
                      }
                    });
                  }
                });

                if (totalCoef === 0) {
                  ueMoyennesTemp.push({ ...ue, moyenne: '#' });
                } else {
                  ueMoyennesTemp.push({ ...ue, moyenne: (total / totalCoef).toFixed(2) });
                }
              }
            });

            setUeMoyennes(ueMoyennesTemp);
          });
        });
      });
    });
  }, []);

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

  const exportPDF = () => {
    const doc = new jsPDF();

    // Add the cours section
    doc.text('Moyennes des cours', 10, 10);
    const coursData = coursMoyennes.map((cours) => [
      cours.nomCour,
      cours.profRef,
      cours.moyenne
    ]);
    doc.autoTable({
      head: [['Nom du cours', 'Professeur', 'Moyenne']],
      body: coursData,
      startY: 20,
    });

    // Add the UE section
    doc.text('Moyennes des UE', 10, doc.autoTable.previous.finalY + 10);
    const ueData = ueMoyennes.map((ue) => [
      ue.nomUE,
      ue.moyenne
    ]);
    doc.autoTable({
      head: [['Nom de l\'UE', 'Moyenne']],
      body: ueData,
      startY: doc.autoTable.previous.finalY + 20,
    });

    doc.save('bulletin.pdf');
  };

  return (
    <div>
      <button className='edit-btn' onClick={exportPDF}>Exporter en PDF</button>
      <div id="bulletin">
        <h2>Moyennes des cours</h2>
        <table>
          <thead>
            <tr>
              <th>Nom du cours</th>
              <th>Professeur</th>
              <th>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {coursMoyennes.map((cours) => (
              <tr key={cours.id}>
                <td>{cours.nomCour}</td>
                <td>{cours.profRef}</td>
                <td className={getMoyenneClassName(cours.moyenne)}>{cours.moyenne}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Moyennes des UE</h2>
        <table>
          <thead>
            <tr>
              <th>Nom de l'UE</th>
              <th>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {ueMoyennes.map((ue) => (
              <tr key={ue.id}>
                <td>{ue.nomUE}</td>
                <td className={getMoyenneClassName(ue.moyenne)}>{ue.moyenne}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bulletin;
