import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useAuthState } from '@/hooks/useAuthState';
import { Users, Package, AlertTriangle, BarChart3, Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { profile, loading: authLoading } = useAuthState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'reports'>('users');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== 'admin')) {
      navigate('/');
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const collectionName = activeTab === 'users' ? 'users' : activeTab === 'products' ? 'products' : 'reports';
        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, activeTab);
      } finally {
        setLoading(false);
      }
    };
    if (profile?.role === 'admin') fetchData();
  }, [activeTab, profile]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, activeTab, id));
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, activeTab, id), { status: newStatus });
      setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || !profile) return <div className="p-20 text-center">Checking permissions...</div>;
  if (profile.role !== 'admin') return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-serif">Admin Console</h1>
          <p className="text-gray-500 mt-2">Manage the platform data and monitor security.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button 
             onClick={() => setActiveTab('users')}
             className={cn("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2", activeTab === 'users' ? "bg-white shadow" : "text-gray-500")}
           >
             <Users className="w-4 h-4" /> Users
           </button>
           <button 
             onClick={() => setActiveTab('products')}
             className={cn("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2", activeTab === 'products' ? "bg-white shadow" : "text-gray-500")}
           >
             <Package className="w-4 h-4" /> Products
           </button>
           <button 
             onClick={() => setActiveTab('reports')}
             className={cn("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2", activeTab === 'reports' ? "bg-white shadow" : "text-gray-500")}
           >
             <AlertTriangle className="w-4 h-4" /> Reports
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '1,240', icon: Users, color: 'text-blue-600' },
          { label: 'Items Listed', value: '850', icon: Package, color: 'text-purple-600' },
          { label: 'Pending Reports', value: '12', icon: AlertTriangle, color: 'text-red-600' },
          { label: 'Gross Revenue', value: '$45,210', icon: BarChart3, color: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black font-serif">{stat.value}</h3>
            </div>
            <stat.icon className={cn("w-8 h-8 opacity-20", stat.color)} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
          <div className="relative max-w-md w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
               type="text" 
               placeholder={`Search ${activeTab}...`}
               className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button className="text-sm font-bold text-gray-500 hover:text-black">Export CSV</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b">
                <th className="px-8 py-4">Identity</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Date Added</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center text-gray-400">Loading master data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-gray-400">No records found.</td></tr>
              ) : data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center font-serif font-black text-gray-400">
                        {item.displayName?.[0] || item.title?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-sm truncate max-w-[200px]">{item.displayName || item.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px] font-mono">{item.email || item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      item.role === 'admin' ? "bg-red-100 text-red-600" : 
                      item.status === 'active' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {item.role || item.status || 'Standard'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-400 font-mono">
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       {activeTab === 'products' && item.status === 'active' && (
                         <button 
                           onClick={() => handleStatusChange(item.id, 'hidden')} 
                           className="p-2 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition"
                           title="Hide Product"
                         >
                           <XCircle className="w-4 h-4" />
                         </button>
                       )}
                       {activeTab === 'products' && item.status === 'hidden' && (
                         <button 
                           onClick={() => handleStatusChange(item.id, 'active')} 
                           className="p-2 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50 transition"
                           title="Activate Product"
                         >
                           <CheckCircle className="w-4 h-4" />
                         </button>
                       )}
                       <button 
                         onClick={() => handleDelete(item.id)}
                         className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                         title="Permanent Delete"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
