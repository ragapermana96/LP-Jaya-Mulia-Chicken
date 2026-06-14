import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingCartButtonProps {
  count: number;
  onClick: () => void;
}

export default function FloatingCartButton({ count, onClick }: FloatingCartButtonProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className="fixed bottom-6 right-6 z-50 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-colors flex items-center justify-center group"
          id="floating-cart"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-orange-600">
              {count}
            </span>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap font-semibold">
            Lihat Keranjang
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
