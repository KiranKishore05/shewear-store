import api from './api';
import { Product } from '@/lib/products';

export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: 'price-asc' | 'price-desc' | 'rating' | 'popular';
}

export const productService = {
    getAllProducts: async (filters?: ProductFilters): Promise<Product[]> => {
        const params = new URLSearchParams();
        params.append('_', Date.now().toString());
        if (filters?.category) params.append('category', filters.category);
        if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.sort) params.append('sort', filters.sort);

        const response = await api.get(`/products?${params.toString()}`);
        console.log('Fetched products:', response.data);
        // Log image URLs for debugging
        response.data.forEach((p: Product) => {
            if (!p.image) {
                console.warn('Product missing image:', p.name);
            }
        });
        return response.data;
    },

    getProductById: async (id: string): Promise<Product> => {
        const response = await api.get(`/products/${id}?_=${Date.now()}`);
        console.log('Fetched product:', response.data);
        return response.data;
    },

    getFeaturedProducts: async (): Promise<Product[]> => {
        const response = await api.get(`/products/featured?_=${Date.now()}`);
        return response.data;
    },
};
