import React, { useState, useEffect, useRef } from 'react';
import { X, ImagePlus, Trash2, Edit2, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface EditProductModalProps {
    product: Product;
    onClose: () => void;
    onSave: (id: string, data: Partial<Product>) => Promise<void>;
    onDelete: (id: string) => Promise<boolean>;
}

export default function EditProductModal({ product, onClose, onSave, onDelete }: EditProductModalProps) {
    const [formData, setFormData] = useState<Product>(product);
    const [uploading, setUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(product);
    }, [product]);

    const handleDeleteClick = async () => {
        setIsDeleting(true);
        try {
            await onDelete(product.id);
        } catch (error) {
            console.error("Error inside handleDeleteClick:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!auth.currentUser) return;
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const file = e.target.files[0];
                const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true, initialQuality: 0.8 };
                
                let fileToUpload: File | Blob = file;
                try {
                    fileToUpload = await imageCompression(file, options);
                } catch (err) {
                    console.warn("Compression failed", err);
                }
                
                const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const storageRef = ref(storage, `products/${fileName}`);
                await uploadBytes(storageRef, fileToUpload);
                const url = await getDownloadURL(storageRef);
                setFormData(prev => ({ ...prev, imageUrl: url }));
            } catch (error) {
                console.error("Error uploading:", error);
                alert("Gagal mengunggah foto.");
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { id, ...data } = formData;
            await onSave(id, data);
            onClose();
        } catch (error) {
            console.error("Error saving:", error);
            alert("Gagal menyimpan perubahan.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 border-b">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Edit Produk</h3>
                        <p className="text-sm text-gray-500">ID: {product.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Image Section */}
                        <div className="lg:col-span-5 flex flex-col gap-4">
                            <div className="relative aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden group border-2 border-dashed border-gray-300">
                                {uploading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                                        <Loader2 className="animate-spin text-orange-600 mb-2" size={32} />
                                        <span className="text-sm font-medium">Mengunggah...</span>
                                    </div>
                                ) : null}
                                
                                {formData.imageUrl ? (
                                    <>
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => fileInputRef.current?.click()} className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition"><Edit2 size={20} /></button>
                                            <button onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} className="bg-white p-3 rounded-full shadow-lg text-red-500 hover:bg-red-50 transition"><Trash2 size={20} /></button>
                                        </div>
                                    </>
                                ) : (
                                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 hover:text-orange-600 transition">
                                        <ImagePlus size={48} className="mb-2" />
                                        <span className="font-medium">Unggah Foto Produk</span>
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-2">
                                <label className="text-sm font-semibold text-gray-700">URL Foto Alternatif</label>
                                <input 
                                    type="text" 
                                    value={formData.imageUrl || ''} 
                                    onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                                    placeholder="https://..."
                                    className="p-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Nama Produk</label>
                                <input 
                                    type="text" 
                                    value={formData.name || ''} 
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Kategori</label>
                                <input 
                                    type="text" 
                                    value={formData.category || ''} 
                                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                                    className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Harga Retail</label>
                                <input 
                                    type="number" 
                                    value={formData.price || 0} 
                                    onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))}
                                    className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Harga Diskon</label>
                                <input 
                                    type="number" 
                                    value={formData.discountPrice || 0} 
                                    onChange={e => setFormData(p => ({ ...p, discountPrice: Number(e.target.value) }))}
                                    className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Harga Grosir</label>
                                <input 
                                    type="number" 
                                    value={formData.bulkPrice || 0} 
                                    onChange={e => setFormData(p => ({ ...p, bulkPrice: Number(e.target.value) }))}
                                    className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Min. Grosir</label>
                                <input 
                                    type="number" 
                                    value={formData.bulkQuantity || 0} 
                                    onChange={e => setFormData(p => ({ ...p, bulkQuantity: Number(e.target.value) }))}
                                    className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Satuan (Unit)</label>
                                <input 
                                    type="text" 
                                    value={formData.unit || ''} 
                                    onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))}
                                    className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Status</label>
                                <select 
                                    value={formData.visible ? 'true' : 'false'}
                                    onChange={e => setFormData(p => ({ ...p, visible: e.target.value === 'true' }))}
                                    className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                >
                                    <option value="true">Tampil (Aktif)</option>
                                    <option value="false">Sembunyi (Draft)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700 text-orange-600">Urutan Tampilan (Sort Order)</label>
                                <input 
                                    type="number" 
                                    value={formData.sortOrder !== undefined && formData.sortOrder !== null ? formData.sortOrder : ''} 
                                    onChange={e => setFormData(p => ({ ...p, sortOrder: e.target.value === '' ? undefined : Number(e.target.value) }))}
                                    className="p-3 border rounded-xl border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none font-semibold text-orange-850"
                                    placeholder="Masukkan angka (0, 1, 2...)"
                                />
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
                                <textarea 
                                    value={formData.description || ''} 
                                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    rows={4}
                                    className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                    placeholder="Masukkan deskripsi produk..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-between gap-4">
                    <button 
                        onClick={handleDeleteClick}
                        disabled={isSaving || isDeleting || uploading}
                        className="px-6 py-2.5 font-semibold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center justify-center gap-2 border border-red-100 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <Loader2 className="animate-spin text-red-600" size={18} />
                        ) : (
                            <Trash2 size={18} />
                        )}
                        {isDeleting ? 'Menghapus...' : 'Hapus Produk'}
                    </button>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving || uploading}
                            className="px-8 py-2.5 font-semibold bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving && <Loader2 className="animate-spin" size={20} />}
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
