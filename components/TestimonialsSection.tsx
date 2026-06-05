'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Airports Company of Zimbabwe (ACZ)',
    author: 'C. Nyoni, Acting Director Airport Operations',
    rating: 5,
    text: 'Garden Guru demonstrated exceptional professionalism, high-quality workmanship, and responsiveness throughout the SADC Summit landscaping project.',
  },
  {
    id: 2,
    name: 'HESCO Hwange Power Station',
    author: 'N. Dzumbira, Facility Site Manager',
    rating: 5,
    text: 'The Garden Guru demonstrated strong work ethics, professionalism, and attention to detail that transformed our surroundings into a cleaner and more organized space.',
  },
  {
    id: 3,
    name: 'National University of Science & Technology (NUST)',
    author: 'B. Mketo (Eng.), Director PPWE',
    rating: 5,
    text: 'The Garden Guru demonstrated professionalism, technical competence, and strong project management skills throughout the Technovation Centre Project.',
  },
  {
    id: 4,
    name: 'Zimbabwe Republic Police (ZRP)',
    author: 'Nyathi. P, Commissioner Chief Staff Officer',
    rating: 5,
    text: 'The Police does not hesitate to recommend them to anyone willing to do business with them.',
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
            Trusted by leading organizations across Zimbabwe
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-[#00b050]/10 rounded-full flex items-center justify-center">
                    <Star className="text-[#00b050] fill-[#00b050]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
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
              <p className="text-gray-600 text-sm leading-relaxed mb-3">{testimonial.text}</p>
              <p className="text-xs text-gray-500 font-medium">{testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
