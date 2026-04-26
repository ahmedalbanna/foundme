import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from '@/hooks/useAuthState';
import { Upload, X, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AddProduct() {
  const { user } = useAuthState();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'new' as 'new' | 'pre_owned',
    size: '',
    brand: '',
    color: '',
    category: 'Outerwear',
    isRare: false,
  });

  const categories = ['Outerwear', 'Tops', 'Pants', 'Footwear', 'Accessories', 'Vintage'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file as Blob));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload images to Storage
      const imageUrls = await Promise.all(
        images.map(async (file) => {
          const imageRef = ref(storage, `products/${user.uid}/${Date.now()}-${file.name}`);
          await uploadBytes(imageRef, file);
          return getDownloadURL(imageRef);
        })
      );

      // 2. Save to Firestore
      const productData = {
        sellerId: user.uid,
        sellerName: user.displayName || 'Anonymous',
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        condition: formData.condition,
        size: formData.size,
        brand: formData.brand,
        color: formData.color,
        categoryName: formData.category,
        images: imageUrls,
        status: 'active',
        isRare: formData.isRare,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      navigate(`/product/${docRef.id}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'products');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Please sign in to add products.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-serif mb-2">Create New Listing</h1>
        <p className="text-gray-500">Share your style with the world. Set your price and details.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Column: Images */}
        <div className="md:col-span-1 space-y-4">
          <label className="block text-sm font-semibold uppercase tracking-wider text-gray-400">
            Photos ({previews.length}/5)
          </label>
          <div className="grid grid-cols-2 gap-4">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border bg-gray-50">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition group">
                <Upload className="w-6 h-6 text-gray-400 group-hover:scale-110 transition" />
                <span className="text-xs text-gray-400 mt-2">Add Photo</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">First photo will be the main display image.</p>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Vintage Leather Jacket"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the item, its condition, and fit..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
                <option value="new">New with tags</option>
                <option value="pre_owned">Pre-owned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <input
                type="text"
                value={formData.size}
                onChange={e => setFormData({ ...formData, size: e.target.value })}
                placeholder="XL, 42, etc."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border">
            <input
              type="checkbox"
              id="isRare"
              checked={formData.isRare}
              onChange={e => setFormData({ ...formData, isRare: e.target.checked })}
              className="w-5 h-5 rounded text-black focus:ring-black border-gray-300"
            />
            <label htmlFor="isRare" className="flex items-center space-x-2 cursor-pointer">
              <span className="font-medium text-gray-900">Mark as Rare / Vintage</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <span>List Item Now</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
