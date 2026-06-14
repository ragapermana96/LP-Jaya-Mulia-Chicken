import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product } from '../types';

interface ProductRowProps {
    key?: string | number;
    product: Product;
    selected: boolean;
    onSelect: (id: string, selected: boolean) => void;
    onEdit: (product: Product) => void;
    updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<boolean>;
}

export default function ProductRow({ product, selected, onSelect, onEdit, updateProduct, deleteProduct }: ProductRowProps) {
    const [data, setData] = useState(product);
    const [isUploading, setIsUploading] = useState(false);
    const [loadingAction, setLoadingAction] = useState<'none' | 'save' | 'delete' | 'visibility'>('none');
    const prevProductRef = useRef(product);

    useEffect(() => {
        const hasDbUpdated = JSON.stringify(prevProductRef.current) !== JSON.stringify(product);
        if (hasDbUpdated) {
            const hasLocalEdits = JSON.stringify(data) !== JSON.stringify(prevProductRef.current);
            if (!hasLocalEdits) {
                setData(product);
            }
            prevProductRef.current = product;
        }
    }, [product, data]);

    const isDirty = JSON.stringify(data) !== JSON.stringify(product);

    const handleSave = async () => {
        setLoadingAction('save');
        try {
            const { id, ...dataToSend } = data;
            await updateProduct(id, dataToSend);
        } finally {
            setLoadingAction('none');
        }
    };

    const handleDelete = async () => {
        setLoadingAction('delete');
        try {
            await deleteProduct(data.id);
        } finally {
            setLoadingAction('none');
        }
    };

    const handleToggleVisibility = async () => {
        setLoadingAction('visibility');
        try {
            await updateProduct(data.id, { visible: !data.visible });
        } finally {
            setLoadingAction('none');
        }
    };

    return (
        <tr className={`border-b hover:bg-gray-50 transition ${selected ? 'bg-orange-50/50' : ''}`}>
            <td className="p-3">
                <input 
                    type="checkbox" 
                    checked={selected} 
                    onChange={(e) => onSelect(product.id, e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
            </td>
            <td className="p-3">
                <input type="file" className="hidden" id={`file-${data.id}`} onChange={async (e) => {
                    if (!auth.currentUser) {
                        alert('Silakan login terlebih dahulu untuk mengunggah foto.');
                        return;
                    }
                    if (e.target.files && e.target.files[0]) {
                        setIsUploading(true);
                        try {
                            const file = e.target.files[0];
                            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true, initialQuality: 0.8 };
                            
                            let fileToUpload: File | Blob = file;
                            try {
                                fileToUpload = await imageCompression(file, options);
                            } catch (e) {
                                console.warn("Compression failed", e);
                            }
                            
                            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                            const storageRef = ref(storage, `products/${fileName}`);
                            const snapshot = await uploadBytes(storageRef, fileToUpload);
                            const url = await getDownloadURL(snapshot.ref);
                            await updateProduct(data.id, { imageUrl: url });
                            setData({...data, imageUrl: url});
                        } catch (error: any) {
                            console.error("Error individual upload: ", error);
                            alert("Gagal mengunggah foto. Pastikan Anda sudah Login.\n\nDetail: " + (error.message || "Unknown error"));
                        } finally {
                            setIsUploading(false);
                        }
                    }
                }} />
                <div className="flex flex-col gap-1">
                    {data.imageUrl ? (
                        <div className="relative group">
                            <img src={data.imageUrl} alt={data.name} className={`w-12 h-12 object-cover rounded cursor-pointer ${isUploading ? 'opacity-50' : ''}`} referrerPolicy="no-referrer" onClick={() => document.getElementById(`file-${data.id}`)?.click()} title="Klik untuk ganti foto" />
                            {isUploading && <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded"><div className="w-4 h-4 border-2 border-white animate-spin rounded-full border-t-transparent"></div></div>}
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded cursor-pointer flex items-center justify-center text-gray-400" onClick={() => document.getElementById(`file-${data.id}`)?.click()}>
                            {isUploading ? <div className="w-4 h-4 border-2 border-orange-500 animate-spin rounded-full border-t-transparent"></div> : '+'}
                        </div>
                    )}
                    <button 
                        onClick={() => {
                            const newUrl = prompt("Masukkan URL Foto Baru:", data.imageUrl);
                            if (newUrl !== null) {
                                setData({...data, imageUrl: newUrl});
                                updateProduct(data.id, { imageUrl: newUrl });
                            }
                        }}
                        className="text-[10px] text-blue-600 hover:underline text-center"
                    >
                        Edit URL
                    </button>
                </div>
            </td>
            <td className="p-3 font-medium">
                <button 
                    onClick={() => onEdit(product)}
                    className="text-left hover:text-orange-600 hover:underline transition font-semibold"
                >
                    {data.name}
                </button>
            </td>
            <td className="p-3">
                <input 
                    type="number" 
                    value={data.sortOrder !== undefined && data.sortOrder !== null ? data.sortOrder : ''} 
                    placeholder="Auto" 
                    className="w-20 p-1.5 border rounded-lg text-center font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none" 
                    onChange={e => setData({...data, sortOrder: e.target.value === '' ? undefined : Number(e.target.value)})} 
                />
            </td>
            <td className="p-3"><input type="number" value={data.price || 0} className="w-24 p-1 border rounded" onChange={e => setData({...data, price: Number(e.target.value)})} /></td>
            <td className="p-3"><input type="text" value={data.unit || ''} className="w-24 p-1 border rounded" onChange={e => setData({...data, unit: e.target.value})} /></td>
            <td className="p-3"><input type="number" value={data.discountPrice || 0} className="w-24 p-1 border rounded" onChange={e => setData({...data, discountPrice: Number(e.target.value)})} /></td>
            <td className="p-3"><input type="number" value={data.bulkPrice || 0} className="w-24 p-1 border rounded" onChange={e => setData({...data, bulkPrice: Number(e.target.value)})} /></td>
            <td className="p-3"><input type="number" value={data.bulkQuantity || 0} className="w-24 p-1 border rounded" onChange={e => setData({...data, bulkQuantity: Number(e.target.value)})} /></td>
            <td className="p-3">
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <button 
                        onClick={handleSave} 
                        disabled={loadingAction !== 'none'}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50 min-w-[60px]"
                    >
                        {loadingAction === 'save' ? '...' : 'Simpan'}
                    </button>
                    {isDirty && (
                        <button 
                            onClick={() => {
                                setData(product);
                                prevProductRef.current = product;
                            }}
                            disabled={loadingAction !== 'none'}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50 min-w-[60px]"
                        >
                            Batal
                        </button>
                    )}
                    <button 
                        onClick={handleToggleVisibility}
                        disabled={loadingAction !== 'none'}
                        className={`${!data.visible ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-amber-500 hover:bg-amber-600'} text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50 min-w-[80px]`}
                    >
                        {loadingAction === 'visibility' ? '...' : (data.visible ? "Sembunyikan" : "Tampilkan")}
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={loadingAction !== 'none'}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50 min-w-[60px]"
                    >
                        {loadingAction === 'delete' ? '...' : 'Hapus'}
                    </button>
                </div>
            </td>
        </tr>
    );
}
