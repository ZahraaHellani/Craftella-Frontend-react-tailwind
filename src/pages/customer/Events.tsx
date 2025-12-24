import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';

// Define TypeScript interfaces
interface EventCategory {
  id: string;
  name: string;
  description: string;
}

interface EventPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular: boolean;
}

interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  category: string;
}

export const Events: React.FC = () => {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteData, setQuoteData] = useState({
    name: '',
    email: '',
    event_type: '',
    date: '',
    guests: '',
    budget: '',
    message: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch events data
  const fetchEventsData = async () => {
    try {
      const [categoryResponse, packageResponse, galleryResponse] = await Promise.all([
        api.get('/event-categories'),
        { data: [/* hardcoded packages since they're static */] }, // In a real app, this would be an API call
        api.get('/gallery')
      ]);

      // Hardcoded event packages (since they're static content)
      const staticPackages: EventPackage[] = [
        {
          id: "basic",
          name: "Basic Package",
          price: 299,
          duration: "4 hours",
          features: [
            "Event space setup",
            "Basic decoration",
            "Coordination on event day",
            "Photography (50 photos)",
            "Basic souvenir package",
          ],
          popular: false,
        },
        {
          id: "premium",
          name: "Premium Package",
          price: 599,
          duration: "6 hours",
          features: [
            "Comprehensive event planning",
            "Premium decoration & styling",
            "Full day coordination",
            "Professional photography (150 photos)",
            "Custom souvenir design",
            "Catering coordination",
            "Music & entertainment setup",
          ],
          popular: true,
        },
        {
          id: "vip",
          name: "VIP Package",
          price: 999,
          duration: "8 hours",
          features: [
            "Complete event management",
            "Luxury decoration & styling",
            "Dedicated event coordinator",
            "Professional photo & video",
            "Premium custom souvenirs",
            "Full catering service",
            "Live entertainment",
            "Guest management",
            "Post-event cleanup",
          ],
          popular: false,
        },
      ];

      const categoryData = Array.isArray(categoryResponse) ? categoryResponse : categoryResponse.data || [];
      const galleryData = Array.isArray(galleryResponse) ? galleryResponse : galleryResponse.data || [];

      setCategories(categoryData);
      setPackages(staticPackages);
      setGallery(galleryData);
    } catch (error) {
      console.error('Failed to fetch events ', error);
      setMessage({ type: 'error', text: 'Failed to load events data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  // Handle quote submission
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await api.post('/quote-requests', {
        name: quoteData.name,
        email: quoteData.email,
        event_type: quoteData.event_type,
        event_date: quoteData.date,
        guest_count: quoteData.guests,
        budget: quoteData.budget,
        message: quoteData.message,
      });
      
      setMessage({ type: 'success', text: 'Your quote request has been submitted! We will contact you soon.' });
      setQuoteData({
        name: '',
        email: '',
        event_type: '',
        date: '',
        guests: '',
        budget: '',
        message: '',
      });
      setShowQuoteForm(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to submit quote request' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPackages = activeCategory === 'all' 
    ? packages 
    : packages; // In a real app, you'd filter by category

  const galleryImages = gallery.slice(0, 6); // Show first 6 images

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="bg-slate-200 dark:bg-slate-700 h-8 w-64 rounded mb-6"></div>
          <div className="bg-slate-200 dark:bg-slate-700 h-96 w-full max-w-4xl rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-emerald-500 mb-6">
              Unforgettable Events
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              From intimate gatherings to grand celebrations, we bring your vision to life with professional planning, stunning decorations, and personalized touches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-violet-700 text-white px-8 py-3">
                Book Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3"
                onClick={() => setShowQuoteForm(true)}
              >
                Request Custom Quote
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-48 left-1/2 transform -translate-x-1/2 w-[600%] h-[600px] bg-gradient-to-r from-violet-300/20 via-emerald-200/20 to-purple-300/20 rounded-full blur-3xl dark:from-violet-900/30 dark:via-emerald-900/30 dark:to-purple-900/30"></div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              activeCategory === 'all'
                ? 'bg-primary text-white shadow-lg shadow-violet-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'
            }`}
          >
            All Events
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full transition-all duration-300 capitalize ${
                activeCategory === category.id
                  ? 'bg-primary text-white shadow-lg shadow-violet-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Event Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border ${
                pkg.popular 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-slate-200 dark:border-slate-700'
              } overflow-hidden hover:shadow-xl transition-shadow duration-300`}
            >
              {pkg.popular && (
                <div className="bg-primary text-white text-center py-1 text-sm font-bold">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{pkg.name}</h3>
                    <div className="text-slate-600 dark:text-slate-400">{pkg.duration}</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">${pkg.price}</div>
                </div>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full py-2">
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
              Event Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {galleryImages.map((image) => (
                <div key={image.id} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image.url || 'https://placehold.co/300x300/e2e8f0/64748b?text=Event'}
                    alt={image.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah & Mike",
                text: "Craftella made our dream wedding come true! Every detail was perfect.",
                rating: 5,
                event: "Wedding"
              },
              {
                name: "Emma",
                text: "The most amazing birthday party ever! Everyone loved the custom decorations.",
                rating: 5,
                event: "Birthday"
              },
              {
                name: "TechCorp",
                text: "Professional service that impressed all our clients and employees.",
                rating: 4,
                event: "Corporate"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic mb-4">"{testimonial.text}"</p>
                <div className="font-medium text-slate-800 dark:text-slate-200">{testimonial.name}</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">{testimonial.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Quote Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-bold text-slate-800 dark:text-slate-100 mb-4">
                      Request Custom Quote
                    </h3>
                    
                    {message && (
                      <div className={`mb-4 p-3 rounded-lg ${
                        message.type === 'success' 
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' 
                          : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      }`}>
                        {message.text}
                      </div>
                    )}
                    
                    <form onSubmit={handleQuoteSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          placeholder="Full Name"
                          value={quoteData.name}
                          onChange={(e) => setQuoteData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={quoteData.email}
                          onChange={(e) => setQuoteData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                          value={quoteData.event_type}
                          onChange={(e) => setQuoteData(prev => ({ ...prev, event_type: e.target.value }))}
                          className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        >
                          <option value="">Select Event Type</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="date"
                          value={quoteData.date}
                          onChange={(e) => setQuoteData(prev => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="number"
                          placeholder="Number of Guests"
                          value={quoteData.guests}
                          onChange={(e) => setQuoteData(prev => ({ ...prev, guests: e.target.value }))}
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Budget ($)"
                          value={quoteData.budget}
                          onChange={(e) => setQuoteData(prev => ({ ...prev, budget: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Tell us about your vision..."
                          value={quoteData.message}
                          onChange={(e) => setQuoteData(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowQuoteForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                        >
                          {submitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};