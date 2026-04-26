import { Link, Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">
              FOUND ME.
            </span>
            <p className="text-sm text-gray-500 mt-2">The AI-Powered Fashion Tech Platform.</p>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link to="/about" className="hover:text-black transition-colors">About</Link>
            <Link to="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} FOUND ME. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
