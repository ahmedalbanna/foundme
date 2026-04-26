import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function Home() {
  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gray-900 text-white min-h-[600px] flex items-center">
        {/* Placeholder background (normally an image of fashion) */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550614000-4b95d4ed6bfc?auto=format&fit=crop&q=80')] opacity-30 bg-cover bg-center mix-blend-luminosity z-0"></div>
        
        <div className="relative z-10 max-w-2xl px-8 sm:px-16 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-md border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI-Powered Fashion Discovery</span>
            </span>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] font-serif">
              Discover. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">Match.</span> <br />
              Wear.
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-xl text-gray-300">
            A premium marketplace to buy, sell, and virtually try on the best fashion finds with the power of Artificial Intelligence.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-wrap gap-4 pt-4">
            <Link to="/marketplace" className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition flex items-center space-x-2">
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/try-on" className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-full font-medium hover:bg-white/20 transition">
              Virtual Try-On
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col items-start space-y-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 flex items-center justify-center text-fuchsia-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif">Virtual Try-On</h3>
          <p className="text-gray-500 flex-1">Upload your photo and a garment to see how it looks on you instantly before buying.</p>
          <Link to="/try-on" className="text-black font-medium inline-flex items-center hover:underline">
            Try it out <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col items-start space-y-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <StarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif">Celebrity Looks</h3>
          <p className="text-gray-500 flex-1">Found a look you love? Upload it and our AI will find the closest matches in our marketplace.</p>
          <Link to="/celebrity-looks" className="text-black font-medium inline-flex items-center hover:underline">
            Match a Look <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="bg-black p-8 rounded-3xl shadow-sm flex flex-col items-start space-y-4 text-white hover:scale-[1.02] transition transform origin-bottom">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif flex items-center gap-2">Rare Finds <span className="bg-white/20 text-xs px-2 py-1 rounded">VINTAGE</span></h3>
          <p className="text-gray-400 flex-1">Exclusive, authenticated vintage pieces and rare streetwear you won't find anywhere else.</p>
          <Link to="/marketplace?rare=true" className="text-white font-medium inline-flex items-center hover:underline">
            Shop Rare <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>

      {/* Quick Add / Trending placeholder */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-bold font-serif">Trending Now</h2>
          <Link to="/marketplace" className="text-sm font-medium hover:underline flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Skeleton placeholders for actual items fetched from DB */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group cursor-pointer group space-y-3">
              <div className="aspect-[3/4] bg-gray-200 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Premium Brand</p>
                <p className="font-medium">Vintage Leather Jacket</p>
                <p className="font-bold font-serif mt-1">$250</p>
              </div>
            </div>
          ))}
        </div>
      </section>
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
