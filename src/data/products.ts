import { Product } from '../types';

export const products: Product[] = [
    {
        id: '1',
        name: 'Ayam Parting',
        category: 'Daging Ayam',
        description: 'Ayam potongan segar dengan kualitas premium, cocok untuk rumah tangga.',
        price: 35000,
        discountPrice: 32000,
        imageUrl: 'https://images.unsplash.com/photo-1598103444214-633005a764d8?q=80&w=500&auto=format&fit=crop',
        visible: true,
        unit: 'Kg/Pcs'
    },
    {
        id: '2',
        name: 'Daging Sapi Murni',
        category: 'Daging Sapi',
        description: 'Daging sapi murni pilihan, tekstur lembut dan segar.',
        price: 120000,
        imageUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=500&auto=format&fit=crop',
        visible: true,
        unit: 'Kg/Pcs'
    },
    {
        id: '3',
        name: 'Filet Ikan Dori',
        category: 'Filet Ikan',
        description: 'Ikan dori tanpa tulang yang siap untuk diolah.',
        price: 45000,
        discountPrice: 40000,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop',
        visible: true,
        unit: 'Kg/Pcs'
    },
    {
        id: '4',
        name: 'Kentang Frozen',
        category: 'Sayuran Frozen',
        description: 'Kentang beku praktis, siap goreng.',
        price: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1635467323636-f084ba5555d4?q=80&w=500&auto=format&fit=crop',
        visible: true,
        unit: 'Kg/Pcs'
    }
];
