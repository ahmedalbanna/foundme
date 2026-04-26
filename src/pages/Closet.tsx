import React, { useState, useEffect } from 'react';
import { PackageOpen, DollarSign, ListPlus, TrendingUp, Eye, Heart, CheckCircle, Trash2, Edit } from 'lucide-react';
import { useAuthState } from '@/hooks/useAuthState';
import { Link, useParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export function Closet() {
  const { user } = useAuthState();
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState<'listings' | 'sold' | 'purchases' | 'stats'>('listings');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.uid;
  const isOwner = user?.uid === targetUserId;

  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!targetUserId) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'products'),
          where('sellerId', '==', targetUserId),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'products');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProducts();
  }, [targetUserId]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user && !userId) {
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
    { label: 'Active Listings', value: products.length, icon: PackageOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Views this Week', value: '342', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400 font-serif">
                {user?.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif">{user?.displayName || 'Seller Name'}</h1>
            <p className="text-gray-500 mt-1">@seller_handler • Joined 2024</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex text-yellow-400 text-sm">★★★★★</span>
              <span className="text-sm font-medium text-gray-600">5.0 (12 reviews)</span>
            </div>
          </div>
        </div>
        {isOwner && (
          <Link to="/add-product" className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition">
            <ListPlus className="w-4 h-4" />
            <span>Add New Listing</span>
          </Link>
        )}
      </div>

      {isOwner && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold font-serif">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6 pt-4">
        <div className="flex space-x-8 border-b">
          {['listings', 'sold', 'purchases', 'stats'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn("pb-4 text-sm font-medium transition-colors relative capitalize", activeTab === tab ? "text-black" : "text-gray-500 hover:text-gray-900")}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading closet items...</div>
        ) : products.length > 0 && activeTab === 'listings' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition">
                <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover transition group-hover:scale-105" />
                  {product.status === 'sold' && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-black text-white px-4 py-2 font-bold uppercase tracking-widest text-xs rounded-full">Sold Out</span>
                    </div>
                  )}
                </Link>
                <div className="p-4 flex flex-col flex-grow relative">
                  <h4 className="font-medium text-sm truncate">{product.title}</h4>
                  <p className="font-bold font-serif py-1">${product.price}</p>
                  
                  {isOwner && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-gray-500 text-xs font-medium">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1" title="Views"><Eye className="w-3.5 h-3.5" /> 124</span>
                        <span className="flex items-center gap-1" title="Saves"><Heart className="w-3.5 h-3.5" /> 12</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <button className="p-1.5 hover:bg-gray-100 rounded-md transition text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                         <button onClick={(e) => handleDelete(product.id, e)} className="p-1.5 hover:bg-gray-100 rounded-md transition text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border shadow-sm p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
            <PackageOpen className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No active {activeTab}</h3>
            <p className="mt-2">You don't have any items in this section right now.</p>
            {activeTab === 'listings' && isOwner && (
              <Link to="/add-product" className="mt-6 border border-gray-300 font-medium text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50">
                Create a listing
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
