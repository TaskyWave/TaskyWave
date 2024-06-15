import React, { useState, useEffect } from 'react';
import { database, auth } from './firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const InfoPosts = () => {
  const [posts, setPosts] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [userUid, setUserUid] = useState('');
  const [userAnnee, setUserAnnee] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [departements, setDepartements] = useState([]);
  const [ecoles, setEcoles] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserUid(user.uid);
        fetchUserAnnee(user.uid);
        fetchPosts();
        fetchUserRole(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const anneesRef = database.ref('ANNEES');
    anneesRef.on('value', (snapshot) => {
      const anneesData = snapshot.val();
      if (anneesData) {
        const anneesList = Object.keys(anneesData).map((key) => ({
          id: key,
          ...anneesData[key],
        }));
        setAnnees(anneesList);
      } else {
        setAnnees([]);
      }
    });

    return () => {
      const anneesRef = database.ref('ANNEES');
      anneesRef.off();
    };
  }, []);

  useEffect(() => {

    const anneesRef = firebase.database().ref('ANNEES');
    anneesRef.on('value', (snapshot) => {
      const anneesData = snapshot.val();
      if (anneesData) {
        const anneesList = Object.keys(anneesData).map((key) => ({
          id: key,
          ...anneesData[key],
        }));
        setAnnees(anneesList);
      } else {
        setAnnees([]);
      }
    });

    const departementsRef = firebase.database().ref('DEPARTEMENTS');
    departementsRef.on('value', (snapshot) => {
      const departementsData = snapshot.val();
      if (departementsData) {
        const departementsList = Object.keys(departementsData).map((key) => ({
          id: key,
          ...departementsData[key],
        }));
        setDepartements(departementsList);
      } else {
        setDepartements([]);
      }
    });

    const ecolesRef = firebase.database().ref('ECOLES');
    ecolesRef.on('value', (snapshot) => {
      const ecolesData = snapshot.val();
      if (ecolesData) {
        const ecolesList = Object.keys(ecolesData).map((key) => ({
          id: key,
          ...ecolesData[key],
        }));
        setEcoles(ecolesList);
      } else {
        setEcoles([]);
      }
    });

    return () => {
      anneesRef.off();
      ecolesRef.off();
      departementsRef.off();
    };
  }, []);

  const fetchUserAnnee = (uid) => {
    const userRef = database.ref(`USERS/${uid}/groupe`);
    userRef.on('value', (snapshot) => {
      const groupeId = snapshot.val();
      const userRef = database.ref(`GROUPES/${groupeId}/anneeId`);
        userRef.on('value', (snapshot) => {
          const anneeId = snapshot.val();
          setUserAnnee(anneeId);
        });
    });
  };

  const fetchPosts = () => {
    const postsRef = database.ref('POSTS');
    postsRef.on('value', (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const postsList = Object.keys(postsData).map((key) => ({
          id: key,
          ...postsData[key],
        }));
        setPosts(postsList);
      } else {
        setPosts([]);
      }
    });
  };

  const fetchUserRole = (uid) => {
    const userRef = database.ref(`USERS/${uid}/role`);
    userRef.on('value', (snapshot) => {
      const role = snapshot.val();
      setUserRole(role);
    });
  };

  const addPost = () => {
    const date = new Date().toString();
    const postUUID = uuidv4();
    const postsRef = database.ref(`POSTS/${postUUID}`);
    const newPost = {
      id: postUUID,
      content: postContent,
      userUid,
      year: selectedAnnee, // Ajouté
      timestamp: date,
    };
    postsRef.set(newPost);
    setPostContent('');
    setSelectedAnnee(''); // Ajouté
    setIsModalOpen(false);
  };

  const editPost = (post) => {
    setEditingPost(post);
    setPostContent(post.content);
    setSelectedAnnee(post.year); // Ajouté
    setIsModalOpen(true);
  };

  const savePost = () => {
    const postsRef = database.ref(`POSTS/${editingPost.id}`);
    postsRef.set({
      ...editingPost,
      content: postContent,
      year: selectedAnnee, // Ajouté
    });
    setEditingPost(null);
    setPostContent('');
    setSelectedAnnee(''); // Ajouté
    setIsModalOpen(false);
  };

  const deletePost = (postId) => {
    const postsRef = database.ref(`POSTS/${postId}`);
    postsRef.remove();
  };

  const handleSubmit = () => {
    if (editingPost) {
      savePost();
    } else {
      addPost();
    }
  };

  const getAnneeInfo = (anneeId) => {
    const annee = annees.find((a) => a.id === anneeId);
    if (annee) {
      const departement = departements.find((d) => d.id === annee.departementId);
      const ecole = ecoles.find((e) => e.id === departement?.ecoleId);
      return `${departement?.nomDepartement || 'Département non trouvé'}-${annee.nomAnnee}-${ecole?.ecole || 'École non trouvée'}`;
    }
    return 'Information non trouvée';
  };

  let filteredPosts = posts.filter((post) => post.year === userAnnee);
  if(userRole === "admin"){
    filteredPosts = posts; // Ajouté
  }

  return (
    <div className='chart2'>
      <div className="info-grid">
        {userRole === 'admin' && (
          <>
            <button className='un-button' onClick={() => setIsModalOpen(true)}>New Post</button>
          </>
        )}
        <div className="posts-list">
          {filteredPosts.map((post) => ( // Modifié
            <div key={post.id} className="post">
              <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
              <small>{new Date(post.timestamp).toLocaleString()}</small>
              {userRole === 'admin' && (
                <>
                  <button className='un-button' onClick={() => editPost(post)}>Éditer</button>
                  <button className='un-delete-button' onClick={() => deletePost(post.id)}>Supprimer</button>
                  <small>{getAnneeInfo(post.year)}</small>
                </>
              )}
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="modal">
            <div className="text-modal-content">
              <span className="close" onClick={() => { setIsModalOpen(false); setEditingPost(null); }}>&times;</span>
              <ReactQuill
                value={postContent}
                onChange={setPostContent}
                modules={{
                  toolbar: [
                    [{ header: '1' }, { header: '2' }, { font: [] }],
                    [{ size: [] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image'],
                    ['clean'],
                  ],
                }}
                formats={[
                  'header', 'font', 'size',
                  'bold', 'italic', 'underline', 'strike', 'blockquote',
                  'list', 'bullet',
                  'link', 'image',
                ]}
                style={{ height: '200px', marginBottom: '20px' }}
              />
              <select
                value={selectedAnnee}
                onChange={(e) => setSelectedAnnee(e.target.value)}
                required
              >
                <option value="" disabled>Choisissez une Année</option>
                {annees.map((annee) => (
                  <option key={annee.id} value={annee.id}>
                    {getAnneeInfo(annee.id)}
                  </option>
                ))}
              </select>
              <button className='savePostButton' onClick={handleSubmit}>{editingPost ? 'Save Post' : 'Add Post'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPosts;
