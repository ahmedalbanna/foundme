import { useState } from 'react';
import { Upload, Sparkles, X, ArrowRight, ScanSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';

export function CelebrityLooks() {
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setBase64Image(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!base64Image) return;
    
    setLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: 'Analyze this fashion look. Identify the main clothing pieces, their prominent colors, the overall style/vibe, and provide a search query to find similar items.' }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              styleDescription: { type: Type.STRING, description: "One sentence describing the overall aesthetic and vibe." },
              garments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "Type of garment (e.g. Jacket, T-shirt, Jeans)" },
                    color: { type: Type.STRING, description: "Main color of the garment" },
                    searchQuery: { type: Type.STRING, description: "Optimized keyword phrase to search in a fashion store" }
                  }
                }
              }
            },
            required: ["styleDescription", "garments"]
          }
        }
      });
      
      const textResponse = response.text;
      if (textResponse) {
        setExtractedData(JSON.parse(textResponse.trim()));
      }
    } catch (err: any) {
      console.error(err);
      setError("We couldn't analyze the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-4">
        <span className="inline-flex items-center space-x-2 bg-blue-100 text-blue-600 rounded-full px-4 py-1.5 text-sm font-medium">
          <StarIcon className="w-4 h-4" />
          <span>Shop The Look</span>
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold font-serif tracking-tight">Celebrity Looks</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Upload an outfit you love, and our AI will break down the style and find the closest matches in our marketplace.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row gap-12">
        <div className="md:w-1/2 space-y-6">
          <div className="relative border-2 border-dashed border-gray-300 rounded-3xl h-96 flex flex-col items-center justify-center bg-gray-50 overflow-hidden group">
            {image ? (
              <>
                <img src={image} alt="Look" className="absolute inset-0 w-full h-full object-cover" />
                <button onClick={() => { setImage(null); setBase64Image(null); setExtractedData(null); }} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="font-medium text-gray-900 text-lg">Upload Inspiration</p>
                <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">Drag and drop or click to upload a photo of an outfit</p>
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} />
              </>
            )}
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            className="w-full bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}>
                   <ScanSearch className="w-5 h-5" />
                </motion.div>
                <span>Analyzing style...</span>
              </>
            ) : (
              <>
                <span>Find Matches</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>

        <div className="md:w-1/2">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-4 text-gray-400">
               <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                 <div className="w-24 h-24 border-4 border-gray-100 border-t-purple-500 rounded-full animate-spin"></div>
               </motion.div>
               <p className="font-medium text-gray-600">AI is extracting garments...</p>
             </div>
          ) : extractedData ? (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
               <div>
                  <h3 className="text-xl font-bold font-serif mb-2">Style Breakdown</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-2xl italic">"{extractedData.styleDescription}"</p>
               </div>

               <div className="space-y-6">
                 <h3 className="text-xl font-bold font-serif">Found in Marketplace</h3>
                 <div className="space-y-4">
                   {extractedData.garments.map((garment: any, idx: number) => (
                     <div key={idx} className="flex gap-4 p-4 border rounded-2xl hover:border-gray-400 transition bg-white">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                          {/* Placeholder image for a matched product */}
                          <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{garment.color} {garment.type}</p>
                              <h4 className="font-medium leading-tight">{garment.searchQuery}</h4>
                            </div>
                            <span className="font-serif font-bold pt-1">$--</span>
                          </div>
                          <button className="text-sm font-medium hover:underline mt-4">Shop Similar</button>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-gray-400 border-2 border-dashed border-transparent rounded-3xl bg-gray-50/50">
               <ScanSearch className="w-12 h-12" />
               <p>Upload a photo to see matching products</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return <ShoppingBag className={className} />
}
