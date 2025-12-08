'use client';

import { useState } from 'react';
import { getAuthHeaders } from '@/app/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/ui/Header';
import Sidebar from '@/app/components/ui/Sidebar';

interface FormData {
  userId: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateAdminPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email verification, 2: Account creation
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && password.length <= 20;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    } else if (formData.userId.length < 6 || formData.userId.length > 16) {
      newErrors.userId = 'User ID must be between 6 and 16 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be between 8 and 20 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const sendEmailVerification = async () => {
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    try {
      setLoading(true);
      // Note: This API endpoint might not exist yet, but we're implementing the frontend flow
      const response = await fetch('https://prod.windeath44.wiki/api/auth/email', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      setVerificationCodeSent(true);
    } catch (error) {
      setErrors({ email: error instanceof Error ? error.message : 'Failed to send verification email' });
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailCode = async () => {
    if (!emailVerificationCode.trim()) {
      setErrors({ verificationCode: 'Verification code is required' });
      return;
    }

    try {
      setLoading(true);
      // Note: This API endpoint might not exist yet, but we're implementing the frontend flow
      const response = await fetch('https://prod.windeath44.wiki/api/auth/email/valid', {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          email: formData.email,
          authorizationCode: emailVerificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      setStep(2);
      setErrors({});
    } catch (error) {
      setErrors({ verificationCode: error instanceof Error ? error.message : 'Failed to verify email' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://prod.windeath44.wiki/api/users/register/admin', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          userId: formData.userId,
          email: formData.email,
          name: formData.name,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create admin account');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create admin account' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-blue-500/30">
        <div className="flex h-screen overflow-hidden">
          <Sidebar activeItem="users" />
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="glass-panel rounded-3xl p-12 border border-[var(--border-color)] shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent opacity-50" />
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-light tracking-tight text-[var(--foreground)] mb-2 font-serif">Account Created</h2>
                  <p className="text-[var(--foreground)]/60 mb-8 font-light">
                    The admin account has been successfully provisioned. Redirecting to user registry...
                  </p>
                  <Link
                    href="/users"
                    className="inline-flex items-center justify-center px-8 py-3 bg-[var(--foreground)] text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all duration-300 btn-text-inverse"
                  >
                    Return to Users
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-blue-500/30">
      <div className="flex h-screen overflow-hidden">
        <Sidebar activeItem="users" />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-3xl mx-auto space-y-8">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Link href="/users" className="text-[10px] font-bold tracking-[0.3em] text-[var(--foreground)]/40 uppercase hover:text-[var(--foreground)] transition-colors flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                      Back to Users
                    </Link>
                  </div>
                  <h1 className="text-4xl font-light tracking-tighter text-[var(--foreground)] font-serif">
                    Create <span className="font-bold italic">Admin</span>
                  </h1>
                </div>
              </div>

              {/* Form Container */}
              <div className="glass-panel rounded-3xl p-10 border border-[var(--border-color)] shadow-2xl bg-[var(--background)]/20 backdrop-blur-xl relative overflow-hidden">
                {/* Background Texture */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Progress Steps */}
                <div className="relative z-10 mb-12">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--border-color)] -z-10" />

                    <div className={`flex flex-col items-center gap-3 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step >= 1 ? 'bg-[var(--background)] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-[var(--background)] border-[var(--border-color)]'
                        }`}>
                        <span className={`text-sm font-bold ${step >= 1 ? 'text-blue-400' : 'text-[var(--foreground)]/40'}`}>1</span>
                      </div>
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--foreground)]">Verification</span>
                    </div>

                    <div className={`flex flex-col items-center gap-3 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step >= 2 ? 'bg-[var(--background)] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-[var(--background)] border-[var(--border-color)]'
                        }`}>
                        <span className={`text-sm font-bold ${step >= 2 ? 'text-blue-400' : 'text-[var(--foreground)]/40'}`}>2</span>
                      </div>
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--foreground)]">Details</span>
                    </div>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-8 max-w-md mx-auto relative z-10">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-light text-[var(--foreground)] mb-2">Email Verification</h2>
                      <p className="text-sm text-[var(--foreground)]/40 font-light">Authenticate the new administrator's identity.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/50 uppercase ml-1">
                          Email Address
                        </label>
                        <div className="flex gap-0">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="flex-1 px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border-color)] rounded-l-lg border-r-0 focus:border-blue-500/50 text-[var(--foreground)] placeholder-[var(--foreground)]/20 focus:outline-none focus:bg-[var(--foreground)]/10 transition-all"
                            placeholder="ADMIN@WINDEATH44.SERVER"
                            disabled={verificationCodeSent}
                          />
                          <button
                            type="button"
                            onClick={sendEmailVerification}
                            disabled={loading || verificationCodeSent}
                            className="px-6 bg-[var(--foreground)]/10 border border-[var(--border-color)] border-l-0 rounded-r-lg text-[10px] font-bold text-[var(--foreground)] hover:bg-[var(--foreground)]/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider transition-all"
                          >
                            {loading ? 'Sending...' : verificationCodeSent ? 'Sent' : 'Send Code'}
                          </button>
                        </div>
                        {errors.email && <p className="text-xs text-red-400 mt-1 ml-1 font-mono">{errors.email}</p>}
                      </div>

                      {verificationCodeSent && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                          <label className="block text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/50 uppercase ml-1">
                            Verification Code
                          </label>
                          <div className="flex gap-0">
                            <input
                              type="text"
                              value={emailVerificationCode}
                              onChange={(e) => setEmailVerificationCode(e.target.value)}
                              className="flex-1 px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border-color)] rounded-l-lg border-r-0 focus:border-blue-500/50 text-[var(--foreground)] placeholder-[var(--foreground)]/20 focus:outline-none focus:bg-[var(--foreground)]/10 transition-all tracking-widest"
                              placeholder="000000"
                            />
                            <button
                              type="button"
                              onClick={verifyEmailCode}
                              disabled={loading}
                              className="px-6 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-r-lg text-[10px] font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                            >
                              {loading ? '...' : 'Verify'}
                            </button>
                          </div>
                          {errors.verificationCode && <p className="text-xs text-red-400 mt-1 ml-1 font-mono">{errors.verificationCode}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmit} className="space-y-8 max-w-xl mx-auto relative z-10">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-light text-[var(--foreground)] mb-2">Account Details</h2>
                      <p className="text-sm text-[var(--foreground)]/40 font-light">Configure credentials for the new administrator.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/50 uppercase ml-1">
                          User ID
                        </label>
                        <input
                          type="text"
                          name="userId"
                          value={formData.userId}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border-color)] rounded-lg focus:border-blue-500/50 text-[var(--foreground)] placeholder-[var(--foreground)]/20 focus:outline-none focus:bg-[var(--foreground)]/10 transition-all"
                          placeholder="6-16 CHARACTERS"
                          minLength={6}
                          maxLength={16}
                        />
                        {errors.userId && <p className="text-xs text-red-400 mt-1 ml-1 font-mono">{errors.userId}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/50 uppercase ml-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border-color)] rounded-lg focus:border-blue-500/50 text-[var(--foreground)] placeholder-[var(--foreground)]/20 focus:outline-none focus:bg-[var(--foreground)]/10 transition-all"
                          placeholder="ENTER NAME"
                        />
                        {errors.name && <p className="text-xs text-red-400 mt-1 ml-1 font-mono">{errors.name}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/50 uppercase ml-1">
                        Verified Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border-color)] rounded-lg text-[var(--foreground)]/50 cursor-not-allowed"
                        disabled
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/50 uppercase ml-1">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border-color)] rounded-lg focus:border-blue-500/50 text-[var(--foreground)] placeholder-[var(--foreground)]/20 focus:outline-none focus:bg-[var(--foreground)]/10 transition-all"
                          placeholder="••••••••"
                          minLength={8}
                          maxLength={20}
                        />
                        {errors.password && <p className="text-xs text-red-400 mt-1 ml-1 font-mono">{errors.password}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/50 uppercase ml-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border-color)] rounded-lg focus:border-blue-500/50 text-[var(--foreground)] placeholder-[var(--foreground)]/20 focus:outline-none focus:bg-[var(--foreground)]/10 transition-all"
                          placeholder="••••••••"
                        />
                        {errors.confirmPassword && <p className="text-xs text-red-400 mt-1 ml-1 font-mono">{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    {errors.submit && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                        <p className="text-xs text-red-400 font-mono">{errors.submit}</p>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 px-6 py-3 border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 uppercase tracking-wider transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] px-6 py-3 bg-[var(--foreground)] rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-text-inverse"
                      >
                        {loading ? 'Provisioning...' : 'Create Admin Account'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}