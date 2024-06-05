import React, { useState, useEffect } from 'react';
import { auth } from './firebase';

const Auth = ({ onUserAuthenticated }) => {
  const [emailSP, setEmailSP] = useState('');
  const [passwordSP, setPasswordSP] = useState('');
  const [emailLI, setEmailLI] = useState('');
  const [passwordLI, setPasswordLI] = useState('');
  const [errorSP, setErrorSP] = useState(null);
  const [errorLI, setErrorLI] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        onUserAuthenticated(user.uid, user.email);
      }
    });
    return () => unsubscribe();
  }, [onUserAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await auth.signInWithEmailAndPassword(emailLI, passwordLI);
      setErrorLI(null);
    } catch (err) {
      setErrorLI(err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await auth.createUserWithEmailAndPassword(emailSP, passwordSP);
      setErrorSP(null);
    } catch (err) {
      setErrorSP(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-panel" id="signup-panel">
        <h2>Sign Up</h2>
        <form id="signup-form" onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            value={emailSP}
            onChange={(e) => setEmailSP(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={passwordSP}
            onChange={(e) => setPasswordSP(e.target.value)}
            required
          />
          <button type="submit">Create My Account</button>
          {errorSP && <p className="error">{errorSP}</p>}
        </form>
      </div>
      <div className="auth-panel" id="login-panel">
        <h2>Login</h2>
        <form id="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={emailLI}
            onChange={(e) => setEmailLI(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={passwordLI}
            onChange={(e) => setPasswordLI(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          {errorLI && <p className="error">{errorLI}</p>}
        </form>
      </div>
    </div>
  );
};

export default Auth;
