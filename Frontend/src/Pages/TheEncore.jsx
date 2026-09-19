import { useState } from 'react';
import Navbar from '../Components/NavigationBar';
import Footer from '../Components/Footer';
import { encorianAPI } from '../api';
import { validateImageFile } from '../utils/fileValidation';

export default function TheEncore() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', buktiTransfer: null });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMsg, setErrorMsg] = useState('');

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
      setErrorMsg('Bukti transfer is required.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    formData.append('buktiTransfer', form.buktiTransfer);

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
        
        <div className="account-panel w-full max-w-lg p-8 rounded-3xl">
          <h2 className="text-3xl font-bold text-pink-500 mb-6 text-center">The Encore Ticket Registration</h2>
          
          {status === 'success' ? (
            <div className="bg-green-500/20 border border-green-500 p-6 rounded-2xl text-center">
              <h3 className="text-xl font-bold text-green-400 mb-2">Ticket Request Submitted!</h3>
              <p className="text-green-200">Your registration is pending approval. You will receive an email once it is approved.</p>
            </div>
          ) : (
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
                  className="account-field w-full px-4 py-3"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="account-label block mb-2">Email</label>
                <input 
                  type="email" 
                  required 
                  className="account-field w-full px-4 py-3"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="account-label block mb-2">Phone</label>
                <input 
                  type="tel" 
                  required 
                  className="account-field w-full px-4 py-3"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="account-label block mb-2">Bukti Transfer (JPG/PNG)</label>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png"
                  required 
                  className="account-field w-full px-4 py-3"
                  onChange={(e) => setForm({...form, buktiTransfer: e.target.files[0]})}
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
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}