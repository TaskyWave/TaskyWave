import React from 'react';

export function Sidebar({ setActivePanel, userRole }) {
  return (
    <div className="sidebar">
      <h1>TaskyWave</h1>
      <ul>
        <li><a href="#" onClick={() => setActivePanel('agenda')}>🏠 Agenda</a></li>
        <li><a href="#" onClick={() => setActivePanel('posts')}>📚​ Info</a></li>
        <li><a href="#" onClick={() => setActivePanel('notes')}>🤞 Notes</a></li>
        {userRole === 'admin' && (
          <li><a href="#" onClick={() => setActivePanel('administration')}>📋 Administration</a></li>
        )}
        <li><a href="#" onClick={() => setActivePanel('helpInfo')}>📦 Aide</a></li>
        <li><a href="#" onClick={() => setActivePanel('settings')}>⚙️ Paramètres</a></li>
      </ul>
      <div className='versionText'>
        <p>Version-0.0.2-ALPHA-4-build-8</p>
      </div>
    </div>
  );
}
