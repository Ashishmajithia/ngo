'use client';

import React, { useState } from 'react';
import { X, Heart, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export const DonateModal: React.FC = () => {
  const { isDonateOpen, setIsDonateOpen, showToast, content, submitDonation } = useContent();
  const [amount, setAmount] = useState('1000');
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isDonateOpen) return null;

  const presetAmounts = ['500', '1000', '2500', '5000'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = amount === 'custom' ? customAmount : amount;
    if (!finalAmount || Number(finalAmount) <= 0) {
      alert('Please select or enter a valid donation amount.');
      return;
    }

    setIsSubmitting(true);
    await submitDonation({
      amount: finalAmount,
      frequency,
      name,
      email,
      phone,
    });

    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      showToast(`Thank you ${name || 'generous donor'}! Your contribution of ₹${finalAmount} has been recorded in the database.`);
      setIsSubmitted(false);
      setIsDonateOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#fffdf8] p-6 sm:p-8 shadow-2xl border border-[#d9e1d7] text-[#183a35]">
        {/* Close Button */}
        <button
          onClick={() => setIsDonateOpen(false)}
          className="absolute top-5 right-5 rounded-full p-2 text-[#58706a] hover:bg-[#e8f0e8] hover:text-[#183a35] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#123f38] text-white">
            <Heart className="w-6 h-6 text-[#f2ad3b] fill-[#f2ad3b]" />
          </div>
          <div>
            <h3 className="display-font text-xl font-bold text-[#183a35]">
              Support {content.brand.name}
            </h3>
            <p className="text-xs text-[#28745e] font-semibold">100% Tax Exempted & Direct Grassroots Impact</p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="my-8 text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#28745e] text-white animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="display-font text-2xl font-bold text-[#123f38]">Contribution Recorded!</h4>
            <p className="mt-2 text-sm text-[#58706a]">Generations of children thank you for your warmth and support!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Frequency Selector */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f8f4e9] p-1.5 border border-[#dce7dc]">
              <button
                type="button"
                onClick={() => setFrequency('once')}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  frequency === 'once'
                    ? 'bg-[#123f38] text-white shadow-sm'
                    : 'text-[#58706a] hover:text-[#183a35]'
                }`}
              >
                One-Time Gift
              </button>
              <button
                type="button"
                onClick={() => setFrequency('monthly')}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  frequency === 'monthly'
                    ? 'bg-[#123f38] text-white shadow-sm'
                    : 'text-[#58706a] hover:text-[#183a35]'
                }`}
              >
                Monthly Supporter
              </button>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#123f38] mb-2">
                Select Amount (INR ₹)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`rounded-xl py-2.5 text-sm font-bold border transition ${
                      amount === amt
                        ? 'bg-[#28745e] text-white border-[#28745e] shadow-md'
                        : 'bg-white border-[#dce7dc] text-[#183a35] hover:border-[#28745e]'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom Amount input */}
              <div className="mt-3">
                <input
                  type="number"
                  placeholder="Or enter custom amount in ₹"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount('custom');
                  }}
                  className="w-full rounded-xl border border-[#dce7dc] px-4 py-2.5 text-sm focus:border-[#28745e] focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Donor Information */}
            <div className="space-y-3 pt-2">
              <input
                type="text"
                required
                placeholder="Full Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#dce7dc] px-4 py-2.5 text-sm focus:border-[#28745e] focus:outline-none bg-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#dce7dc] px-4 py-2.5 text-sm focus:border-[#28745e] focus:outline-none bg-white"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#dce7dc] px-4 py-2.5 text-sm focus:border-[#28745e] focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#123f38] py-4 text-base font-bold text-[#fffdf8] shadow-lg hover:bg-[#28745e] transition disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5 text-[#f2ad3b]" />
              <span>
                {isSubmitting
                  ? 'Saving to Database...'
                  : `Proceed to Support (₹${amount === 'custom' ? customAmount || 0 : amount})`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#58706a] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#28745e]" />
              <span>Encrypted 256-bit secure transaction • Tax Receipts Sent Via Email</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
