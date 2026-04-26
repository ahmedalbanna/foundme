import React, { useState, useRef } from 'react';
import { ArrowRight, Upload, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

export function VirtualTryOn() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  
  const [base64User, setBase64User] = useState<string | null>(null);
  const [base64Garment, setBase64Garment] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (val: string | null) => void,
    setBase64: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleTryOn = async () => {
    if (!base64User || !base64Garment) return;
    
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64User,
                mimeType: 'image/jpeg',
              },
            },
            {
              inlineData: {
                data: base64Garment,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: 'Virtual try-on: Edit the first image (person) so they are wearing the garment shown in the second image. \n\nCRITICAL CONSTRAINTS:\n- Preserve the person\'s identity, face, body type, and pose exactly as original.\n- Adjust the garment size, perspective, and fit to match the person\'s form naturally.\n- Match the lighting, shadows, and environment of the first image so the clothes look fully integrated and photorealistic.\n- Ensure high quality and cohesive aesthetics.',
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          setResultImage(`data:image/jpeg;base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        throw new Error('Could not generate the image. Please try again with different inputs.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-4">
        <span className="inline-flex items-center space-x-2 bg-fuchsia-100 text-fuchsia-600 rounded-full px-4 py-1.5 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>AI Feature</span>
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold font-serif tracking-tight">Virtual Try-On</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">See how any garment looks on you before buying. Upload a photo of yourself and a photo of the item.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Photo Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">1. Your Photo</h3>
          <div className="relative border-2 border-dashed border-gray-300 rounded-3xl h-80 flex flex-col items-center justify-center bg-gray-50 overflow-hidden group">
            {userImage ? (
              <>
                <img src={userImage} alt="User" className="absolute inset-0 w-full h-full object-cover" />
                <button onClick={() => { setUserImage(null); setBase64User(null); }} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="font-medium text-gray-900">Upload your photo</p>
                <p className="text-sm text-gray-400 mt-1">Full body or waist-up works best</p>
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, setUserImage, setBase64User)} />
              </>
            )}
          </div>
        </div>

        {/* Garment Photo Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">2. The Garment</h3>
          <div className="relative border-2 border-dashed border-gray-300 rounded-3xl h-80 flex flex-col items-center justify-center bg-gray-50 overflow-hidden group">
            {garmentImage ? (
              <>
                <img src={garmentImage} alt="Garment" className="absolute inset-0 w-full h-full object-contain bg-white" />
                <button onClick={() => { setGarmentImage(null); setBase64Garment(null); }} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="font-medium text-gray-900">Upload garment</p>
                <p className="text-sm text-gray-400 mt-1">Clear photo of the clothing item</p>
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, setGarmentImage, setBase64Garment)} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center flex-col items-center gap-4">
         {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm max-w-lg text-center">
              {error}
            </div>
         )}
        <button
          onClick={handleTryOn}
          disabled={!userImage || !garmentImage || loading}
          className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 w-full max-w-xs justify-center"
        >
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}>
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>Generate Try-On</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {resultImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-8 border-t"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold font-serif">Your AI Generated Look</h3>
            </div>
            <div className="max-w-md mx-auto aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 shadow-xl border">
              <img src={resultImage} alt="Generated Try-On" className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-center mt-8 space-x-4">
              <button className="px-6 py-3 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition">
                Save Look
              </button>
              <button className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition">
                Add to Cart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
