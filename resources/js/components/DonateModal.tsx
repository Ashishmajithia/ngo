import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Check,
  CreditCard,
  ShieldCheck,
  QrCode,
  Copy,
  Building,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Zap,
  Smartphone,
  Info,
} from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { SafeImage } from '@/components/SafeImage';

export const DonateModal: React.FC = () => {
  const { isDonateOpen, setIsDonateOpen, showToast, content, setContent, submitDonation } = useContent() as any;

  useEffect(() => {
    if (isDonateOpen) {
      fetch(`/api/content?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data && setContent) {
            setContent((prev: any) => ({
              ...(prev || {}),
              payment: json.data.payment || prev?.payment || {},
              brand: json.data.brand || prev?.brand || {},
            }));
          }
        })
        .catch(() => {});
    }
  }, [isDonateOpen]);
  const [amount, setAmount] = useState('1000');
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isDonateOpen) return null;

  const payment = content?.payment || {};
  const isQrEnabled = payment?.enableQrDonation !== false;
  const qrImage = payment?.qrCodeImage || '/uploads/payment_qr_code.jpg';
  const upiId = String(payment?.upiId || 'edigibiz.1005870@myesaf').trim();
  const rawAccountName = payment?.accountName || content?.brand?.name || 'ACT Charitable Trust';
  // Strip special characters (*, _, #, brackets, etc.) strictly following NPCI UPI Payee Name rules
  const cleanAccountName = String(rawAccountName).replace(/[*_#()[\]]/g, ' ').replace(/\s+/g, ' ').trim() || 'ACT Charitable Trust';
  const cleanBrandName = String(content?.brand?.name || 'ACT Trust').replace(/[*_#()[\]]/g, ' ').replace(/\s+/g, ' ').trim();

  const presetAmounts = ['500', '1000', '2500', '5000'];
  const finalSelectedAmount = amount === 'custom' ? (customAmount || '1000') : amount;
  const txnRef = `ACT${Date.now()}`;
  const cleanNote = `Donation to ${cleanBrandName}`.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

  // Universal Standard UPI Intent (Works across all UPI apps on Android and iOS)
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(cleanAccountName)}&am=${encodeURIComponent(finalSelectedAmount)}&cu=INR&tn=${encodeURIComponent(cleanNote)}&tr=${encodeURIComponent(txnRef)}`;

  // Android Chrome Package Intents
  const gpayAndroidIntent = `intent://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(cleanAccountName)}&am=${encodeURIComponent(finalSelectedAmount)}&cu=INR&tn=${encodeURIComponent(cleanNote)}&tr=${encodeURIComponent(txnRef)}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user;end;`;
  const phonePeAndroidIntent = `intent://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(cleanAccountName)}&am=${encodeURIComponent(finalSelectedAmount)}&cu=INR&tn=${encodeURIComponent(cleanNote)}&tr=${encodeURIComponent(txnRef)}#Intent;scheme=upi;package=com.phonepe.app;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.phonepe.app;end;`;
  const paytmAndroidIntent = `intent://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(cleanAccountName)}&am=${encodeURIComponent(finalSelectedAmount)}&cu=INR&tn=${encodeURIComponent(cleanNote)}&tr=${encodeURIComponent(txnRef)}#Intent;scheme=upi;package=net.one97.paytm;S.browser_fallback_url=https://play.google.com/store/apps/details?id=net.one97.paytm;end;`;

  const handleCopyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    showToast('✓ UPI ID copied! You can paste it directly in Google Pay search.');
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleLaunchUpiApp = (app: 'all' | 'gpay' | 'phonepe' | 'paytm') => {
    // Always copy UPI ID to clipboard first as a guaranteed safety fallback
    if (upiId) {
      navigator.clipboard.writeText(upiId).catch(() => {});
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 4000);
      const appTitle = app === 'gpay' ? 'Google Pay' : app === 'phonepe' ? 'PhonePe' : app === 'paytm' ? 'Paytm' : 'UPI';
      showToast(`✓ UPI ID copied! Opening ${appTitle}...`);
    }

    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
    let targetUrl = upiIntentUrl;

    if (isAndroid) {
      if (app === 'gpay') targetUrl = gpayAndroidIntent;
      else if (app === 'phonepe') targetUrl = phonePeAndroidIntent;
      else if (app === 'paytm') targetUrl = paytmAndroidIntent;
      else targetUrl = upiIntentUrl;
    } else {
      // iOS / Desktop / Other OS
      if (app === 'gpay') {
        targetUrl = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(cleanAccountName)}&am=${encodeURIComponent(finalSelectedAmount)}&cu=INR&tn=${encodeURIComponent(cleanNote)}&tr=${encodeURIComponent(txnRef)}`;
      } else if (app === 'phonepe') {
        targetUrl = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(cleanAccountName)}&am=${encodeURIComponent(finalSelectedAmount)}&cu=INR&tn=${encodeURIComponent(cleanNote)}&tr=${encodeURIComponent(txnRef)}`;
      } else if (app === 'paytm') {
        targetUrl = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(cleanAccountName)}&am=${encodeURIComponent(finalSelectedAmount)}&cu=INR&tn=${encodeURIComponent(cleanNote)}&tr=${encodeURIComponent(txnRef)}`;
      } else {
        targetUrl = upiIntentUrl;
      }
    }

    // Launch app
    window.location.href = targetUrl;
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingScreenshot(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setScreenshot(data.url);
        showToast('✓ Payment screenshot attached!');
      } else {
        setUploadError(data.message || 'Failed to upload screenshot.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

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
      utr,
      screenshot,
      paymentMethod: isQrEnabled ? 'UPI QR Barcode' : 'Direct Support',
    });

    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      showToast(`Thank you ${name || 'generous donor'}! Your contribution of ₹${finalAmount} has been recorded.`);
      setIsSubmitted(false);
      setIsDonateOpen(false);
      // Reset form fields
      setCustomAmount('');
      setName('');
      setEmail('');
      setPhone('');
      setUtr('');
      setScreenshot('');
      setUploadError('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl my-4 sm:my-6 rounded-2xl sm:rounded-3xl bg-[#fffdf8] p-4 sm:p-7 shadow-2xl border border-[#d9e1d7] text-[#183a35] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsDonateOpen(false)}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 rounded-full p-2 text-[#58706a] hover:bg-[#e8f0e8] hover:text-[#183a35] transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8 pb-4 border-b border-[#dce7dc]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#123f38] text-white shrink-0 shadow-md">
            <Heart className="w-6 h-6 text-[#f2ad3b] fill-[#f2ad3b]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="display-font text-lg sm:text-xl font-bold text-[#183a35]">
                Support {content?.brand?.name || 'ACT Charitable Trust'}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f0e8] px-2 py-0.5 text-[10px] font-bold text-[#28745e]">
                <Sparkles className="w-3 h-3 text-[#f2ad3b]" /> 80G Tax Exempt
              </span>
            </div>
            <p className="text-xs text-[#58706a]">Every rupee directly powers education, health & meals for children</p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="my-8 text-center py-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#28745e] text-white animate-bounce shadow-lg">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="display-font text-2xl font-bold text-[#123f38]">Thank You For Your Support!</h4>
            <p className="text-sm text-[#58706a] max-w-sm mx-auto">
              Your contribution and transaction reference have been safely received. A formal donation receipt will be emailed to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
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
                1. Select Amount (INR ₹)
              </label>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold border transition ${
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
              <div className="mt-2">
                <input
                  type="number"
                  placeholder="Or enter custom amount in ₹"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount('custom');
                  }}
                  className="w-full rounded-xl border border-[#dce7dc] px-4 py-2 text-sm focus:border-[#28745e] focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* QR CODE & MOBILE 1-TAP UPI PAYMENT SECTION */}
            {isQrEnabled && (
              <div className="rounded-2xl bg-[#f8f4e9] p-4 border border-[#dce7dc] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#28745e]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#123f38]">
                      2. Pay Via UPI App or QR Barcode
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#28745e]/15 text-[#123f38] px-2 py-0.5 rounded-full font-bold">
                    Instant Zero-Fee
                  </span>
                </div>

                {/* Mobile One-Tap Direct UPI App Payment */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 rounded-2xl border border-emerald-200/80 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#123f38]">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Mobile 1-Tap Payment</span>
                    </div>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 shadow-sm">
                      <Zap className="w-3 h-3 text-[#f2ad3b]" /> Pre-Fills ₹{finalSelectedAmount}
                    </span>
                  </div>

                  {/* Primary Launch Any UPI App Button */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('all')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#123f38] to-[#28745e] hover:from-[#1b554c] hover:to-[#349277] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-98 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-[#f2ad3b]" />
                    <span>Open in Any Installed UPI App (₹{finalSelectedAmount})</span>
                  </button>

                  {/* Quick Shortcut Buttons for GPay, PhonePe, Paytm */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp('gpay')}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 py-2 px-1 text-[11px] font-bold text-[#183a35] shadow-sm transition active:scale-95 text-center cursor-pointer"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Google Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp('phonepe')}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-300 bg-white hover:bg-purple-50 py-2 px-1 text-[11px] font-bold text-[#492275] shadow-sm transition active:scale-95 text-center cursor-pointer"
                    >
                      <span className="h-2 w-2 rounded-full bg-purple-600 shrink-0"></span>
                      <span>PhonePe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp('paytm')}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-300 bg-white hover:bg-sky-50 py-2 px-1 text-[11px] font-bold text-[#002e6e] shadow-sm transition active:scale-95 text-center cursor-pointer"
                    >
                      <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0"></span>
                      <span>Paytm</span>
                    </button>
                  </div>

                  {/* Helpful Tip for Bank Security / Web-Intent Limitations */}
                  <div className="rounded-xl bg-amber-50/90 p-2.5 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="leading-snug space-y-0.5">
                      <p className="font-semibold">
                        GPay me "Receiver cannot accept payment" aaye to:
                      </p>
                      <p className="text-amber-800 text-[10.5px]">
                        Bank web-link restrict karti hai. Button click karte hi UPI ID copy ho gaya hai — GPay ke <strong>Search bar me paste</strong> karke direct send karein (100% working).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider for QR code */}
                <div className="relative flex items-center justify-center py-0.5">
                  <div className="border-t border-[#dce7dc] w-full"></div>
                  <span className="bg-[#f8f4e9] px-2 text-[10px] font-bold uppercase tracking-wider text-[#58706a] shrink-0">
                    Or Scan Barcode / Copy UPI
                  </span>
                  <div className="border-t border-[#dce7dc] w-full"></div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-2xl border border-[#dce7dc]">
                  {/* QR Image Box */}
                  <div className="w-32 h-32 sm:w-36 sm:h-36 shrink-0 bg-white p-2 rounded-xl border-2 border-[#123f38] shadow-md flex items-center justify-center">
                    <SafeImage
                      src={qrImage}
                      alt="UPI Payment Barcode QR"
                      fallbackSrc="/uploads/payment_qr_code.jpg"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* QR Info & Actions */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="text-xs text-[#58706a]">
                      Beneficiary: <strong className="text-[#183a35]">{accountName}</strong>
                    </div>

                    {/* Copy UPI Button */}
                    <div className="flex items-center gap-2 bg-[#f8f4e9] p-2 rounded-xl border border-[#dce7dc]">
                      <div className="flex-1 font-mono text-xs font-bold text-[#123f38] truncate text-left pl-1">
                        {upiId}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="inline-flex items-center gap-1 bg-[#123f38] text-white hover:bg-[#28745e] px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 shadow-sm"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-[#f2ad3b]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-[#58706a] leading-tight">
                      Supported Apps: Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, Cred & all UPI apps.
                    </div>
                  </div>
                </div>

                {/* Optional Bank Transfer Expandable Accordion */}
                {(payment.bankName || payment.accountNumber) && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowBankDetails(!showBankDetails)}
                      className="w-full flex items-center justify-between text-xs font-bold text-[#28745e] hover:text-[#123f38] py-1"
                    >
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        <span>Need Direct Bank Transfer (IMPS/NEFT)?</span>
                      </span>
                      {showBankDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showBankDetails && (
                      <div className="mt-2 p-3 bg-white rounded-xl border border-[#dce7dc] text-xs space-y-1 animate-in fade-in">
                        {payment.bankName && <div className="text-[#58706a]">Bank: <strong className="text-[#183a35]">{payment.bankName}</strong></div>}
                        {payment.accountNumber && <div className="text-[#58706a]">A/C Number: <strong className="text-[#183a35] font-mono">{payment.accountNumber}</strong></div>}
                        {payment.ifscCode && <div className="text-[#58706a]">IFSC Code: <strong className="text-[#183a35] font-mono">{payment.ifscCode}</strong></div>}
                        {payment.accountName && <div className="text-[#58706a]">A/C Holder: <strong className="text-[#183a35]">{payment.accountName}</strong></div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Donor Information */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#123f38]">
                3. Donor Information & Receipt Details
              </label>
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

              {/* UTR / Transaction Reference Number */}
              <div>
                <input
                  type="text"
                  placeholder="UPI UTR / Reference No. (e.g. 12-digit Ref No. from UPI app)"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  className="w-full rounded-xl border border-[#dce7dc] px-4 py-2 text-xs font-mono focus:border-[#28745e] focus:outline-none bg-white"
                />
                <p className="text-[10px] text-[#58706a] mt-1">
                  Optional: Enter your UPI reference / UTR number for immediate receipt issuance.
                </p>
              </div>

              {/* Payment Proof / Screenshot Upload */}
              <div>
                <label className="block text-xs font-bold text-[#183a35] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#28745e]" />
                    <span>Upload Payment Screenshot / Proof</span>
                  </span>
                  <span className="text-[10px] text-[#58706a] font-normal">(Optional)</span>
                </label>

                {screenshot ? (
                  <div className="relative flex items-center gap-3 p-2.5 rounded-xl border border-[#28745e]/40 bg-[#28745e]/5">
                    <SafeImage
                      src={screenshot}
                      alt="Payment screenshot proof"
                      className="w-14 h-14 object-cover rounded-lg border border-[#28745e]/30 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#123f38] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Screenshot Attached
                      </p>
                      <a
                        href={screenshot}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#28745e] hover:underline truncate block"
                      >
                        Click to view receipt image
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshot('')}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Remove Screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#dce7dc] hover:border-[#28745e] rounded-xl cursor-pointer bg-white transition group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleScreenshotUpload}
                      disabled={isUploadingScreenshot}
                    />
                    {isUploadingScreenshot ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-[#28745e]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading screenshot...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 text-center">
                        <div className="w-8 h-8 rounded-full bg-[#f8f4e9] group-hover:bg-[#e8f0e8] flex items-center justify-center text-[#28745e] transition shrink-0">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-[#183a35] group-hover:text-[#28745e] transition">
                            Upload UPI payment screenshot
                          </p>
                          <p className="text-[10px] text-[#58706a]">
                            Attach screenshot from PhonePe, Google Pay, Paytm, BHIM etc.
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                )}

                {uploadError && (
                  <p className="text-[11px] text-red-600 mt-1">{uploadError}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#123f38] py-3.5 text-base font-bold text-[#fffdf8] shadow-lg hover:bg-[#28745e] transition disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5 text-[#f2ad3b]" />
              <span>
                {isSubmitting
                  ? 'Saving Contribution...'
                  : `Confirm Contribution (₹${amount === 'custom' ? customAmount || 0 : amount})`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#58706a] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#28745e]" />
              <span>256-bit secure record • 80G Tax Exemption Receipts Sent Via Email</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

