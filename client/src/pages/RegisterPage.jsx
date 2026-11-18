import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      console.error('Registration failure:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-8 sm:py-12 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('/auth-bg.jpg')`,
        backgroundColor: '#F8F9FD',
      }}
    >
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-7">
          <img
            src="/sweety-logo.png"
            alt="Sweety"
            className="h-14 sm:h-16 w-auto mx-auto object-contain drop-shadow-sm mb-1"
          />
          <span className="text-[10px] font-extrabold text-[#05193C]/60 tracking-widest uppercase">
            Blood Glucose Tracker
          </span>
          <p className="text-xs font-medium text-[#05193C]/60 mt-2">Join Sweety for simplified glucose tracking</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl sm:rounded-4xl p-6 sm:p-8 shadow-soft-lg border border-white/80">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start space-x-2.5 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#05193C]/70 mb-1.5 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-[#FA0C57]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E8ECF4] rounded-2xl text-sm font-bold text-[#05193C] focus:outline-none focus:ring-2 focus:ring-[#FA0C57]/20 focus:border-[#FA0C57] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#05193C]/70 mb-1.5 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-[#FA0C57]" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E8ECF4] rounded-2xl text-sm font-bold text-[#05193C] focus:outline-none focus:ring-2 focus:ring-[#FA0C57]/20 focus:border-[#FA0C57] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#05193C]/70 mb-1.5 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-[#FA0C57]" />
                <span>Password (min. 6 characters)</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E8ECF4] rounded-2xl text-sm font-bold text-[#05193C] focus:outline-none focus:ring-2 focus:ring-[#FA0C57]/20 focus:border-[#FA0C57] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#05193C]/70 mb-1.5 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-[#FA0C57]" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E8ECF4] rounded-2xl text-sm font-bold text-[#05193C] focus:outline-none focus:ring-2 focus:ring-[#FA0C57]/20 focus:border-[#FA0C57] transition-all"
              />
            </div>

            {/* Primary button: #FA0C57 text #FFFFFF */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 px-4 bg-[#FA0C57] hover:bg-[#E00A4D] active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-primary-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-[#05193C]/60">
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-[#FA0C57] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
