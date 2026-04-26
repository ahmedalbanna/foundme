import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from '@/hooks/useAuthState';
import { Heart, MessageCircle, Share2, ShieldCheck, ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthState();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          navigate('/marketplace');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `products/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleMessageSeller = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Simple chat initialization logic (simplified for MVP)
    // In a full app, we'd check if a chat between these two for this product already exists.
    try {
      const chatQuery = query(
        collection(db, 'chats'),
        where('participantIds', 'array-contains', user.uid),
        where('productId', '==', id)
      );
      const chatSnap = await getDocs(chatQuery);
      
      let chatId;
      if (!chatSnap.empty) {
        chatId = chatSnap.docs[0].id;
      } else {
        const newChat = await addDoc(collection(db, 'chats'), {
          participantIds: [user.uid, product.sellerId],
          productId: id,
          lastMessage: 'Interested in this item',
          updatedAt: serverTimestamp(),
        });
        chatId = newChat.id;
      }
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Loading product details...</div>;
  if (!product) return null;

  return (
    <div className="pb-20 space-y-12">
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-gray-100 rounded-[2rem] overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={product.images[currentImageIdx]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {product.images.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIdx(prev => (prev > 0 ? prev - 1 : product.images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/50 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentImageIdx(prev => (prev < product.images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/50 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {product.isRare && (
              <div className="absolute top-6 left-6 bg-black text-white px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase shadow-xl">
                Rare Find
              </div>
            )}
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {product.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIdx(idx)}
                className={cn(
                  "relative w-24 aspect-square rounded-2xl overflow-hidden border-2 flex-shrink-0 transition",
                  currentImageIdx === idx ? "border-black" : "border-transparent opacity-60"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">{product.brand}</span>
                <div className="flex gap-2">
                  <button className="p-2.5 rounded-full border hover:bg-gray-50 transition"><Heart className="w-5 h-5" /></button>
                  <button className="p-2.5 rounded-full border hover:bg-gray-50 transition"><Share2 className="w-5 h-5" /></button>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold font-serif leading-tight">{product.title}</h1>
            </div>

            <div className="flex items-center gap-6">
              <p className="text-3xl font-bold font-serif">${product.price}</p>
              <span className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold uppercase",
                product.condition === 'new' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              )}>
                {product.condition === 'new' ? 'New with Tags' : 'Pre-owned'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y py-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">Size</p>
              <p className="font-medium text-lg">{product.size || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">Color</p>
              <p className="font-medium text-lg">{product.color || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-black text-white py-5 rounded-full font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-3">
              <ShoppingBag className="w-5 h-5" /> Buy Now
            </button>
            <button 
              onClick={handleMessageSeller}
              className="w-full border-2 border-black text-black py-5 rounded-full font-bold text-lg hover:bg-black hover:text-white transition flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-5 h-5" /> Contact Seller
            </button>
          </div>

          <div className="p-6 bg-gray-50 rounded-3xl border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-bold text-sm">{product.sellerName}</p>
                  <p className="text-xs text-gray-500">Member since 2024</p>
                </div>
              </div>
              <Link to={`/closet/${product.sellerId}`} className="text-xs font-bold uppercase underline tracking-wider">View Closet</Link>
            </div>
            <div className="flex items-center gap-2 py-4 border-t border-gray-200">
               <ShieldCheck className="w-5 h-5 text-gray-900" />
               <p className="text-xs text-gray-500 font-medium">Safe Payment & Authenticity Guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
