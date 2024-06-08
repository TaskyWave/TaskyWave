import React, { useState, useEffect } from 'react';
import {database, auth} from './firebase';
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const InfoPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [userUid, setUserUid] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserUid(user.uid);
        fetchPosts();
        fetchUserRole(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

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
      timestamp: date,
    };
    postsRef.set(newPost);
    setPostContent('');
    setIsModalOpen(false);
  };

  const editPost = (post) => {
    setEditingPost(post);
    setPostContent(post.content);
    setIsModalOpen(true);
  };

  const savePost = () => {
    const postsRef = database.ref(`POSTS/${editingPost.id}`);
    postsRef.set({
      ...editingPost,
      content: postContent,
    });
    setEditingPost(null);
    setPostContent('');
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

  return (
    <div className='chart2'>
      <div className="info-grid">
      {userRole === 'admin' && (
                <>
        <button onClick={() => setIsModalOpen(true)}>New Post</button>
        </>
              )}
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post">
              <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
              <small>{new Date(post.timestamp).toLocaleString()}</small>
              {userRole === 'admin' && (
                <>
                  <button onClick={() => editPost(post)}>Éditer</button>
                  <button onClick={() => deletePost(post.id)}>Supprimer</button>
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
                <button className='savePostButton' onClick={handleSubmit}>{editingPost ? 'Save Post' : 'Add Post'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPosts;
