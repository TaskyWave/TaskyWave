import React from 'react';

export function Sidebar({ setActivePanel }) {
  return (
    <div className="sidebar">
      <h1>TaskyWave</h1>
      <ul>
        <li><a href="#" onClick={() => setActivePanel('agenda')}>🏠 Agenda</a></li>
        <li><a href="#" onClick={() => setActivePanel('notes')}>🤞 Notes</a></li>
        <li><a href="#" onClick={() => setActivePanel('administration')}>📋 Administration</a></li>
        <li><a href="#" onClick={() => setActivePanel('helpInfo')}>📦 Aide et info</a></li>
        <li><a href="#" onClick={() => setActivePanel('settings')}>⚙️ Paramètres</a></li>
      </ul>
      <div className='versionText'>
        <p>Version-0.0.0-Snapshot-0-build-0</p>
      </div>
    </div>
  );
}
