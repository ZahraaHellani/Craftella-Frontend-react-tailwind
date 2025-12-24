import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

// Define TypeScript interfaces
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  type: 'standard' | 'customizable' | 'bulk';
  is_featured: boolean;
  has3d: boolean;
}

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  image_url: string;
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [customization, setCustomization] = useState({
    engravingText: '',
    use3dPreview: false,
  });
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [activeImage, setActiveImage] = useState('');
  const { showToast } = useToast();

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const productData = response.data || response;
        setProduct(productData);
        setActiveImage(productData.image_url);

        // Fetch related products
        const relatedResponse = await api.get(`/products?category=${productData.category}&per_page=4`);
        const relatedData = Array.isArray(relatedResponse) ? relatedResponse : relatedResponse.data || [];
        setRelatedProducts(relatedData.filter((p: RelatedProduct) => p.id !== Number(id)));
      } catch (error) {
        console.error('Failed to fetch product:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, navigate]);

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !product) return;
      
      try {
        const response = await api.get('/wishlists');
        const wishlists = Array.isArray(response) ? response : response.data || [];
        
        // Check if product is in any wishlist
        const isInWish = wishlists.some((list: any) => 
          list.items?.some((item: any) => item.wishlistable_id === product.id)
        );
        setIsInWishlist(isInWish);
      } catch (error) {
        console.error('Failed to check wishlist:', error);
      }
    };

    checkWishlist();
  }, [user, product]);

  const handleAddToCart = async () => {
  if (!product) return;

  try {
    const cartData: any = {
      product_id: product.id,
      quantity,
    };

    // Add customization if applicable
    if (product.type === 'customizable' && customization.engravingText) {
      cartData.customization = {
        engraving_text: customization.engravingText,
        image: null,
      };
    }

    await api.post('/cart', cartData);
    
    showToast('Added to Cart', `${product.name} has been added to your cart`, 'success');
  } catch (error) {
    console.error('Failed to add to cart:', error);
    showToast('Add to Cart Failed', 'Could not add to cart', 'error');
  }
};
  const handleToggleWishlist = async () => {
  if (!user) {
    if (confirm('You need to be logged in to use wishlist. Go to login?')) {
      navigate('/login', { state: { from: location } });
    }
    return;
  }

  if (!product) return;

  try {
    if (isInWishlist) {
      await api.post('/wishlists', { name: 'My Wishlist' });
      showToast('Added to Wishlist', `${product.name} has been added to your wishlist`, 'success');
      setIsInWishlist(true);
    } else {
      // Remove from wishlist (simplified)
      alert('Removed from wishlist');
      setIsInWishlist(false);
    }
  } catch (error) {
    console.error('Failed to update wishlist:', error);
    showToast('Wishlist Update Failed', 'Could not update wishlist', 'error');
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="bg-slate-200 dark:bg-slate-700 h-96 w-96 rounded-2xl mb-6"></div>
          <div className="bg-slate-200 dark:bg-slate-700 h-8 w-64 rounded mb-4"></div>
          <div className="bg-slate-200 dark:bg-slate-700 h-4 w-96 rounded mb-2"></div>
          <div className="bg-slate-200 dark:bg-slate-700 h-4 w-80 rounded mb-6"></div>
          <div className="bg-slate-200 dark:bg-slate-700 h-10 w-32 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary">Home</Link> /{' '}
          <Link to="/products" className="hover:text-primary">Products</Link> /{' '}
          <span className="text-slate-800 dark:text-slate-200">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden aspect-square flex items-center justify-center">
              <img
                src={activeImage || product.image_url}
                alt={product.name}
                className="object-contain w-full h-full p-4"
                loading="lazy"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[product.image_url, ...Array(2)].map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img || product.image_url)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 ${
                    activeImage === img || (index === 0 && !activeImage)
                      ? 'border-primary'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <img
                    src={img || product.image_url}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>

            {/* 3D Preview Toggle (if available) */}
            {product.has3d && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="3d-preview"
                  checked={customization.use3dPreview}
                  onChange={(e) => setCustomization(prev => ({ ...prev, use3dPreview: e.target.checked }))}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="3d-preview" className="ml-2 text-slate-700 dark:text-slate-300">
                  Enable 3D Preview
                </label>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full">
              {/* Category Badge */}
              <div className="inline-block bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium px-3 py-1 rounded-full mb-4 capitalize">
                {product.category.replace('_', ' ')}
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                {product.name}
              </h1>

              {/* Price */}
              <div className="text-2xl font-bold text-primary mb-6">
                ${product.price.toFixed(2)}
              </div>

              {/* Description */}
              <div className="text-slate-600 dark:text-slate-400 mb-8 flex-grow">
                <p>{product.description}</p>
              </div>

              {/* Customization Options */}
              {product.type === 'customizable' && (
                <div className="mb-6">
                  <label htmlFor="engraving" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Add Engraving (Free)
                  </label>
                  <input
                    type="text"
                    id="engraving"
                    placeholder="Enter text to engrave..."
                    value={customization.engravingText}
                    onChange={(e) => setCustomization(prev => ({ ...prev, engravingText: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={50}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Up to 50 characters
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <label className="text-slate-700 dark:text-slate-300 mr-4 font-medium">
                  Quantity:
                </label>
                <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-slate-800 dark:text-slate-200 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 py-3"
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToggleWishlist}
                  className="flex-1 py-3 flex items-center justify-center gap-2"
                >
                  {isInWishlist ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      In Wishlist
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Wishlist
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id}>
                  <Link to={`/products/${relatedProduct.id}`} className="block">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <img
                        src={relatedProduct.image_url || 'https://placehold.co/300x300/e2e8f0/64748b?text=Product'}
                        alt={relatedProduct.name}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                      <div className="p-4">
                        <h3 className="font-medium text-slate-800 dark:text-slate-100 line-clamp-2 mb-2">
                          {relatedProduct.name}
                        </h3>
                        <div className="text-lg font-bold text-primary">
                          ${relatedProduct.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};