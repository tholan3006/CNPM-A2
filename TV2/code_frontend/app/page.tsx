'use client';

import React, { useState } from 'react';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartItemPayload } from '../types/product';
import { formatVND } from '../utils/price-calculator';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  category: string;
}

const SAMPLE_MENU: MenuItem[] = [
  {
    id: 'prod-01',
    name: 'Cà phê Muối Biển',
    description: 'Cà phê Robusta Đắk Lắk đậm đà hòa quyện cùng lớp bọt kem phô mai mặn béo ngậy.',
    basePrice: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    category: 'Cà phê Đặc Biệt',
  },
  {
    id: 'prod-02',
    name: 'Cà phê Trứng Hà Nội',
    description: 'Lớp lòng đỏ trứng gà đánh bông mịn cùng mật ong trên nền cà phê phin nóng.',
    basePrice: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
    category: 'Cà phê Đặc Biệt',
  },
  {
    id: 'prod-03',
    name: 'Trà Đào Cam Sả',
    description: 'Vị trà thanh mát kết hợp đào giòn ngọt tự nhiên, nước cốt cam sành và sả thơm.',
    basePrice: 39000,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
    category: 'Trà Trái Cây',
  },
];

export default function HomePage() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItemPayload[]>([]);

  const handleOpenDetail = (id: string) => {
    setSelectedProductId(id);
    setIsModalOpen(true);
  };

  const handleAddToCart = (item: CartItemPayload) => {
    setCart((prev) => [...prev, item]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-amber-50/20 text-gray-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="text-xl font-extrabold text-amber-900 tracking-tight">
              BrewLite
            </span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 text-amber-900 font-bold text-sm">
            <span>🛒 Giỏ hàng:</span>
            <span className="bg-amber-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
              {totalCartCount}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Thực đơn Đồ uống</h1>
          <p className="text-sm text-gray-500 mt-1">
            Chạm vào bất kỳ món nào để tùy chọn Size, Topping và xem giá tự động
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {SAMPLE_MENU.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenDetail(item.id)}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[11px] font-bold text-amber-900 shadow-sm">
                  {item.category}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-amber-800 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-amber-800">
                    {formatVND(item.basePrice)}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/60 group-hover:bg-amber-800 group-hover:text-white transition-colors">
                    Tùy chọn +
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        productId={selectedProductId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
