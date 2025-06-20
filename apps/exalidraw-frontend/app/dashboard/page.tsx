'use client';
import { AxiosError } from 'axios';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  ArrowRight, 
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/Theme/ThemeToggle';
import Link from 'next/link';
import axios from 'axios';
import { HTTP_URL } from '@repo/backend-common/config';

interface Room {
  id: string;
  slug: string;
  createdAt: string;
  participants: number;
  adminId:string
}

export default function DashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [joinRoomName, setJoinRoomName] = useState('');
  const [userRooms, setuserRooms] = useState<Room[]>([]);
  const [, setFilteredRooms] = useState<Room[]>([]);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRooms(userRooms);
    } else {
      const filtered = userRooms.filter(room => 
        room.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  }, [searchQuery, userRooms]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/signin';
        return;
      }

      const response = await axios.get(`${HTTP_URL}/allrooms`, {
        headers: {
          Authorization: token
        }
      });
      console.log(response.data)

      setRooms(response.data.rooms);
      setuserRooms(response.data.user_rooms);
    } catch (err) {
      const error = err as AxiosError<{ mssg?: string }>;
      if (error.response?.status === 401) {
        window.location.href = '/auth/signin';
      } else {
        setError('Failed to fetch rooms. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post(
        `${HTTP_URL}/createRoom`,
        { roomName: newRoomName },
        {
          headers: {
            Authorization:token
          }
        }
      );


      setRooms((prev) => {
        return [...prev, response.data.room]});
      setShowCreateRoom(false);
      setNewRoomName('');
    } catch (error) {
      setError('Failed to create room. Please try again.');
      console.log(error)
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.href = '/auth/signin';
  };

  const handleJoinRoom = (roomSlug: string) => {
    window.location.href = `/canvas/${roomSlug}`;
  };

  const handleJoinExistingRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    if (!joinRoomName.trim()) {
      setJoinError('Please enter a room name');
      return;
    }

    const roomExists = rooms.some(room => room.slug.toLowerCase() === joinRoomName.toLowerCase());
    
    if (roomExists) {
      handleJoinRoom(joinRoomName);
    } else {
      setJoinError('Room not found. Please check the room name and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      {/* Navigation */}
      <nav className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link 
              href="/"
              className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Exalidraw
                </span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Your Rooms
            </h1>

            <div className='flex justify-center gap-6'>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Create Room</span>
              </button>
              <button
                onClick={() => setShowJoinRoom(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Users className="w-5 h-5" />
                <span>Join Room</span>
              </button>
            </div>

          </div>

          

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Create Room Modal */}
          {showCreateRoom && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  Create New Room
                </h2>
                <form onSubmit={handleCreateRoom} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Enter room name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateRoom(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Join Room Modal */}
          {showJoinRoom && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  Join Existing Room
                </h2>
                <form onSubmit={handleJoinExistingRoom} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={joinRoomName}
                      onChange={(e) => setJoinRoomName(e.target.value)}
                      placeholder="Enter room name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
                      required
                    />
                    {joinError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {joinError}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowJoinRoom(false);
                        setJoinRoomName('');
                        setJoinError(null);
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      Join
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Rooms List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : userRooms && userRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRooms.map((room) => (
                <div
                  key={room.id}
                  className="group bg-white dark:bg-gray-700 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      {room.slug}
                    </h3>
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{room.participants}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Created {new Date(room.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleJoinRoom(room.slug)}
                    className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                  >
                    <span className="text-sm font-medium">Join Room</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No rooms found matching your search.' : 'You haven\'t joined any rooms yet.'}
              </p>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="mt-4 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium"
              >
                Create your first room
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 