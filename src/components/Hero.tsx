import { ArrowRight, Phone, CheckCircle, Truck, Clock, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1605909618195-2079043232d9?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-20"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Jaya Mulia Chicken
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto">
          Supplier Bahan Makanan Segar & Frozen Berkualitas untuk Kebutuhan Rumah Tangga, UMKM, Katering, Restoran, dan Industri Kuliner.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#catalog" className="px-8 py-4 bg-orange-600 text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-orange-700 transition">
            Lihat Katalog Produk <ArrowRight size={20} />
          </a>
          <a href="https://wa.me/6285859407008?text=Halo%20Kak%2C%20saya%20habis%20dari%20website%20Kakak%2C%20ingin%20menanyakan%20terkait%20produk.%20Boleh%20minta%20katalog%20produk%20info%20pembayaran%20%26%20pengiriman" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-100 transition">
            Hubungi Kami via WhatsApp <Phone size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
