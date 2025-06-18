'use client';

import React, { useState } from 'react';
import { ArrowRight, Github, Mail, Check } from 'lucide-react';
import Link from 'next/link';
import { AuthLayout, InputField } from '@/components/AuthLayout';
import axios from 'axios';
import { HTTP_URL } from '@repo/backend-common/config';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${HTTP_URL}/signup`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log(formData);

      const data = await response.data;
      
      if (response.status===404) {
        throw new Error(data.mssg || 'Signup failed');
      }
      if (response.status===500) {
        throw new Error(data.mssg || 'Database Error');
      }
      if (response.status===409) {
        throw new Error(data.mssg || 'Try Different Email');
      }

      // automatically stimulate signin end point and redirect to dashboard page


      try{
        const signinResponse = await axios.post(`${HTTP_URL}/signin`, {
          email: formData.email,
          password: formData.password
          }, {
            headers: {
              'Content-Type': 'application/json',
              }
              });
  
              if (signinResponse.status === 200 && signinResponse.data.token) {
                // Store the token in localStorage if remember me is checked
                  sessionStorage.setItem('token', signinResponse.data.token);
                
                
                // Redirect to home page or dashboard
                window.location.href = '/dashboard';
              }
      }
      catch(err){
        console.log(err);
        alert("error while signing in ")
      }
      


    } catch (error) {
      alert(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join thousands of creators using Exalidraw"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="First Name"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            required
          />
          <InputField
            label="Last Name"
            type="text"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            required
          />
        </div>

        <InputField
          label="Username"
          type="text"
          placeholder="jhon_draw"
          value={formData.username}
          onChange={(value) => handleInputChange('username', value)}
          required
        />

        <InputField
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
          required
        />

        <div>
          <InputField
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(value) => handleInputChange('password', value)}
            required
            showPasswordToggle
          />
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength(formData.password))}`}
                    style={{ width: `${(passwordStrength(formData.password) / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {getStrengthText(passwordStrength(formData.password))}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className={`flex items-center space-x-1 ${formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <Check className="w-3 h-3" />
                  <span>At least 8 characters</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(value) => handleInputChange('confirmPassword', value)}
          required
          showPasswordToggle
        />

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-2 mt-1"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
            I agree to the{' '}
            <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors duration-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors duration-300">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !agreedToTerms}
          className="group w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
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
          <span className="text-gray-600 dark:text-gray-300">Already have an account? </span>
          <Link
            href="/auth/signin"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold transition-colors duration-300"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}