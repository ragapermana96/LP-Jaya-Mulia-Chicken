import { useState, useEffect } from 'react';
import { ShoppingCart, LayoutGrid, LayoutList, X, ZoomIn } from 'lucide-react';
import { Product } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface CatalogProps {
    addToCart: (product: Product) => void;
}

export default function Catalog({ addToCart }: CatalogProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
    const [products, setProducts] = useState<Product[]>([]);
    const [layout, setLayout] = useState<'grid' | 'list'>(() => {
        const saved = localStorage.getItem('catalogLayout');
        return (saved === 'list' ? 'list' : 'grid');
    });
    const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            // Sort by sortOrder ascending, then alphabetically by name.
            // Undefined or null sortOrder defaults to 9999 so those products land at the end.
            const sortedData = [...productsData].sort((a, b) => {
                const aOrder = a.sortOrder !== undefined && a.sortOrder !== null ? a.sortOrder : 9999;
                const bOrder = b.sortOrder !== undefined && b.sortOrder !== null ? b.sortOrder : 9999;
                if (aOrder !== bOrder) {
                    return aOrder - bOrder;
                }
                return a.name.localeCompare(b.name);
            });
            setProducts(sortedData);
        });
        return unsubscribe;
    }, []);

    const handleLayoutChange = (newLayout: 'grid' | 'list') => {
        setLayout(newLayout);
        localStorage.setItem('catalogLayout', newLayout);
    };

    const categories = ['Semua', ...Array.from(new Set(products.map(p => p.category)))];

    const filteredProducts = (selectedCategory === 'Semua' 
        ? products 
        : products.filter(p => p.category === selectedCategory)).filter(p => p.visible);

    return (
        <section id="catalog" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-bold text-gray-900">Katalog Produk</h2>
                        <p className="text-gray-500 mt-2 text-sm">Temukan berbagai bahan makanan kualitas premium favorit Anda.</p>
                    </div>
                    {/* Layout Controls */}
                    <div className="flex items-center justify-center gap-2 self-center">
                        <span className="text-xs font-semibold text-gray-500 mr-2">Tampilan:</span>
                        <div className="bg-white p-1 rounded-xl border border-gray-200 flex gap-1 shadow-sm">
                            <button
                                onClick={() => handleLayoutChange('grid')}
                                className={`p-2 rounded-lg transition ${layout === 'grid' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                                title="Tampilan Kotak (Grid)"
                                id="btn-layout-grid"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => handleLayoutChange('list')}
                                className={`p-2 rounded-lg transition ${layout === 'list' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                                title="Tampilan Daftar (List)"
                                id="btn-layout-list"
                            >
                                <LayoutList size={18} />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-center gap-4 mb-12 flex-wrap">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-full font-semibold transition ${selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-500 hover:bg-orange-50/20'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {layout === 'grid' ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition duration-300">
                                <div 
                                    className="relative w-full aspect-[4/3] bg-gray-50/50 overflow-hidden cursor-pointer flex items-center justify-center border-b border-gray-100 group-hover:bg-gray-100/30 transition-colors"
                                    onClick={() => setActiveImageUrl(product.imageUrl || 'https://via.placeholder.com/150')}
                                    title="Klik untuk memperbesar foto"
                                >
                                    <img 
                                        src={product.imageUrl || 'https://via.placeholder.com/150'} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" 
                                        referrerPolicy="no-referrer" 
                                    />
                                    <div className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                                        <ZoomIn size={14} />
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-orange-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 sm:bottom-3 sm:right-3">
                                        <ZoomIn size={10} className="flex-shrink-0" /> Perbesar
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <span className="text-sm text-orange-600 font-semibold">{product.category}</span>
                                        <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2 line-clamp-2">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description || 'Tidak ada deskripsi produk.'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        {product.discountPrice && (
                                            <span className="text-sm text-gray-500 line-through">RP {product.price.toLocaleString('id-ID')}</span>
                                        )}
                                        <span className="text-lg font-semibold text-gray-900">
                                            RP {(product.discountPrice || product.price).toLocaleString('id-ID')} / {product.unit}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 pt-0">
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-full bg-orange-100 text-orange-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-200 transition"
                                    >
                                        <ShoppingCart size={20} />
                                        Tambah ke Keranjang
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row items-center p-5 gap-6 hover:shadow-md transition duration-300">
                                <div 
                                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50/50 cursor-pointer flex items-center justify-center p-1.5 flex-shrink-0 border border-gray-100/80 hover:bg-gray-100/30 transition group/item"
                                    onClick={() => setActiveImageUrl(product.imageUrl || 'https://via.placeholder.com/150')}
                                    title="Klik untuk memperbesar foto"
                                >
                                    <img 
                                        src={product.imageUrl || 'https://via.placeholder.com/150'} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover/item:scale-105" 
                                        referrerPolicy="no-referrer" 
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/40 text-[9px] text-white py-0.5 text-center font-semibold opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        Perbesar
                                    </div>
                                </div>
                                <div className="flex-grow text-center sm:text-left">
                                    <span className="text-xs text-orange-600 font-semibold uppercase tracking-wider">{product.category}</span>
                                    <h3 className="text-lg font-bold text-gray-900 mt-1">{product.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1.5 max-w-2xl">{product.description || 'Tidak ada deskripsi produk.'}</p>
                                </div>
                                <div className="flex flex-col items-center sm:items-end justify-center min-w-[200px] gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto">
                                    <div className="text-center sm:text-right">
                                        {product.discountPrice && (
                                            <span className="text-xs text-gray-400 line-through block">RP {product.price.toLocaleString('id-ID')}</span>
                                        )}
                                        <span className="text-lg font-bold text-gray-900">
                                            RP {(product.discountPrice || product.price).toLocaleString('id-ID')} / {product.unit}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition text-sm w-full sm:w-auto justify-center"
                                    >
                                        <ShoppingCart size={16} />
                                        Masukkan Keranjang
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal for Product Pictures */}
            {activeImageUrl && (
                <div 
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300"
                    onClick={() => setActiveImageUrl(null)}
                >
                    {/* Top action header for close */}
                    <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
                        <button 
                            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all duration-200 shadow-md backdrop-blur-sm"
                            onClick={() => setActiveImageUrl(null)}
                            title="Tutup Preview"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div 
                        className="relative max-w-3xl max-h-[80vh] w-full flex flex-col items-center justify-center p-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white rounded-2xl p-4 shadow-2xl relative max-w-full max-h-[75vh] flex items-center justify-center overflow-hidden">
                            <img 
                                src={activeImageUrl} 
                                alt="Pratinjau Produk" 
                                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-sm"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <p className="text-white/80 text-xs sm:text-sm font-medium mt-4 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm text-center">
                            Ketuk di mana saja di luar untuk menutup kembali
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
