'use client';

import React, { useState } from 'react';
import { ArrowRight, Github, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AuthLayout, InputField } from '@/components/AuthLayout';
import axios from 'axios';
import { HTTP_URL } from '@repo/backend-common/config';

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${HTTP_URL}/signin`, {
        email: formData.email,
        password: formData.password
      });
      console.log(response)

      if (response.status === 200 && response.data.token) {
        // Store the token in localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem('token', response.data.token);
        } else {
          sessionStorage.setItem('token', response.data.token);
        }
        
        // Redirect to home page or dashboard
        window.location.href = '/dashboard';
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (error: any) {
      if (error.response) {
        switch (error.response.status) {
          case 404:
            setError('User not found. Please check your email.');
            break;
          case 401:
            setError('Invalid password. Please try again.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(error.response.data?.mssg || 'Sign in failed. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your creative journey"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <InputField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
          required
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(value) => handleInputChange('password', value)}
          required
          showPasswordToggle
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors duration-300"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300"
          >
            <Github className="w-5 h-5 mr-2" />
            GitHub
          </button>
          <button
            type="button"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300"
          >
            <Mail className="w-5 h-5 mr-2" />
            Google
          </button>
        </div>

        <div className="text-center">
          <span className="text-gray-600 dark:text-gray-300">Don't have an account? </span>
          <Link
            href="/auth/signup"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold transition-colors duration-300"
          >
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}