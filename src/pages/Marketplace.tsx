import { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, ChevronDown, Heart } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

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
      <div className={cn("flex-1 space-y-6 transition-colors duration-500", isRare && "bg-neutral-950 -mx-4 px-4 py-8 rounded-[2.5rem] text-white")}>
        <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between border-b pb-4 gap-4", isRare ? "border-white/10" : "border-gray-100")}>
          <div>
            <h1 className={cn("text-4xl font-bold font-serif", isRare && "text-white")}>
              {isRare ? (
                <span className="flex items-center gap-3">
                  <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-black uppercase tracking-[0.2em]">Elite</span>
                  Rare & Vintage
                </span>
              ) : isFavorites ? "My Favorites" : "Marketplace"}
            </h1>
            {isRare ? (
              <p className="text-gray-400 mt-2">Authenticated heritage pieces and limited edition grails.</p>
            ) : !isFavorites && (
              <p className="text-gray-500 mt-2">Discover curated pieces from top sellers around the world.</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
             <div className={cn("p-1 rounded-lg inline-flex", isRare ? "bg-white/5" : "bg-gray-100")}>
                <button onClick={() => setActiveTab('all')} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition", activeTab==='all' ? (isRare ? "bg-white text-black" : "bg-white shadow") : "text-gray-500")}>All</button>
                <button onClick={() => setActiveTab('new')} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition", activeTab==='new' ? (isRare ? "bg-white text-black" : "bg-white shadow") : "text-gray-500")}>New</button>
                <button onClick={() => setActiveTab('pre_owned')} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition", activeTab==='pre_owned' ? (isRare ? "bg-white text-black" : "bg-white shadow") : "text-gray-500")}>Pre-Owned</button>
             </div>
          </div>
        </div>

        {loading ? (
           <div className="py-20 flex justify-center text-gray-400">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
           <div className={cn("py-20 text-center rounded-3xl border-2 border-dashed", isRare ? "border-white/10 text-white/40" : "border-gray-100 text-gray-500")}>
              <p className="text-lg">No products found here yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {filteredProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                <div className={cn("relative aspect-[3/4] rounded-3xl overflow-hidden", isRare ? "bg-white/5 ring-1 ring-white/10" : "bg-gray-100")}>
                  <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className={cn("absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition hover:scale-110", isRare ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/50 text-gray-900 hover:bg-white")}>
                     <Heart className="w-4 h-4" />
                  </button>
                  {product.isRare && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <div className="bg-black/80 backdrop-blur text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-widest">
                        Rare Certified
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-1">
                  <p className={cn("text-xs font-bold uppercase tracking-wider", isRare ? "text-white/40" : "text-gray-500")}>{product.brand || 'Brand'}</p>
                  <h3 className={cn("font-medium text-lg leading-snug truncate", isRare ? "text-white group-hover:text-white/80" : "text-gray-900 group-hover:text-black")}>{product.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className={cn("font-serif font-black text-xl", isRare ? "text-white" : "text-gray-900")}>${product.price}</p>
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isRare ? "text-white/30" : "text-gray-400")}>{product.condition === 'new' ? 'Mint' : 'Heritage'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
