import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative">
        <img
          src={product.image_url || 'https://placehold.co/300x300/e2e8f0/64748b?text=Product'}
          alt={product.name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-white dark:bg-slate-900/80 px-2 py-1 rounded-full text-xs font-medium capitalize">
          {product.category}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-auto">
          <div className="text-lg font-bold text-primary mb-3">${product.price.toFixed(2)}</div>
          <Link to={`/products/${product.id}`}>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};