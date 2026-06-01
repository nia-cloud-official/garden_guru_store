'use client';

import { Truck, Shield, Gift, RotateCcw } from 'lucide-react';

const benefits = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Fresh flowers and plants delivered to your doorstep within 24-48 hours',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'All products are hand-selected and inspected for freshness and quality',
  },
  {
    icon: Gift,
    title: 'Special Gifting',
    description: 'Perfect gifts for every occasion with personalized messages included',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day money-back guarantee if you\'re not completely satisfied',
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                  <Icon size={24} className="text-[#00b050]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
