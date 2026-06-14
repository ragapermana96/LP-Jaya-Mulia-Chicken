import imageCompression from 'browser-image-compression';
import React, { useState, useEffect, useRef } from 'react';
import { auth, db, storage } from '../lib/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product } from '../types';
import { Trash2, ImagePlus, Edit2, CheckSquare, Square, Inbox, X, Loader2, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import ProductRow from './ProductRow';
import EditProductModal from './EditProductModal';
import BulkEditModal from './BulkEditModal';
import { AnimatePresence, motion } from 'motion/react';

export default function Admin() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'loading' | 'info';
        visible: boolean;
    }>({ message: '', type: 'info', visible: false });

    const showToast = (message: string, type: 'success' | 'error' | 'loading' | 'info', duration = 3000) => {
        setToast({ message, type, visible: true });
        if (type !== 'loading') {
            setTimeout(() => {
                setToast(prev => prev.message === message ? { ...prev, visible: false } : prev);
            }, duration);
        }
    };
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [price, setPrice] = useState(0);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [bulkPrice, setBulkPrice] = useState(0);
    const [bulkQuantity, setBulkQuantity] = useState(0);
    const [unit, setUnit] = useState('Kg/Pcs');
    const [sortOrder, setSortOrder] = useState<number | undefined>(undefined);
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [isBlinking, setIsBlinking] = useState(false);
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'manage' | 'add'>('manage');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerFileSelect = () => {
        setIsBlinking(true);
        fileInputRef.current?.click();
        setTimeout(() => setIsBlinking(false), 1000);
    }

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            const sorted = [...data].sort((a, b) => {
                const aOrder = a.sortOrder !== undefined && a.sortOrder !== null ? a.sortOrder : 9999;
                const bOrder = b.sortOrder !== undefined && b.sortOrder !== null ? b.sortOrder : 9999;
                if (aOrder !== bOrder) return aOrder - bOrder;
                return a.name.localeCompare(b.name);
            });
            setProducts(sorted);
        });
        return unsubscribe;
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!auth.currentUser) {
            alert('Silakan login terlebih dahulu untuk mengunggah foto.');
            return;
        }
        if (e.target.files && e.target.files[0]) {
            setUploading('uploading');
            try {
                const file = e.target.files[0];
                console.log("Original file size:", file.size / 1024, "KB");
                
                const options = {
                    maxSizeMB: 0.5, // Increase limit slightly for compatibility
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                    initialQuality: 0.8,
                };
                
                let fileToUpload: File | Blob = file;
                try {
                    fileToUpload = await imageCompression(file, options);
                    console.log("Compressed file size:", fileToUpload.size / 1024, "KB");
                } catch (compErr) {
                    console.warn("Compression failed, uploading original:", compErr);
                }
                
                const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const storageRef = ref(storage, `products/${fileName}`);
                const snapshot = await uploadBytes(storageRef, fileToUpload);
                const url = await getDownloadURL(snapshot.ref);
                setImageUrl(url);
                setUploading('success');
            } catch (error: any) {
                console.error("Full error object:", error);
                let errorMsg = "Terjadi kesalahan saat mengunggah gambar.";
                if (error.code === 'storage/unauthorized') {
                    errorMsg = "Gagal mengunggah: Izin ditolak. Pastikan Anda sudah Login.";
                } else if (error.code === 'storage/quota-exceeded') {
                    errorMsg = "Gagal mengunggah: Kuota penyimpanan habis.";
                } else if (error.name === 'AbortError') {
                    errorMsg = "Upload dibatalkan.";
                }
                setUploading('error');
                alert(errorMsg + "\n\nSaran: Jika terus gagal, silakan gunakan opsi 'Tempel URL Foto' di bawah.\n\nDetail: " + (error.message || "Unknown error"));
            }
        }
    };

    const addProduct = async () => {
        if (!auth.currentUser) {
            showToast('Anda harus masuk akun untuk menambah produk.', 'error');
            return;
        }
        showToast('Sedang menambahkan produk...', 'loading');
        try {
            const prodData: any = {
                name, 
                category, 
                price: Number(price), 
                discountPrice: Number(discountPrice), 
                bulkPrice: Number(bulkPrice), 
                bulkQuantity: Number(bulkQuantity), 
                unit, 
                imageUrl, 
                description, 
                visible: true
            };
            if (sortOrder !== undefined && sortOrder !== null) {
                prodData.sortOrder = Number(sortOrder);
            }
            await addDoc(collection(db, 'products'), prodData);
            showToast('Produk berhasil ditambahkan!', 'success');
            setName(''); setCategory(''); setIsNewCategory(false); setPrice(0); setDiscountPrice(0); setBulkPrice(0); setBulkQuantity(0); setUnit('Kg/Pcs'); setImageUrl(''); setDescription(''); setSortOrder(undefined);
        } catch (error: any) {
            console.error("Error adding product:", error);
            showToast("Gagal menambahkan produk: " + (error.message || "Unknown error"), 'error');
        }
    };

    const updateProduct = async (id: string, updatedData: Partial<Product>) => {
        if (!auth.currentUser) {
            showToast('Anda harus masuk akun untuk mengubah produk.', 'error');
            return;
        }
        showToast('Sedang menyimpan perubahan produk...', 'loading');
        try {
            await updateDoc(doc(db, 'products', id), updatedData);
            showToast('Produk berhasil diperbarui!', 'success');
        } catch (error: any) {
            console.error("Error updating product:", error);
            showToast("Gagal memperbarui produk: " + (error.message || "Unknown error"), 'error');
        }
    };

    const deleteProduct = async (id: string): Promise<boolean> => {
        if (!auth.currentUser) {
            showToast('Anda harus masuk akun untuk menghapus produk.', 'error');
            return false;
        }
        if (window.confirm('Hapus produk ini secara permanen?')) {
            showToast('Sedang menghapus produk...', 'loading');
            try {
                const productRef = doc(db, 'products', id);
                await deleteDoc(productRef);
                setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
                showToast('Produk berhasil dihapus.', 'success');
                return true;
            } catch (error: any) {
                console.error("Error deleting product:", error);
                showToast("Gagal menghapus produk: " + (error.message || "Unknown error"), 'error');
                return false;
            }
        }
        return false;
    };

    const resetToLogos = async () => {
        if (!auth.currentUser) {
            showToast('Anda harus masuk akun untuk melakukan aksi ini.', 'error');
            return;
        }
        if (window.confirm('Aksi ini akan mengubah semua foto produk menjadi logo inisial. Lanjutkan?')) {
            showToast('Sedang memperbarui foto produk...', 'loading');
            try {
                const batch = writeBatch(db);
                products.forEach(p => {
                    const logoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.name.split(' (')[0])}&backgroundColor=${p.category.includes('Ayam') ? 'fef3c7' : p.category.includes('Ikan') ? 'dcfce7' : p.category.includes('Import') ? 'fee2e2' : p.category.includes('Sayuran') ? 'ecfdf5' : 'f3f4f6'}&fontSize=35&fontWeight=700`;
                    batch.update(doc(db, 'products', p.id), { imageUrl: logoUrl });
                });
                await batch.commit();
                showToast('Semua produk telah diperbarui dengan logo!', 'success');
            } catch (error: any) {
                console.error("Error resetting to logos:", error);
                showToast("Gagal memperbarui foto produk: " + (error.message || "Unknown error"), 'error');
            }
        }
    }

    const seedData = async () => {
        if (!auth.currentUser) {
            showToast('Anda harus masuk akun untuk mereset data.', 'error');
            return;
        }

        if (window.confirm('PERINGATAN: Ini akan MENGHAPUS SEMUA produk yang ada dan mengembalikan data ke setelan pabrik. Lanjutkan?')) {
            setIsBulkDeleting(true);
            showToast('Sedang mereset data produk...', 'loading');
            try {
                const batch = writeBatch(db);
                
                // 1. Delete all existing products
                products.forEach(p => {
                    batch.delete(doc(db, 'products', p.id));
                });

                // 2. Add seed products
                const productsToSeed: any[] = [
                    { name: "Sayap Ayam Besar (1 Kg, isi 9-10 Pcs)", category: "Daging Ayam Frozen", price: 30000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Sayap Ayam")}&backgroundColor=fef3c7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Ayam Parting (Potong 8/10/12)", category: "Daging Ayam Frozen", price: 32000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Ayam Parting")}&backgroundColor=fef3c7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Paha Ayam / Paha Pentung (1 Kg, isi 8-9 Pcs)", category: "Daging Ayam Frozen", price: 36000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Paha Ayam")}&backgroundColor=fef3c7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Filet Dada Non Tulang Non Kulit", category: "Daging Ayam Frozen", price: 42000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Filet Dada")}&backgroundColor=fef3c7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Slice Dada Ayam (1 Kg, isi 18-20 lembar)", category: "Daging Ayam Frozen", price: 48000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Slice Dada")}&backgroundColor=fef3c7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Daging Ayam Giling A", category: "Daging Ayam Frozen", price: 50000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Ayam Giling")}&backgroundColor=fef3c7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Daging Ayam Giling B", category: "Daging Ayam Frozen", price: 45000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Ayam Giling")}&backgroundColor=fef3c7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Daging Ayam Giling C", category: "Daging Ayam Frozen", price: 40000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Ayam Giling")}&backgroundColor=fef3c7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Filet Ikan Lele (30% BL, Size Mix)", category: "Daging Ikan", price: 48000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Lele")}&backgroundColor=dcfce7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Filet Ikan Dori Glas (40% BL P4)", category: "Daging Ikan", price: 43000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Dori")}&backgroundColor=dcfce7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Filet Ikan Dori Glas (30% BL P4)", category: "Daging Ikan", price: 48000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Dori")}&backgroundColor=dcfce7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Filet Ikan Dori Glas (20% BL P4)", category: "Daging Ikan", price: 52000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Dori")}&backgroundColor=dcfce7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Filet Ikan Dori Glas (40% NBL P4)", category: "Daging Ikan", price: 46000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Dori")}&backgroundColor=dcfce7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Filet Ikan Dori Glas (30% NBL P4)", category: "Daging Ikan", price: 52000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Dori")}&backgroundColor=dcfce7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Filet Ikan Dori Glas (20% NBL P4)", category: "Daging Ikan", price: 55000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Dori")}&backgroundColor=dcfce7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Cumi Ring", category: "Daging Ikan", price: 72000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Cumi")}&backgroundColor=dcfce7&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Sam'an", category: "Daging Import/India", price: 62000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Meat")}&backgroundColor=fee2e2&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Rawonan", category: "Daging Import/India", price: 80000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Meat")}&backgroundColor=fee2e2&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Tetelan Kepala", category: "Daging Import/India", price: 90000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Meat")}&backgroundColor=fee2e2&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Paha Belakang", category: "Daging Import/India", price: 125000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Meat")}&backgroundColor=fee2e2&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Bokong", category: "Daging Import/India", price: 130000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Meat")}&backgroundColor=fee2e2&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Rolade Ayam", category: "Produk Olahan", price: 12000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Rolade")}&backgroundColor=f3f4f6&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Bakso Ayam (Size sesuai permintaan)", category: "Produk Olahan", price: 33000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Bakso")}&backgroundColor=f3f4f6&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Adonan A (Nugget, Dimsum, Siomay)", category: "Produk Olahan", price: 40000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Nugget")}&backgroundColor=f3f4f6&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Adonan B (Nugget, Dimsum, Siomay)", category: "Produk Olahan", price: 35000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Nugget")}&backgroundColor=f3f4f6&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Adonan C (Nugget, Dimsum, Siomay)", category: "Produk Olahan", price: 30000, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Nugget")}&backgroundColor=f3f4f6&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Mix Vege 3/4 ways", category: "Sayuran Frozen", price: 24500, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Mix Vege")}&backgroundColor=ecfdf5&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Jagung Manis", category: "Sayuran Frozen", price: 24500, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Jagung")}&backgroundColor=ecfdf5&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Kacang Polong", category: "Sayuran Frozen", price: 29500, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Kacang Polong")}&backgroundColor=ecfdf5&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Kentang Shosring", category: "Sayuran Frozen", price: 24500, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Kentang")}&backgroundColor=ecfdf5&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                    { name: "Kentang Wedgez", category: "Sayuran Frozen", price: 30500, description: "", imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("Kentang")}&backgroundColor=ecfdf5&fontSize=35&fontWeight=700`, unit: "Kg/Pcs", visible: true },
                ];
                
                productsToSeed.forEach(p => {
                    const docRef = doc(collection(db, 'products'));
                    batch.set(docRef, p);
                });

                await batch.commit();
                showToast("Data berhasil di-reset ke setelan pabrik!", "success");
            } catch (error: any) {
                console.error("Reset error:", error);
                showToast("Gagal melakukan reset: " + (error.message || "Unknown error"), "error");
            } finally {
                setIsBulkDeleting(false);
            }
        }
    };

    const stats = {
        total: products.length,
        active: products.filter(p => p.visible).length,
        categories: new Set(products.map(p => p.category)).size
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = filterCategory === 'Semua' || p.category === filterCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const handleSelect = (id: string, selected: boolean) => {
        setSelectedIds(prev => {
            if (selected) {
                if (prev.includes(id)) return prev;
                return [...prev, id];
            } else {
                return prev.filter(i => i !== id);
            }
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredProducts.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkUpdate = async (updateData: Partial<Product>) => {
        if (!auth.currentUser) return;
        const batch = writeBatch(db);
        selectedIds.forEach(id => {
            batch.update(doc(db, 'products', id), updateData);
        });
        await batch.commit();
        alert(`Berhasil memperbarui ${selectedIds.length} produk!`);
        setSelectedIds([]);
    };

    const handleBulkDelete = async () => {
        if (!auth.currentUser) {
            showToast('Silakan login terlebih dahulu untuk menghapus produk.', 'error');
            return;
        }

        const uniqueIds = Array.from(new Set(selectedIds));
        if (uniqueIds.length === 0) return;

        if (window.confirm(`Anda akan menghapus ${uniqueIds.length} produk terpilih secara permanen. Lanjutkan?`)) {
            setIsBulkDeleting(true);
            showToast(`Sedang menghapus ${uniqueIds.length} produk...`, 'loading');
            try {
                const batch = writeBatch(db);
                uniqueIds.forEach((id: string) => {
                    const productDoc = doc(db, 'products', id);
                    batch.delete(productDoc);
                });
                
                await batch.commit();
                
                showToast(`Berhasil menghapus ${uniqueIds.length} produk!`, 'success');
                setSelectedIds([]);
            } catch (error: any) {
                console.error("Bulk delete error:", error);
                showToast(`Gagal menghapus produk: ${error.message || 'Terjadi kesalahan'}`, 'error');
            } finally {
                setIsBulkDeleting(false);
            }
        }
    };

    const cleanDuplicates = async () => {
        if (!auth.currentUser) {
            alert('Silakan login sebagai admin.');
            return;
        }
        
        // Group by normalized name and category to identify duplicates (ignoring price/unit for more thorough cleaning)
        const groups = products.reduce((acc, p) => {
            const key = `${p.name.trim().toLowerCase()}|${p.category.trim().toLowerCase()}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(p);
            return acc;
        }, {} as Record<string, Product[]>);

        const toDelete: Product[] = [];
        Object.values(groups).forEach((group: Product[]) => {
            if (group.length > 1) {
                // Keep the one that likely has higher quality data (e.g. has unit or descriptive info)
                const sorted = [...group].sort((a, b) => {
                    const aScore = (a.imageUrl && !a.imageUrl.includes('dicebear') ? 10 : 0) + (a.unit ? 5 : 0) + (a.description ? 2 : 0);
                    const bScore = (b.imageUrl && !b.imageUrl.includes('dicebear') ? 10 : 0) + (b.unit ? 5 : 0) + (b.description ? 2 : 0);
                    return bScore - aScore;
                });
                
                // Keep the best one, mark others for deletion
                sorted.slice(1).forEach(p => toDelete.push(p));
            }
        });

        if (toDelete.length === 0) {
            alert('Tidak ditemukan produk duplikat dengan nama, kategori, dan harga yang sama.');
            return;
        }

        if (window.confirm(`Sistem menemukan ${toDelete.length} produk duplikat.\n\nKlik OK untuk menghapus duplikat dan menyisakan satu versi terbaik untuk setiap produk.\n\nTindakan ini tidak dapat dibatalkan.`)) {
            setIsBulkDeleting(true);
            try {
                const batch = writeBatch(db);
                toDelete.forEach(p => {
                    batch.delete(doc(db, 'products', p.id));
                });
                await batch.commit();
                alert(`Pembersihan selesai! ${toDelete.length} produk duplikat telah dihapus.`);
                setSelectedIds([]);
            } catch (error: any) {
                console.error("Cleanup error:", error);
                alert("Gagal membersihkan duplikat: " + error.message);
            } finally {
                setIsBulkDeleting(false);
            }
        }
    };

    return (
        <section id="admin" className="py-20 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h2>
                        <p className="text-gray-500 mt-1">Kelola inventaris produk dan statistik toko Anda.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={cleanDuplicates} className="bg-white text-blue-600 border border-blue-200 py-2.5 px-5 rounded-xl font-medium hover:bg-blue-50 transition shadow-sm">Bersihkan Duplikat</button>
                        <button onClick={resetToLogos} className="bg-white text-orange-600 border border-orange-200 py-2.5 px-5 rounded-xl font-medium hover:bg-orange-50 transition shadow-sm">Update ke Logo</button>
                        <button onClick={seedData} className="bg-gray-900 text-white py-2.5 px-5 rounded-xl font-medium hover:bg-gray-800 transition shadow-sm">Reset Data</button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Produk</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Produk Aktif</p>
                        <p className="text-3xl font-bold text-orange-600 mt-2">{stats.active}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Kategori</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.categories}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-200 mb-8">
                    <button 
                        onClick={() => setActiveTab('manage')}
                        className={`pb-4 px-2 font-semibold transition-all relative ${activeTab === 'manage' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Daftar Produk
                        {activeTab === 'manage' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('add')}
                        className={`pb-4 px-2 font-semibold transition-all relative ${activeTab === 'add' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Tambah Produk
                        {activeTab === 'add' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full"></div>}
                    </button>
                </div>
                
                {activeTab === 'add' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm mb-12 border border-gray-100">
                        <h3 className="text-xl font-bold mb-6">Informasi Produk</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Nama Produk</label>
                            <input type="text" placeholder="Masukkan nama produk" className="p-3 border rounded-lg" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Kategori</label>
                            <div className="flex flex-col gap-2">
                                {!isNewCategory ? (
                                    <select 
                                        className="p-3 border rounded-lg w-full" 
                                        value={category} 
                                        onChange={(e) => {
                                            if (e.target.value === "NEW") {
                                                setIsNewCategory(true);
                                                setCategory("");
                                            } else {
                                                setCategory(e.target.value);
                                            }
                                        }}
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {Array.from(new Set(products.map(p => p.category))).sort().map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="NEW" className="text-orange-600 font-bold font-italic">+ Buat Kategori Baru</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Nama kategori baru" 
                                            className="p-3 border rounded-lg flex-grow" 
                                            value={category} 
                                            onChange={e => setCategory(e.target.value)} 
                                            autoFocus
                                        />
                                        <button 
                                            onClick={() => {
                                                setIsNewCategory(false);
                                                setCategory("");
                                            }}
                                            className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Harga Retail</label>
                            <input type="number" placeholder="Masukkan harga" className="p-3 border rounded-lg" value={price} onChange={e => setPrice(Number(e.target.value))} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Harga Diskon</label>
                            <input type="number" placeholder="Masukkan harga diskon" className="p-3 border rounded-lg" value={discountPrice} onChange={e => setDiscountPrice(Number(e.target.value))} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Harga Grosir</label>
                            <input type="number" placeholder="Masukkan harga grosir" className="p-3 border rounded-lg" value={bulkPrice} onChange={e => setBulkPrice(Number(e.target.value))} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Min Pembelian Grosir</label>
                            <input type="number" placeholder="Masukkan jumlah minimum" className="p-3 border rounded-lg" value={bulkQuantity} onChange={e => setBulkQuantity(Number(e.target.value))} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Satuan (Unit)</label>
                            <input type="text" placeholder="Misal: Kg/Pcs" className="p-3 border rounded-lg" value={unit} onChange={e => setUnit(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-orange-600 font-semibold">Urutan Tampilan (Sort Order)</label>
                            <input type="number" placeholder="Misal: 1, 2, 3 (Opsional)" className="p-3 border rounded-lg border-orange-200 focus:ring-1 focus:ring-orange-500" value={sortOrder !== undefined ? sortOrder : ''} onChange={e => setSortOrder(e.target.value === '' ? undefined : Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                            {imageUrl && uploading !== 'uploading' ? (
                                <div className={`relative w-40 h-40 ${isBlinking ? 'animate-blink' : ''}`}>
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-md" referrerPolicy="no-referrer" />
                                    <div className="absolute top-0 right-0 p-2 flex gap-2">
                                        <button onClick={triggerFileSelect} className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"><Edit2 size={18} /></button>
                                        <button onClick={() => { setImageUrl(''); setUploading('idle'); }} className="bg-white p-2 rounded-full shadow-lg text-red-500 hover:bg-red-50 transition"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={triggerFileSelect} disabled={uploading === 'uploading'} className={`flex flex-col items-center gap-2 text-gray-500 hover:text-orange-600 transition ${isBlinking ? 'animate-blink' : ''} ${uploading === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <div className="bg-orange-50 p-4 rounded-full">
                                        <ImagePlus size={40} className="text-orange-600" />
                                    </div>
                                    <span className="font-medium">{uploading === 'uploading' ? 'Sedang Mengunggah...' : 'Klik untuk Unggah Foto'}</span>
                                    <span className="text-xs text-gray-400">Format: JPG, PNG (Maks 5MB)</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Atau Gunakan URL Foto (Jika upload gagal)</label>
                            <input 
                                type="text" 
                                placeholder="https://contoh.com/gambar.jpg" 
                                className="p-3 border rounded-lg text-sm" 
                                value={imageUrl} 
                                onChange={e => {
                                    setImageUrl(e.target.value);
                                    if (e.target.value) setUploading('success');
                                }} 
                            />
                        </div>
                    </div>
                    {uploading === 'uploading' && <p className="mt-2 text-sm text-blue-600">Mengunggah gambar...</p>}
                    {uploading === 'success' && <p className="mt-2 text-sm text-green-600">Foto berhasil diunggah! Silakan tinjau foto di atas.</p>}
                    {uploading === 'error' && <p className="mt-2 text-sm text-red-600">Terjadi kesalahan saat mengunggah gambar.</p>}
                    <textarea placeholder="Deskripsi" className="w-full p-3 border rounded-lg mt-4" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                    <button onClick={addProduct} className="bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold w-full mt-4">Tambah Produk</button>
                </div>

                )}
                
                {activeTab === 'manage' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <h3 className="text-xl font-bold text-gray-900">Inventaris Produk</h3>
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <input 
                                    type="text" 
                                    placeholder="Cari nama produk..." 
                                    className="p-2.5 border rounded-xl text-sm min-w-[240px] focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <select className="p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                                    <option value="Semua">Semua Kategori</option>
                                    {Array.from(new Set(products.map(p => p.category))).sort().map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-y border-gray-100">
                                    <tr>
                                        <th className="p-4 w-10">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} 
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                            />
                                        </th>
                                        <th className="p-4 font-bold">Foto</th>
                                        <th className="p-4 font-bold">Nama Produk</th>
                                        <th className="p-4 font-bold">Urutan</th>
                                        <th className="p-4 font-bold">Harga</th>
                                        <th className="p-4 font-bold">Unit</th>
                                        <th className="p-4 font-bold">Diskon</th>
                                        <th className="p-4 font-bold">Grosir</th>
                                        <th className="p-4 font-bold">Min Grosir</th>
                                        <th className="p-4 font-bold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map(p => (
                                            <ProductRow 
                                                key={p.id} 
                                                product={p} 
                                                selected={selectedIds.includes(p.id)}
                                                onSelect={handleSelect}
                                                onEdit={setEditingProduct}
                                                updateProduct={updateProduct} 
                                                deleteProduct={deleteProduct} 
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="p-12 text-center text-gray-400 font-medium">
                                                Tidak ada produk ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-8 z-[90]"
                    >
                        <div className="flex items-center gap-3 pr-8 border-r border-gray-700">
                            <CheckSquare className="text-orange-500" size={24} />
                            <span className="font-bold text-lg">{selectedIds.length} terpilih</span>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsBulkEditOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition font-semibold border border-white/10"
                            >
                                <Edit2 size={18} />
                                Edit Massal
                            </button>
                            <button 
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-bold shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isBulkDeleting ? (
                                    <div className="w-5 h-5 border-2 border-white animate-spin rounded-full border-t-transparent"></div>
                                ) : (
                                    <Trash2 size={18} />
                                )}
                                {isBulkDeleting ? 'Menghapus...' : 'Hapus Terpilih'}
                            </button>
                        </div>
                        <button 
                            onClick={() => setSelectedIds([])}
                            className="ml-4 p-2 hover:bg-white/10 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {editingProduct && (
                    <EditProductModal 
                        product={editingProduct} 
                        onClose={() => setEditingProduct(null)} 
                        onSave={updateProduct} 
                        onDelete={async (id) => {
                            const success = await deleteProduct(id);
                            if (success) {
                                setEditingProduct(null);
                            }
                            return success;
                        }}
                    />
                )}
                {isBulkEditOpen && (
                    <BulkEditModal 
                        selectedCount={selectedIds.length} 
                        onClose={() => setIsBulkEditOpen(false)} 
                        onApply={handleBulkUpdate}
                    />
                )}
            </AnimatePresence>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-[200] max-w-md bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 flex items-center gap-3"
                    >
                        {toast.type === 'loading' && (
                            <Loader2 className="w-5 h-5 text-orange-600 animate-spin flex-shrink-0" />
                        )}
                        {toast.type === 'success' && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                        {toast.type === 'error' && (
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        {toast.type === 'info' && (
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                        <span className="text-sm font-semibold text-gray-800">{toast.message}</span>
                        {toast.type !== 'loading' && (
                            <button onClick={() => setToast(prev => ({ ...prev, visible: false }))} className="p-1 hover:bg-gray-100 rounded-full transition ml-auto">
                                <X size={16} className="text-gray-400" />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
