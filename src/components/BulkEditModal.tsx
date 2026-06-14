import React, { useState } from 'react';
import { X, Loader2, Info } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface BulkEditModalProps {
    selectedCount: number;
    onClose: () => void;
    onApply: (data: Partial<Product>) => Promise<void>;
}

export default function BulkEditModal({ selectedCount, onClose, onApply }: BulkEditModalProps) {
    const [isApplying, setIsApplying] = useState(false);
    const [fields, setFields] = useState({
        category: '',
        price: '',
        unit: '',
        visible: '',
    });
    
    // We only apply fields that are not empty
    const handleApply = async () => {
        setIsApplying(true);
        try {
            const updates: any = {};
            if (fields.category) updates.category = fields.category;
            if (fields.price) updates.price = Number(fields.price);
            if (fields.unit) updates.unit = fields.unit;
            if (fields.visible !== '') updates.visible = fields.visible === 'true';
            
            if (Object.keys(updates).length === 0) {
                alert("Pilih setidaknya satu kolom untuk diubah.");
                setIsApplying(false);
                return;
            }
            
            await onApply(updates);
            onClose();
        } catch (error) {
            console.error("Error applying bulk updates:", error);
            alert("Gagal menerapkan perubahan massal.");
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                <div className="px-8 py-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">Edit Massal ({selectedCount} Produk)</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
                </div>
                
                <div className="p-8 flex flex-col gap-6">
                    <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 text-blue-700 text-sm">
                        <Info size={20} className="shrink-0" />
                        <p>Kosongkan kolom yang tidak ingin diubah. Perubahan akan diterapkan ke semua produk terpilih.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Ubah Kategori</label>
                            <input 
                                type="text" 
                                placeholder="Biarkan kosong jika tidak diubah"
                                value={fields.category}
                                onChange={e => setFields(f => ({ ...f, category: e.target.value }))}
                                className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Ubah Harga</label>
                            <input 
                                type="number" 
                                placeholder="Biarkan kosong jika tidak diubah"
                                value={fields.price}
                                onChange={e => setFields(f => ({ ...f, price: e.target.value }))}
                                className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Ubah Satuan (Unit)</label>
                            <input 
                                type="text" 
                                placeholder="Biarkan kosong jika tidak diubah"
                                value={fields.unit}
                                onChange={e => setFields(f => ({ ...f, unit: e.target.value }))}
                                className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Ubah Status</label>
                            <select 
                                value={fields.visible}
                                onChange={e => setFields(f => ({ ...f, visible: e.target.value }))}
                                className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option value="">Tetap seperti aslinya</option>
                                <option value="true">Tampilkan Semua</option>
                                <option value="false">Sembunyikan Semua</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition">Batal</button>
                    <button 
                        onClick={handleApply}
                        disabled={isApplying}
                        className="px-8 py-2.5 font-bold bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {isApplying && <Loader2 className="animate-spin" size={20} />}
                        Terapkan ke {selectedCount} Produk
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
