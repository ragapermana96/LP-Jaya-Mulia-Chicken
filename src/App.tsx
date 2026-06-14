import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import Challenges from './components/Challenges';
import Catalog from './components/Catalog';
import OrderingInfo from './components/OrderingInfo';
import WhyUs from './components/WhyUs';
import Contact from './components/Contact';
import CartModal from './components/CartModal';
import Admin from './components/Admin';
import FloatingCartButton from './components/FloatingCartButton';
import { Product, CartItem } from './types';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [name, setName] = useState('');
  const [wa, setWa] = useState('');
  const [address, setAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState<string>('Delivery');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    onAuthStateChanged(auth, setUser);
  }, []);

  const login = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? {...item, quantity: item.quantity + 1} : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.map(item => item.product.id === productId ? {...item, quantity: item.quantity - 1} : item).filter(item => item.quantity > 0));
  };

  const deleteFromCartCompletely = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => item.product.id === productId ? {...item, quantity: Math.max(0.01, quantity)} : item));
  };

  return (
    <main className="font-sans text-gray-900">
      <Navbar onOpenCart={() => setIsCartOpen(true)} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} user={user} login={login} logout={logout} />
      <Hero />
      <AboutUs />
      <Challenges />
      <Catalog addToCart={addToCart} />
      <OrderingInfo />
      <WhyUs />
      <Contact />
      {user && <Admin />}
      <FloatingCartButton count={cart.reduce((sum, item) => sum + item.quantity, 0)} onClick={() => setIsCartOpen(true)} />
      <AnimatePresence>
        {isCartOpen && (
          <CartModal 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            removeFromCart={removeFromCart}
            deleteFromCartCompletely={deleteFromCartCompletely}
            updateCartQuantity={updateCartQuantity}
            addToCart={addToCart}
            name={name}
            setName={setName}
            wa={wa}
            setWa={setWa}
            address={address}
            setAddress={setAddress}
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
