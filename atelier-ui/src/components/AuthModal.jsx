import React, { useState } from 'react';
import { ArrowRight, Loader2, Lock, Mail, User, X } from 'lucide-react';

const USERS_KEY = 'aura_users';
const SESSION_KEY = 'aura_current_user';

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export default function AuthModal({ isOpen, onClose, onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleChange = (event) => {
    setError('');
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = getStoredUsers();
    const email = formData.email.trim().toLowerCase();
    const existingUser = users.find((user) => user.email === email);

    if (isLogin) {
      if (!existingUser || existingUser.password !== formData.password) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      const sessionUser = { name: existingUser.name, email: existingUser.email };
      saveSession(sessionUser);
      onAuth(sessionUser);
    } else {
      if (existingUser) {
        setError('Account already exists. Please sign in.');
        setLoading(false);
        return;
      }

      const newUser = {
        name: formData.name.trim(),
        email,
        password: formData.password
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

      const sessionUser = { name: newUser.name, email: newUser.email };
      saveSession(sessionUser);
      onAuth(sessionUser);
    }

    setFormData({ name: '', email: '', password: '' });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[32px] bg-white p-10 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100"
        >
          <X size={20} />
        </button>

        <h2 className="mb-2 font-serif text-3xl">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="mb-8 text-sm text-zinc-500">
          {isLogin ? 'Sign in to save your designs.' : 'Sign up to start saving your favorite interiors.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Full Name"
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 py-4 pl-12 pr-4 outline-none transition focus:border-[#C26A43]"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email Address"
              className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 py-4 pl-12 pr-4 outline-none transition focus:border-[#C26A43]"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Password"
              className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 py-4 pl-12 pr-4 outline-none transition focus:border-[#C26A43]"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#C26A43] py-4 font-bold text-white shadow-lg shadow-[#C26A43]/20 transition hover:bg-[#A85734] disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>{isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin((prev) => !prev);
              setError('');
            }}
            className="font-bold text-[#C26A43]"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
