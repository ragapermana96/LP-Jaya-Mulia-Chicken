import { ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onOpenCart: () => void;
  cartCount: number;
  user: any;
  login: () => void;
  logout: () => void;
}

export default function Navbar({ onOpenCart, cartCount, user, login, logout }: NavbarProps) {
  const menuItems = [
    { label: 'Tentang Kami', href: '#about' },
    { label: 'Katalog Produk', href: '#catalog' },
    { label: 'Info Pemesanan & Pengiriman', href: '#ordering' },
    { label: 'Hubungi Kami', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 border-b border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="text-xl font-bold text-orange-600">Jaya Mulia Chicken</a>
        <div className="hidden md:flex gap-6 items-center">
          {menuItems.map(item => (
            <a key={item.label} href={item.href} className="text-gray-600 hover:text-orange-600 font-medium transition">
              {item.label}
            </a>
          ))}
          <button onClick={onOpenCart} className="text-gray-600 hover:text-orange-600 font-medium transition flex items-center gap-2">
            <ShoppingCart size={20} />
            <motion.span 
              key={cartCount}
              initial={{ scale: 1 }}
              animate={cartCount > 0 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              Keranjang ({cartCount})
            </motion.span>
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">Admin</span>
              <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium transition flex items-center gap-1">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={login} className="text-gray-600 hover:text-orange-600 font-medium transition flex items-center gap-1">
              <User size={20} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
