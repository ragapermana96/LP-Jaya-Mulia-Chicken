import { AlertTriangle, Clock, TrendingDown, Package } from 'lucide-react';

const problems = [
  { icon: Clock, title: "Waktu Terbuang", text: "Kesulitan mencari supplier yang konsisten dan tepat waktu." },
  { icon: TrendingDown, title: "Kualitas Menurun", text: "Kualitas bahan baku yang tidak terjaga mengganggu rasa masakan." },
  { icon: AlertTriangle, title: "Stok Tidak Stabil", text: "Stok sering habis secara mendadak saat dibutuhkan." },
  { icon: Package, title: "Harga Fluktuatif", text: "Kesulitan mendapatkan harga grosir terbaik untuk bahan baku rutin." },
];

export default function Challenges() {
  return (
    <section id="challenges" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Tantangan yang Sering Dihadapi</h2>
        <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl mx-auto">
          Kami memahami kesulitan yang dihadapi pemilik kafe, restoran, rumah makan, katering, hotel, dan dapur besar lainnya.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem) => (
            <div key={problem.title} className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <problem.icon className="w-10 h-10 text-orange-600 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{problem.title}</h3>
              <p className="text-gray-600">{problem.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
