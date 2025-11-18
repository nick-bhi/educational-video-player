'use client';

import Link from 'next/link';
import Logo from './Logo';

export default function SplashPage() {

  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Watch Videos',
      description: 'Learn from fun educational videos on any topic you want!',
      color: 'from-ka-blue to-ka-teal',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      title: 'Create Your Own',
      description: 'Share your knowledge by creating and uploading your own videos!',
      color: 'from-ka-green to-ka-teal',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Ask Questions',
      description: 'Comment on videos and ask questions to learn even more!',
      color: 'from-ka-purple to-ka-pink',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Easy to Find',
      description: 'Search through all videos to find exactly what you need!',
      color: 'from-ka-orange to-ka-yellow',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-4">
            <Logo size="large" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Tutorly</h1>
              <p className="text-base text-gray-500 -mt-1">Learn with your study buddy!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900">
              Learning Made Fun!
            </h2>
            <div className="w-12 h-12 sm:w-16 sm:h-16 text-ka-blue">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9L22 9L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9L9.5 9L12 2Z"/>
              </svg>
            </div>
          </div>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Watch educational videos, create your own, and learn together with friends!
          </p>
          <Link
            href="/videos"
            className="inline-block px-8 py-4 bg-ka-blue text-white rounded-2xl hover:bg-ka-teal focus:outline-none focus:ring-4 focus:ring-ka-blue/30 transition-all font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Get Started →
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:scale-[1.02] border-2 border-gray-100"
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-lg text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-ka-blue to-ka-teal rounded-3xl shadow-2xl p-12 text-center text-white">
          <h3 className="text-4xl font-bold mb-4">Ready to Start Learning?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join Tutorly today and discover a fun way to learn!
          </p>
          <Link
            href="/videos"
            className="inline-block px-10 py-4 bg-white text-ka-blue rounded-2xl hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Explore Videos →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center space-x-3">
            <Logo size="small" />
            <p className="text-gray-600 font-medium">Made with ❤️ for learners everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

