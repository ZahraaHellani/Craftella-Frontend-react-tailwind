import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';

export const Community: React.FC = () => {
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: 'Holiday Design Challenge',
      description: 'Create festive designs for the upcoming holiday season',
      participants: 156,
      prize: '$500 + Featured Design',
      deadline: 'Dec 15, 2024',
      status: 'active',
    },
    {
      id: 2,
      title: 'Minimalist Logo Contest',
      description: 'Design clean, minimal logos for small businesses',
      participants: 89,
      prize: '$300 + Portfolio Feature',
      deadline: 'Jan 10, 2025',
      status: 'upcoming',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'gallery' | 'forum' | 'challenges' | 'leaderboard'>('challenges');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="inline-flex rounded-md shadow-sm">
              {(['gallery', 'forum', 'challenges', 'leaderboard'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 text-sm font-medium rounded-l-md first:rounded-l-md last:rounded-r-md ${
                    activeTab === tab
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'challenges' && (
          <>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Design Challenges</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{challenge.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      challenge.status === 'active'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
                    }`}>
                      {challenge.status}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{challenge.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-500">Participants</span>
                      <div className="font-medium">{challenge.participants}</div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-500">Prize</span>
                      <div className="font-medium text-primary">{challenge.prize}</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 dark:text-slate-500">Deadline</span>
                    <div className="font-medium">{challenge.deadline}</div>
                  </div>
                  <Button className="mt-4 w-full">
                    Join Challenge
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline">
                View All
              </Button>
            </div>
          </>
        )}

        {activeTab === 'gallery' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Design Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={`https://placehold.co/300x300/e2e8f0/64748b?text=Design${i + 1}`}
                    alt={`Design ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'forum' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Community Forum</h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">New Topic</h3>
                <Button size="sm">Start Discussion</Button>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Best Practices for Minimalist Design', author: 'DesignPro', replies: 24, views: 1200 },
                  { title: 'How to Choose Colors for Your Brand', author: 'ColorMaster', replies: 18, views: 890 },
                  { title: 'Printing Techniques for Wood Surfaces', author: 'WoodWorker', replies: 12, views: 540 },
                ].map((topic, index) => (
                  <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-100">{topic.title}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">by {topic.author}</div>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <span>{topic.replies} replies</span> • <span>{topic.views} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Leaderboard</h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'DesignPro', points: 5200 },
                  { rank: 2, name: 'ColorMaster', points: 4800 },
                  { rank: 3, name: 'WoodWorker', points: 4500 },
                  { rank: 4, name: 'PixelArtist', points: 4200 },
                  { rank: 5, name: 'InkMaster', points: 3900 },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        user.rank === 1 ? 'bg-gold-500' : user.rank === 2 ? 'bg-silver-500' : user.rank === 3 ? 'bg-bronze-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        {user.rank}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{user.name}</span>
                    </div>
                    <span className="font-bold text-primary">{user.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};