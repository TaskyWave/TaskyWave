import React from "react";
import { getDatabase, ref, set } from 'firebase/database';

const Items = ({ products, onDeleteTask, onEditTask, setProducts, userId, userRole }) => {
  const handleCheckTask = (taskId, newIsDone) => {
    const updatedProducts = products.map(product => {
      if (product.id === taskId) {
        const db = getDatabase();
        const userTaskRef = ref(db, `USERS/${userId}/userTasks/${taskId}`);
        set(userTaskRef, { isDone: newIsDone }).catch(error => {
          console.error("Error updating isDone in Firebase: ", error);
        });

        return { ...product, isDone: newIsDone };
      }
      return product;
    });

    setProducts(updatedProducts);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Est fait</th>
          <th>Jour</th>
          <th>Heure</th>
          <th>Groupe</th>
          {userRole === 'admin' && (
          <th>Actions</th>
        )}
          <th className="IDColumn">ID</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>{product.desc}</td>
            <td>
              {product.isDone ? (
                <button
                  className="check-btn done"
                  onClick={() => handleCheckTask(product.id, false)}
                >
                  Fait !
                </button>
              ) : (
                <button
                  className="check-btn not-done"
                  onClick={() => handleCheckTask(product.id, true)}
                >
                  Pas fait !
                </button>
              )}
            </td>
            <td>{new Date(product.jour).toLocaleDateString()}</td>
            <td>{product.heure}</td>
            <td>{product.groupe}</td>
            {userRole === 'admin' && (
              <td>
                <button
                  className="delete-btn"
                  onClick={() => onDeleteTask(product.id)}
                >
                  Supprimer
                </button>
                <button
                  className="edit-btn"
                  onClick={() => onEditTask(product)}
                >
                  Editer
                </button>
              </td>
            )}
            <td className="TaskID">{product.id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Items;
