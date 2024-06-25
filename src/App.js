import React, { useState, useEffect } from 'react';
import { Header } from "./components/Header";
import InfoPosts from "./components/InfoPosts";
import { RedirectGrid } from "./components/RedirectGrid";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import Auth from "./components/Auth";
import UserProfileForm from './components/UserProfileForm';
import { auth, database } from './components/firebase';
import HelpInfo from './components/HelpInfo';
import Administration from './components/Administration';
import Settings from './components/Settings';
import SubjectsNotesPanel from './components/SubjectsNotesPanel';
import Bulletin from './components/Bulletin';
import TasksManager from './components/TasksManager';

export default function App() {
  const [userUid, setUserUid] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('agenda');
  const [userRole, setUserRole] = useState('');
  const [bulletinKey, setBulletinKey] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        handleUserAuthenticated(user.uid, user.email);
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkUserProfile = async (uid) => {
    const snapshot = await database.ref(`USERS/${uid}`).once('value');
    const userData = snapshot.val();
    if (userData && userData.firstName && userData.lastName && userData.groupe) {
      setProfileComplete(true);
      setUserRole(userData.role);
    } else {
      setProfileComplete(false);
    }
    setIsLoading(false);
  };

  const handleUserAuthenticated = async (uid, email) => {
    setUserUid(uid);
    setUserEmail(email);
    await checkUserProfile(uid);
    setActivePanel('agenda');
  };

  const handleProfileSaved = () => {
    setProfileComplete(true);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await auth.signOut();
      setUserUid(null);
      setUserEmail(null);
      setProfileComplete(false);
      setUserRole('');
    } catch (err) {
      console.error(err.message);
    }
    setIsLoading(false);
  };

  const refreshBulletin = () => {
    setBulletinKey((prevKey) => prevKey + 1);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'agenda':
        return <TasksManager />;
      case 'posts':
        return <InfoPosts />;
      case 'helpInfo':
        return <HelpInfo />;
      case 'notes':
        return (
          <div>
            <SubjectsNotesPanel />
            <div className='chart'>
              <button className='edit-btn' onClick={refreshBulletin}>Rafraîchir les calculs</button>
              <Bulletin key={bulletinKey} />
            </div>
          </div>
        );
      case 'administration':
        return <Administration />;
      case 'settings':
        return <Settings />;
      default:
        return <TasksManager />;
    }
  };

  return (
    <div className="app">
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <>
          {!userUid ? (
            <Auth onUserAuthenticated={handleUserAuthenticated} />
          ) : (
            <>
              {!profileComplete ? (
                <UserProfileForm userUid={userUid} onProfileSaved={handleProfileSaved} />
              ) : (
                <>
                  <Sidebar setActivePanel={setActivePanel} userRole={userRole} />
                  <div className="main-content">
                    <Header onLogout={handleLogout} />
                    <RedirectGrid />
                    {renderPanel()}
                    <Footer />
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
