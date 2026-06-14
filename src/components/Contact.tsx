import { Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-12">Siap Menjadi Mitra Pasokan?</h2>
        <div className="flex flex-col md:flex-row justify-center gap-12 mb-12">
          <div className="flex items-center gap-4 justify-center">
            <Phone className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-gray-400">WhatsApp</p>
              <p className="text-xl font-semibold">085859407008</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center">
            <MapPin className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-gray-400">Alamat</p>
              <p className="text-xl font-semibold">Jalan Towo Desa Tempuran Kec Ngawi Kab Ngawi Jawa Timur</p>
            </div>
          </div>
        </div>
        <a href="https://wa.me/6285859407008?text=Halo%20Kak%2C%20saya%20habis%20dari%20website%20Kakak%2C%20ingin%20menanyakan%20terkait%20produk.%20Boleh%20minta%20katalog%20produk%20info%20pembayaran%20%26%20pengiriman" target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-orange-600 text-white rounded-full font-semibold text-lg hover:bg-orange-700 transition">
          Pesan Sekarang via WhatsApp
        </a>
        <div className="mt-12 text-left bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Biaya Tambahan</h3>
            <p>Harga yang tertera di atas belum termasuk biaya jasa:</p>
            <ul className="list-disc ml-5 mt-2">
              <li>Jasa Slice: Rp. 3.000/kg</li>
              <li>Jasa Cincang/Dadu: Rp. 2.000/kg</li>
            </ul>
        </div>
      </div>
    </section>
  );
}
