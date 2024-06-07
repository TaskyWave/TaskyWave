import React from 'react';
import PropTypes from 'prop-types';

const Notes = ({ note, coef, cours, nom }) => {
  return (
    <tr>
      <td>{nom}</td>
      <td>{note}</td>
      <td>{coef}</td>
      {/*<td>{cours}</td>*/}
    </tr>
  );
};

Notes.propTypes = {
  note: PropTypes.number.isRequired,
  coef: PropTypes.number.isRequired,
  cours: PropTypes.string.isRequired,
  nom: PropTypes.string.isRequired,
};

export default Notes;
