'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100';
  };

  return (
    <nav className="bg-white shadow-sm mb-6">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Hospital Claims Management</div>
          
          <div className="flex space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/claims" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/claims')}`}
            >
              Claims
            </Link>
            <Link 
              href="/analytics" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/analytics')}`}
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}