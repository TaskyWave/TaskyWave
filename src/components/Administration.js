import React from 'react';
import GroupesManager from './GroupesManager';
import CoursManager from './CoursManager';
import UEManager from './UEManager';
import EcolesManager from './EcolesManager';
import DepartementsManager from './DepartementsManager';
import AnneeManager from './AnneeManager';

const Administration = () => {
  return (
    <div className="chart">
      <EcolesManager/>
      <DepartementsManager/>
      <AnneeManager/>
      <GroupesManager/>
      <CoursManager/>
      <UEManager/>
    </div>
  );
};

export default Administration;
