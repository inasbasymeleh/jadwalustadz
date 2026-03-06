import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Cek email Anda untuk instruksi reset password.');
    } catch (err: any) {
      setError('Gagal mereset password. Pastikan email terdaftar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-dark-bg font-sans flex justify-center items-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Masukkan email Anda untuk mereset password</p>
        </div>

        <div className="card-timbul relative">
          <Link to="/login" className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="pt-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            {message && (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
                <CheckCircle size={16} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-gold-primary outline-none"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full btn-timbul mt-6">
                Kirim Link Reset
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
