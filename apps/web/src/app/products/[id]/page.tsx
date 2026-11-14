'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductDetailModal } from '../../../components/ProductDetailModal';
import { CartItemPayload } from '../../../types/product';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.id as string) || 'prod-01';
  const [cartItems, setCartItems] = useState<CartItemPayload[]>([]);

  const handleAddToCart = (item: CartItemPayload) => {
    setCartItems((prev) => [...prev, item]);
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-amber-50/30 py-8 px-4 flex flex-col items-center justify-center">
      <ProductDetailModal
        productId={productId}
        isOpen={true}
        onClose={handleClose}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
}
