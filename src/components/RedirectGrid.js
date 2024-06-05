import React from 'react';
import moodleLogo from '../Images/moodleLogo.png';
import planningSupLogo from '../Images/planningSupLogo.png';
import ubsLogo from '../Images/ubsLogo.png';

export function RedirectGrid() {
  return (
    <div className="stats">
      <a href="https://ent.univ-ubs.fr/uPortal/render.userLayoutRootNode.uP" target="_blank" className="stat">
        <img src={ubsLogo} ></img>
        <p>E.N.T</p>
      </a>
      <a href="https://moodle.univ-ubs.fr/my/" target="_blank" className="stat">
        <img src={moodleLogo} ></img>
        <p>Moodle</p>
      </a>
      <a href="https://planningsup.app/" target="_blank" className="stat">
        <img src={planningSupLogo} ></img>
        <p>PlanningSup</p>
      </a>
      {/*
      <div className="stat">
      <img></img>
        <p>Un autre truc</p>
  </div>*/}
    </div>
  );
}