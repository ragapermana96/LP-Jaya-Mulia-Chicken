export default function OrderingInfo() {
  return (
    <section id="ordering" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Info Pemesanan & Pengiriman</h2>
        <div className="text-lg text-gray-700 leading-relaxed bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-xl mb-4 text-orange-600">Cara Pemesanan</h3>
            <p className="mb-6">Pilih produk yang dibutuhkan dari katalog, tekan "Tambah ke Keranjang", dan isi data pemesanan sebelum melakukan checkout melalui WhatsApp.</p>
            
            <h3 className="font-semibold text-xl mb-4 text-orange-600">Info Pengiriman</h3>
            <p>Kami melayani pengiriman di area Ngawi dan sekitarnya. Pesanan yang masuk akan diproses dan dikirim sesuai jadwal operasional kami.</p>
        </div>
      </div>
    </section>
  );
}
