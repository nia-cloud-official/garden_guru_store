import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <Image 
                src="/assets/logo.webp" 
                alt="The Garden Guru" 
                width={180}
                height={80}
                className="h-20 w-auto object-contain"
                priority={false}
              />
            </div>
            <p className="text-gray-400">
              Hand-picked bouquets and garden plants, crafted with love.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://www.gardenguru.co.zw/" className="text-gray-400 hover:text-primary transition-colors">
                  The Official Website
                </a>
              </li>
              <li>
                <a href="/shop" className="text-gray-400 hover:text-primary transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li>{process.env.NEXT_PUBLIC_STORE_ADDRESS}</li>
              <li>{process.env.NEXT_PUBLIC_STORE_PHONE}</li>
              <li>{process.env.NEXT_PUBLIC_STORE_EMAIL}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} The Garden Guru. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
