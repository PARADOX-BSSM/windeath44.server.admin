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
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          email: formData.email,
          code: emailVerificationCode,
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar activeItem="users" />
          <main className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Admin Account Created!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The admin account has been successfully created. Redirecting to user list...
                </p>
                <Link
                  href="/admin/users"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Go to User List
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar activeItem="users" />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Create Admin Account</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Create a new administrator account with full privileges
                </p>
              </div>
              <Link
                href="/admin/users"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Back to Users
              </Link>
            </div>

            {/* Progress Steps */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-6">
                <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Email Verification</span>
                </div>
                <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Account Creation</span>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Step 1: Verify Email</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter the email address for the new admin account. We'll send a verification code to confirm ownership.
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                        placeholder="admin@example.com"
                        disabled={verificationCodeSent}
                      />
                      <button
                        type="button"
                        onClick={sendEmailVerification}
                        disabled={loading || verificationCodeSent}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : verificationCodeSent ? 'Sent' : 'Send Code'}
                      </button>
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  {verificationCodeSent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Verification Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={emailVerificationCode}
                          onChange={(e) => setEmailVerificationCode(e.target.value)}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                          placeholder="Enter verification code"
                        />
                        <button
                          type="button"
                          onClick={verifyEmailCode}
                          disabled={loading}
                          className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {loading ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                      {errors.verificationCode && <p className="mt-1 text-sm text-red-500">{errors.verificationCode}</p>}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Step 2: Create Account</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fill in the details for the new admin account.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        User ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="userId"
                        value={formData.userId}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                        placeholder="6-16 characters"
                        minLength={6}
                        maxLength={16}
                      />
                      {errors.userId && <p className="mt-1 text-sm text-red-500">{errors.userId}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                        placeholder="Enter full name"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email (Verified)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                      disabled
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                        placeholder="8-20 characters"
                        minLength={8}
                        maxLength={20}
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                        placeholder="Re-enter password"
                      />
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating Account...' : 'Create Admin Account'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
