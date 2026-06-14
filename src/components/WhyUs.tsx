import { CheckCircle, Tag, Package, Truck, Users } from 'lucide-react';

const features = [
  { icon: CheckCircle, title: "Produk Berkualitas", text: "Dipilih dan disimpan dengan standar tinggi untuk menjaga kesegaran." },
  { icon: Tag, title: "Harga Kompetitif", text: "Harga grosir dan ecer yang membantu keuntungan usaha Anda." },
  { icon: Package, title: "Stok Stabil", text: "Ketersediaan terjaga untuk kebutuhan usaha berkelanjutan." },
  { icon: Truck, title: "Pengiriman Tepat Waktu", text: "Operasional usaha lancar dengan pengiriman terjadwal." },
  { icon: Users, title: "Pelayanan Ramah", text: "Siap membantu konsultasi kebutuhan pasokan usaha Anda." },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Kenapa Memilih Kami?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <feature.icon className="w-10 h-10 text-orange-600 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
