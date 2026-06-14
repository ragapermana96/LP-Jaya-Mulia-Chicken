export interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    discountPrice?: number;
    bulkPrice?: number;
    bulkQuantity?: number;
    imageUrl: string;
    visible: boolean;
    unit: string;
    sortOrder?: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
}
