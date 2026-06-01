'use client';

import { useEffect, useState } from 'react';

interface PaymentRedirectPopupProps {
  isOpen: boolean;
  redirectUrl?: string;
  paymentMethod: 'ecocash' | 'paynow';
  onClose: () => void;
}

export default function PaymentRedirectPopup({
  isOpen,
  redirectUrl,
  paymentMethod,
  onClose,
}: PaymentRedirectPopupProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    if (isOpen && redirectUrl) {
      setIsLoading(true);
      setShowIframe(true);
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, redirectUrl]);

  if (!isOpen) return null;

  const handleExternalRedirect = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00b050] to-[#008a3d] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {paymentMethod === 'ecocash' ? 'EcoCash Payment' : 'PayNow Payment'}
              </h2>
              <p className="text-sm text-green-100">Secure payment portal opening...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
          {isLoading && (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#00b050]"></div>
              </div>
              <p className="text-gray-700 font-semibold mb-2">Loading secure payment page...</p>
              <p className="text-gray-500 text-sm">
                {paymentMethod === 'ecocash'
                  ? 'You will be prompted to enter your PIN on your phone'
                  : 'Select your preferred payment method'}
              </p>
            </div>
          )}

          {!isLoading && showIframe && (
            <div className="w-full">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">This is the official PayNow payment page</p>
                    <p>You will see a prompt on your phone to enter your PIN. This is completely secure and legitimate.</p>
                  </div>
                </div>
              </div>

              {/* Payment iframe or message */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600 mb-4">
                  {paymentMethod === 'ecocash'
                    ? 'A prompt will appear on your phone asking you to enter your EcoCash PIN'
                    : 'You will be directed to the PayNow payment page in a new window'}
                </p>
                <button
                  onClick={handleExternalRedirect}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Payment Page
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-4 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            ✓ Secure encrypted connection • ✓ Your data is protected • ✓ Instant confirmation
          </p>
        </div>
      </div>
    </div>
  );
}
