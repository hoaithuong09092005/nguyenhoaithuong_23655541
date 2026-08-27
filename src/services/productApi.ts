import { PRICE_MULTIPLIER } from '../constants/student';

export interface ApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  displayPrice: string;
  description: string;
  category: 'Học tập' | 'Nước' | 'Đồ ăn';
  image: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('https://fakestoreapi.com/products?limit=8');
  
  if (!response.ok) {
    throw new Error('Không tải được dữ liệu món.');
  }
  
  const data: ApiProduct[] = await response.json();
  
  return data.map((item) => {
    // Determine category:
    // clothing -> Học tập
    // jewel -> Nước
    // rest -> Đồ ăn
    let mappedCategory: 'Học tập' | 'Nước' | 'Đồ ăn' = 'Đồ ăn';
    const lowerCategory = item.category.toLowerCase();
    
    if (lowerCategory.includes('clothing')) {
      mappedCategory = 'Học tập';
    } else if (lowerCategory.includes('jewel')) {
      mappedCategory = 'Nước';
    }
    
    const finalPrice = Math.round(item.price * PRICE_MULTIPLIER);
    const displayPrice = finalPrice.toLocaleString('vi-VN') + ' đ';
    
    return {
      id: String(item.id),
      title: item.title,
      price: finalPrice,
      displayPrice,
      description: item.description,
      category: mappedCategory,
      image: item.image,
    };
  });
}
