import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../Components/NavigationBar';
import { encorianAPI, referralCodeAPI } from '../api';
import { validateImageFile } from '../utils/fileValidation';
import qris from '../assets/encore/qris.jpeg';

export default function TheEncore() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '', buktiTransfer: null });
  const [referralCode, setReferralCode] = useState('');
  const [refStatus, setRefStatus] = useState({ state: 'idle', message: '', panitiaName: '' });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const verifyTimerRef = useRef(null);

  const checkCode = async (codeToVerify) => {
    const trimmed = (codeToVerify || '').trim().toUpperCase();
    if (!trimmed) {
      setRefStatus({ state: 'idle', message: '', panitiaName: '' });
      return;
    }
    setRefStatus({ state: 'loading', message: 'Checking code...', panitiaName: '' });
    try {
      const res = await referralCodeAPI.verify(trimmed);
      if (res.data?.valid) {
        setRefStatus({
          state: 'valid',
          message: `Committee: ${res.data.panitiaName}`,
          panitiaName: res.data.panitiaName
        });
      } else {
        setRefStatus({ state: 'invalid', message: 'Invalid code', panitiaName: '' });
      }
    } catch {
      setRefStatus({ state: 'invalid', message: 'Referral code not found or inactive', panitiaName: '' });
    }
  };

  useEffect(() => {
    const paramRef = (searchParams.get('ref') || searchParams.get('refcode') || '').trim().toUpperCase();
    if (paramRef) {
      setReferralCode(paramRef);
      checkCode(paramRef);
    }
  }, [searchParams]);

  const handleReferralChange = (val) => {
    const uppercaseVal = val.toUpperCase().trim();
    setReferralCode(val.toUpperCase());

    if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);
    if (!uppercaseVal) {
      setRefStatus({ state: 'idle', message: '', panitiaName: '' });
      return;
    }

    verifyTimerRef.current = setTimeout(() => {
      checkCode(uppercaseVal);
    }, 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.buktiTransfer) {
      const validationError = validateImageFile(form.buktiTransfer);
      if (validationError) {
        setErrorMsg(validationError);
        setStatus('error');
        return;
      }
    } else {
      setErrorMsg('Payment proof is required.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    formData.append('buktiTransfer', form.buktiTransfer);

    if (referralCode.trim()) {
      formData.append('referralCode', referralCode.trim().toUpperCase());
    }

    try {
      await encorianAPI.submit(formData);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.userMessage || 'An error occurred while submitting.');
      setStatus('error');
    }
  };

  return (
    <div className="account-page flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-6">
        <h1 className="sr-only">The Encore — Ticket Registration</h1>

        <div className="account-panel w-full max-w-3xl p-8 rounded-3xl">
          <h2 className="text-3xl font-bold text-pink-500 mb-6 text-center">The Encore Ticket Registration</h2>

          {status === 'success' ? (
            <div className="bg-green-500/20 border border-green-500 p-6 rounded-2xl text-center">
              <h3 className="text-xl font-bold text-green-400 mb-2">Ticket Request Submitted!</h3>
              <p className="text-green-200">Your registration is pending approval. You will receive an email once it is approved.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-start">
              <div className="flex flex-col items-center bg-black/30 border border-pink-500/30 rounded-2xl p-4 md:p-5 md:sticky md:top-24">
                <p className="text-pink-400 text-xs text-center mb-3 leading-relaxed">
                  Scan QRIS for payment, then upload your transfer proof alongside.
                </p>
                <p className="text-2xl font-bold text-pink-400 text-center mb-3">
                  Rp35.000
                </p>
                <img
                  src={qris}
                  alt="QRIS Payment"
                  className="w-full max-w-[250px] h-auto object-contain rounded-xl bg-white p-2"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {status === 'error' && (
                  <div className="bg-red-500/20 border border-red-500 p-4 rounded-xl text-red-400 text-sm">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="account-label block mb-2">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="account-field w-full px-4 py-3"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="account-label block mb-2">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="account-field w-full px-4 py-3"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="account-label block mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter your WhatsApp or phone number"
                    className="account-field w-full px-4 py-3"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="account-label">
                      Committee Referral Code <span className="text-pink-300/60 text-xs font-normal">(Optional)</span>
                    </label>
                    {refStatus.state === 'valid' && (
                      <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                        ✓ {refStatus.message}
                      </span>
                    )}
                    {refStatus.state === 'invalid' && (
                      <span className="text-xs text-red-400 font-semibold">
                        ✕ {refStatus.message}
                      </span>
                    )}
                    {refStatus.state === 'loading' && (
                      <span className="text-xs text-pink-300 animate-pulse">
                        Checking code...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. RAC-XXXXX"
                    className={`account-field w-full px-4 py-3 uppercase tracking-wider font-mono ${
                      refStatus.state === 'valid' ? 'border-green-500/60 focus:border-green-400' : ''
                    } ${
                      refStatus.state === 'invalid' ? 'border-red-500/60 focus:border-red-400' : ''
                    }`}
                    value={referralCode}
                    onChange={(e) => handleReferralChange(e.target.value)}
                  />
                  <p className="text-xs text-pink-300/60 mt-1">
                    Enter the referral code provided by the ticketing committee (if any).
                  </p>
                </div>

                <div>
                  <label className="account-label block mb-2">Transfer Proof (JPG/PNG)</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    required
                    className="account-field w-full px-4 py-3"
                    onChange={(e) => setForm({ ...form, buktiTransfer: e.target.files[0] })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="account-button w-full py-3 mt-4 text-white font-bold"
                >
                  {status === 'submitting' ? 'Submitting...' : 'Submit Registration'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
