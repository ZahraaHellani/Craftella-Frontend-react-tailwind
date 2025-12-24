import React from 'react';

// Define TypeScript interface
interface CartItemProps {
  item: {
    id: number;
    quantity: number;
    unit_price: number;
    total: number;
    itemable: {
      id: number;
      name: string;
      price: number;
      image_url: string;
      type: string;
    };
    customization?: {
      engraving_text?: string;
    };
  };
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemove: (itemId: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={item.itemable.image_url || 'https://placehold.co/120x120/e2e8f0/64748b?text=Product'}
          alt={item.itemable.name}
          className="w-24 h-24 object-cover rounded-lg"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1">
              {item.itemable.name}
            </h3>
            {item.customization?.engraving_text && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Engraving: "{item.customization.engraving_text}"
              </p>
            )}
            <p className="text-primary font-bold">
              ${item.unit_price.toFixed(2)}
            </p>
          </div>
          <div className="flex items-start sm:items-end mt-2 sm:mt-0">
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              ${item.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Quantity & Remove */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="px-3 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-4 py-1 text-slate-800 dark:text-slate-200 min-w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="px-3 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

// Required for TypeScript isolatedModules
export {};