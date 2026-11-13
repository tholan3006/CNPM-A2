'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ProductDetail,
  SizeCode,
  SweetnessLevel,
  IceLevel,
  CartItemPayload,
} from '../types/product';
import { calculateTotalPrice, formatVND } from '../utils/price-calculator';

interface ProductDetailModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: CartItemPayload) => void;
}

const SWEETNESS_OPTIONS: SweetnessLevel[] = ['100%', '70%', '50%', '30%', '0%'];
const ICE_OPTIONS: IceLevel[] = ['100%', '70%', '50%', 'Đá riêng', 'Không đá'];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  productId,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User Selection State
  const [selectedSize, setSelectedSize] = useState<SizeCode>('M');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [sweetness, setSweetness] = useState<SweetnessLevel>('100%');
  const [ice, setIce] = useState<IceLevel>('100%');
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [isSuccessToast, setIsSuccessToast] = useState<boolean>(false);

  // Fetch product detail on productId change
  useEffect(() => {
    if (!isOpen || !productId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setSelectedToppings([]);
    setSweetness('100%');
    setIce('100%');
    setQuantity(1);
    setNote('');

    fetch(`http://localhost:4000/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: ProductDetail) => {
        if (!isMounted) return;
        setProduct(data);
        const defaultSize = data.sizes.find((s) => s.isDefault)?.code || 'M';
        setSelectedSize(defaultSize);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        // Fallback demo data if offline / local dev
        const fallbackProduct: ProductDetail = {
          id: productId,
          name: 'Cà phê Muối Biển',
          description:
            'Cà phê Robusta Đắk Lắk truyền thống kết hợp cùng lớp kem mặn phô mai béo ngậy đặc trưng.',
          basePrice: 35000,
          imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
          stock: 85,
          isAvailable: true,
          category: {
            id: 'cat-01',
            name: 'Cà phê Đặc Biệt',
            slug: 'ca-phe-dac-biet',
          },
          sizes: [
            { id: 's-01', code: 'S', name: 'Nhỏ (Size S)', extraPrice: -5000, isDefault: false, isAvailable: true },
            { id: 's-02', code: 'M', name: 'Vừa (Size M - Chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
            { id: 's-03', code: 'L', name: 'Lớn (Size L)', extraPrice: 10000, isDefault: false, isAvailable: true },
          ],
          toppings: [
            { id: 'top-01', name: 'Thạch cà phê giòn', price: 6000, stock: 50, isAvailable: true },
            { id: 'top-02', name: 'Kem mặn phô mai', price: 10000, stock: 35, isAvailable: true },
            { id: 'top-03', name: 'Trân châu hoàng kim', price: 8000, stock: 45, isAvailable: true },
            { id: 'top-04', name: 'Sốt caramel macchiato', price: 8000, stock: 20, isAvailable: true },
            { id: 'top-05', name: 'Hạt sen tươi ngâm đường', price: 12000, stock: 0, isAvailable: false },
          ],
        };
        setProduct(fallbackProduct);
        setSelectedSize('M');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, productId]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamic Real-time Price Calculation
  const calculation = useMemo(() => {
    if (!product) {
      return {
        basePrice: 0,
        sizeExtraPrice: 0,
        toppingsTotal: 0,
        unitPrice: 0,
        quantity: 1,
        totalPrice: 0,
        formattedTotal: '0đ',
      };
    }
    return calculateTotalPrice(product, selectedSize, selectedToppings, quantity);
  }, [product, selectedSize, selectedToppings, quantity]);

  if (!isOpen) return null;

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId],
    );
  };

  const handleAddToCart = () => {
    if (!product) return;

    const chosenSize = product.sizes.find((s) => s.code === selectedSize)!;
    const chosenToppings = product.toppings.filter((t) =>
      selectedToppings.includes(t.id),
    );

    const payload: CartItemPayload = {
      cartItemId: `${product.id}-${selectedSize}-${selectedToppings.sort().join('-')}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      selectedSize: chosenSize,
      selectedToppings: chosenToppings,
      sweetness,
      ice,
      quantity,
      unitPrice: calculation.unitPrice,
      totalPrice: calculation.totalPrice,
      note,
    };

    if (onAddToCart) {
      onAddToCart(payload);
    }

    setIsSuccessToast(true);
    setTimeout(() => {
      setIsSuccessToast(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white md:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {isLoading ? 'Đang tải thông tin món...' : product?.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Đóng modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-xl" />
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-20 bg-gray-100 rounded-lg" />
            </div>
          ) : product ? (
            <>
              {/* Product Hero Info */}
              <div className="flex gap-4">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-xl shadow-sm border border-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200 mb-1">
                    {product.category.name}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                  <div className="text-amber-700 font-bold text-lg mt-1">
                    {formatVND(product.basePrice)}
                  </div>
                </div>
              </div>

              {/* 1. Kích cỡ (Size S/M/L) */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-900">
                    Chọn Kích cỡ (Size) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">Chọn 1</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size.code;
                    const diffLabel =
                      size.extraPrice > 0
                        ? `+${formatVND(size.extraPrice)}`
                        : size.extraPrice < 0
                        ? `-${formatVND(Math.abs(size.extraPrice))}`
                        : '0đ';

                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSize(size.code)}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/70 text-amber-900 shadow-sm ring-1 ring-amber-600'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xs font-bold">{size.name}</span>
                        <span
                          className={`text-[11px] mt-0.5 ${
                            isSelected ? 'text-amber-700 font-semibold' : 'text-gray-400'
                          }`}
                        >
                          {diffLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Danh sách Topping */}
              {product.toppings && product.toppings.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-900">
                      Topping Thêm (Add-on)
                    </label>
                    <span className="text-xs text-gray-400">Tùy chọn</span>
                  </div>
                  <div className="space-y-2">
                    {product.toppings.map((topping) => {
                      const isSelected = selectedToppings.includes(topping.id);
                      const isOutOfStock = !topping.isAvailable || topping.stock <= 0;

                      return (
                        <div
                          key={topping.id}
                          onClick={() => !isOutOfStock && toggleTopping(topping.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isOutOfStock
                              ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                              : isSelected
                              ? 'border-amber-600 bg-amber-50/50 text-amber-950 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isOutOfStock}
                              onChange={() => !isOutOfStock && toggleTopping(topping.id)}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {topping.name}
                              </div>
                              {isOutOfStock && (
                                <span className="text-[10px] text-red-500 font-semibold">
                                  Tạm hết hàng
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-amber-800">
                            +{formatVND(topping.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Khẩu vị: Lượng Đường & Đá */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    Lượng Đường (Sweetness)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SWEETNESS_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSweetness(opt)}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                          sweetness === opt
                            ? 'bg-amber-800 text-white border-amber-800'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    Lượng Đá (Ice Level)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ICE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setIce(opt)}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                          ice === opt
                            ? 'bg-amber-800 text-white border-amber-800'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Ghi chú cho Barista */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Ghi chú cho quán (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Để đá riêng, ít ngọt, mang đi..."
                  maxLength={100}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600"
                />
              </div>

              {/* 5. Chi tiết Bảng tính giá (Price Breakdown) */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-xs space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Giá gốc cơ sở:</span>
                  <span>{formatVND(calculation.basePrice)}</span>
                </div>
                {calculation.sizeExtraPrice !== 0 && (
                  <div className="flex justify-between">
                    <span>Phụ thu Size ({selectedSize}):</span>
                    <span>
                      {calculation.sizeExtraPrice > 0 ? '+' : ''}
                      {formatVND(calculation.sizeExtraPrice)}
                    </span>
                  </div>
                )}
                {calculation.toppingsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Topping ({selectedToppings.length} loại):</span>
                    <span>+{formatVND(calculation.toppingsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Đơn giá / 1 ly:</span>
                  <span>{formatVND(calculation.unitPrice)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-500">
              Không thể tải chi tiết sản phẩm.
            </div>
          )}
        </div>

        {/* Footer Action Bar (Sticky Bottom) */}
        {product && !isLoading && (
          <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent font-bold"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-bold text-gray-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 font-bold"
              >
                +
              </button>
            </div>

            {/* CTA Button with Dynamic Calculated Price */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-between shadow-lg shadow-amber-800/20 transition-all"
            >
              <span>Thêm vào giỏ</span>
              <span className="font-extrabold">{calculation.formattedTotal}</span>
            </button>
          </div>
        )}

        {/* Success Toast */}
        {isSuccessToast && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-fade-in">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-2">
              ✓
            </div>
            <div className="font-bold text-gray-900">Đã thêm vào giỏ hàng!</div>
            <div className="text-xs text-gray-500 mt-1">
              {quantity} ly • {calculation.formattedTotal}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
