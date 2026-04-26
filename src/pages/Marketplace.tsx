import { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, ChevronDown, Heart } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export function Marketplace() {
  const [searchParams] = useSearchParams();
  const isRare = searchParams.get('rare') === 'true';
  const isFavorites = searchParams.get('favorites') === 'true';
  
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'pre_owned'>(isRare ? 'all' : 'new');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'products');
        } catch (e) {
             // Handled
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    if (isRare && !p.isRare) return false;
    if (activeTab === 'new' && p.condition !== 'new') return false;
    if (activeTab === 'pre_owned' && p.condition !== 'pre_owned') return false;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div className="flex items-center justify-between md:hidden">
          <h2 className="text-xl font-bold font-serif">Filters</h2>
          <button><SlidersHorizontal className="w-5 h-5" /></button>
        </div>
        
        <div className="hidden md:block space-y-8 sticky top-24">
          <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filters
          </h2>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Category</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <label className="flex items-center space-x-2"><input type="checkbox" className="rounded text-black focus:ring-black" /> <span>Outerwear</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" className="rounded text-black focus:ring-black" /> <span>Tops & T-Shirts</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" className="rounded text-black focus:ring-black" /> <span>Pants & Denim</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" className="rounded text-black focus:ring-black" /> <span>Footwear</span></label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Size</h3>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', '41', '42', '43'].map(size => (
                <button key={size} className="w-10 h-10 border rounded-lg text-sm font-medium hover:bg-black hover:text-white transition">
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Brand</h3>
             <div className="space-y-2 text-sm text-gray-500">
               <input type="text" placeholder="Search brands..." className="w-full border p-2 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b pb-4 gap-4">
          <div>
            <h1 className="text-4xl font-bold font-serif">
              {isRare ? "Rare & Vintage" : isFavorites ? "My Favorites" : "Marketplace"}
            </h1>
            {!isRare && !isFavorites && (
              <p className="text-gray-500 mt-2">Discover curated pieces from top sellers around the world.</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab==='all' ? 'bg-white shadow' : 'text-gray-500'}`}>All</button>
                <button onClick={() => setActiveTab('new')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab==='new' ? 'bg-white shadow' : 'text-gray-500'}`}>New</button>
                <button onClick={() => setActiveTab('pre_owned')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab==='pre_owned' ? 'bg-white shadow' : 'text-gray-500'}`}>Pre-Owned</button>
             </div>
             <button className="flex items-center space-x-1 text-sm font-medium text-gray-600 border px-3 py-2 rounded-lg hover:bg-gray-50">
               <span>Sort by</span> <ChevronDown className="w-4 h-4" />
             </button>
          </div>
        </div>

        {loading ? (
           <div className="py-20 flex justify-center text-gray-400">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
           <div className="py-20 text-center text-gray-500 border-2 border-dashed rounded-3xl">
              <p className="text-lg">No products found here yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] bg-gray-100 rounded-3xl overflow-hidden">
                  <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1551028719-01c1eb562141?w=800&auto=format&fit=crop&q=60'} alt={product.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                  <button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/50 backdrop-blur hover:bg-white text-gray-900 transition hover:scale-110">
                     <Heart className="w-4 h-4" />
                  </button>
                  {product.isRare && (
                    <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                      Rare
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-gray-500 font-medium">{product.brand || 'Brand'}</p>
                  <h3 className="font-semibold text-gray-900 leading-snug">{product.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-serif font-bold text-lg">${product.price}</p>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">{product.condition === 'new' ? 'New w/tags' : 'Pre-owned'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
