'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    rating: 5,
    text: 'The flowers arrived fresh and beautiful! The quality was exceptional and delivery was quick. Highly recommend!',
    avatar: '👩‍🌾',
  },
  {
    id: 2,
    name: 'Michael Chen',
    rating: 5,
    text: 'Amazing selection of plants. The staff helped me choose the perfect ones for my garden. Great service!',
    avatar: '👨‍🍳',
  },
  {
    id: 3,
    name: 'Emma Davis',
    rating: 4,
    text: 'Beautiful bouquets and great prices. Will definitely order again. The packaging was really professional.',
    avatar: '👩‍💼',
  },
  {
    id: 4,
    name: 'James Wilson',
    rating: 5,
    text: 'Best online garden shop I\'ve found. Fresh products, fair pricing, and excellent customer service!',
    avatar: '👨‍💻',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by <span className="text-[#00b050]">Our Customers</span>
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of happy gardeners and plant lovers who trust us
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <span className="text-3xl">{testimonial.avatar}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
