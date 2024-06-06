import React from 'react';
import GroupesManager from './GroupesManager';
import CoursManager from './CoursManager';
import UEManager from './UEManager';

const Administration = () => {
  return (
    <div className="chart">
      <GroupesManager/>
      <CoursManager/>
      <UEManager/>
    </div>
  );
};

export default Administration;
