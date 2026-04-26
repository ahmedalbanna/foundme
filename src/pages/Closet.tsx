import { useState } from 'react';
import { PackageOpen, DollarSign, ListPlus, TrendingUp } from 'lucide-react';
import { useAuthState } from '@/hooks/useAuthState';

export function Closet() {
  const { user } = useAuthState();
  const [activeTab, setActiveTab] = useState<'listings' | 'sold' | 'purchases' | 'stats'>('listings');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-serif font-bold mb-4">Your Closet Awaits</h2>
        <p className="text-gray-500 mb-8 max-w-md">Sign in to manage your listings, track your sales, and view your purchases.</p>
        <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition">
          Sign In
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Sales', value: '$1,250', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Active Listings', value: '4', icon: PackageOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Views this Week', value: '342', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400 font-serif">
                {user.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif">{user.displayName || 'Seller Name'}</h1>
            <p className="text-gray-500 mt-1">@seller_handler • Joined 2024</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex text-yellow-400 text-sm">★★★★★</span>
              <span className="text-sm font-medium text-gray-600">5.0 (12 reviews)</span>
            </div>
          </div>
        </div>
        <button className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition">
          <ListPlus className="w-4 h-4" />
          <span>Add New Listing</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold font-serif">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex space-x-8 border-b">
          {['listings', 'sold', 'purchases', 'stats'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-sm font-medium transition-colors relative capitalize ${
                activeTab === tab ? 'text-black' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl border shadow-sm p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
          <PackageOpen className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No active {activeTab}</h3>
          <p className="mt-2">You don't have any items in this section right now.</p>
          {activeTab === 'listings' && (
            <button className="mt-6 border border-gray-300 font-medium text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50">
              Create a listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
