import React, { useState, useEffect } from 'react';
import { Header } from "./components/Header";
import { InfoGrid } from "./components/InfoGrid";
import { RedirectGrid } from "./components/RedirectGrid";
import { Sidebar } from "./components/Sidebar";
import { TaskGrid } from "./components/TaskGrid";
import { Footer } from "./components/Footer";
import Auth from "./components/Auth";
import UserProfileForm from './components/UserProfileForm';
import { auth, database } from './components/firebase';
import HelpInfo from './components/HelpInfo';
import Administration from './components/Administration';
import Settings from './components/Settings';
import Notes from './components/Notes';

export default function App() {
  const [userUid, setUserUid] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [activePanel, setActivePanel] = useState('agenda');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    if (userUid) {
      checkUserProfile(userUid);
    }
  }, [userUid]);

  const checkUserProfile = async (uid) => {
    const snapshot = await database.ref(`USERS/${uid}`).once('value');
    const userData = snapshot.val();
    if (userData && userData.firstName && userData.lastName && userData.groupe) {
      setProfileComplete(true);
      setUserRole(userData.role);
    } else {
      setProfileComplete(false);
    }
  };

  const handleUserAuthenticated = async (uid, email) => {
    setUserUid(uid);
    setUserEmail(email);
    await checkUserProfile(uid); // Wait for the profile check to complete
    setActivePanel('agenda'); // Set default active panel after login
  };

  const handleProfileSaved = () => {
    setProfileComplete(true);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUserUid(null);
      setUserEmail(null);
      setProfileComplete(false);
      setUserRole('');
    } catch (err) {
      console.error(err.message);
    }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'agenda':
        return (
          <div>
            <InfoGrid />
            <TaskGrid />
          </div>
        );
      case 'helpInfo':
        return <HelpInfo />;
      case 'notes':
        return <Notes />;
      case 'administration':
        return <Administration />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div>
            <InfoGrid />
            <TaskGrid />
          </div>
        );
    }
  };

  return (
    <div className="app">
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
    </div>
  );
}
