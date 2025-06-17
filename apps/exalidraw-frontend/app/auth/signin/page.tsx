'use client';

import React, { useState } from 'react';
import { ArrowRight, Github, Mail } from 'lucide-react';
import Link from 'next/link';
import { AuthLayout, InputField } from '@/components/AuthLayout';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    console.log('Sign in:', { email, password });
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your creative journey"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={setEmail}
          required
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          required
          showPasswordToggle
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
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
            href="/signup"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold transition-colors duration-300"
          >
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}