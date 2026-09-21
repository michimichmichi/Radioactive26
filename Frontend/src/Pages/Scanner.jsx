import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import { ArrowLeft, QrCode, CheckCircle, XCircle, Loader } from 'lucide-react';
import { encorianAPI } from '../api';

export default function Scanner() {
  const [state, setState] = useState('scanning'); // scanning, loading, preview, checking, success, error
  const [manualCode, setManualCode] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraError, setCameraError] = useState('');
  
  const scannerRef = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    
    if (state === 'scanning') {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleLookup(decodedText);
        },
        () => {} // ignore continuous scan errors
      ).catch(err => {
        setCameraError('Unable to access camera.');
      });

      return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
      };
    }
  }, [state]);

  const isProcessingScan = useRef(false);

  const handleLookup = async (code) => {
    if (isProcessingScan.current) return;

    isProcessingScan.current = true;

    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop().catch(console.error);
    }

    setState('loading');

    try {
      const res = await encorianAPI.lookupTicket(code);
      setTicketData(res.data);
      setState('preview');
    } catch (err) {
      setErrorMsg(err.userMessage || 'Ticket not found or invalid.');
      setState('error');
    }
  };

  const handleManualLookup = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleLookup(manualCode.trim());
    }
  };

  const handleCheckIn = async () => {
    setState('checking');
    try {
      const res = await encorianAPI.checkIn(ticketData.ticket.ticketCode);
      setTicketData(res.data);
      setState('success');
    } catch (err) {
      setErrorMsg(err.userMessage || 'Check-in failed.');
      setState('error');
    }
  };

  const scanNext = () => {
    isProcessingScan.current = false;
    setTicketData(null);
    setManualCode('');
    setErrorMsg('');
    setState('scanning');
  };

  return (
    <div className="admin-page min-h-screen flex flex-col items-center p-6 text-white">
      <div className="w-full max-w-lg mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-pink-600">THE ENCORE</h1>
          <h2 className="text-xl text-pink-300">Ticket Scanner</h2>
        </div>
        <Link to="/admin" className="text-pink-400 hover:text-pink-300 flex items-center gap-2 transition-colors">
          <ArrowLeft size={20} /> Back to Admin
        </Link>
      </div>

      <div className="account-panel w-full max-w-lg p-6 rounded-3xl">
        {state === 'scanning' && (
          <div className="flex flex-col items-center">
            {cameraError ? (
              <div className="bg-red-500/20 p-4 rounded-xl text-red-400 text-center mb-6 w-full">
                {cameraError}
              </div>
            ) : (
              <>
                <div id="qr-reader" className="w-full rounded-2xl overflow-hidden border-2 border-pink-500/30 mb-4 bg-black"></div>
                <p className="text-zinc-400 mb-6 text-center">Point your camera at the QR code</p>
              </>
            )}

            <div className="w-full border-t border-pink-500/20 pt-6">
              <p className="text-center text-sm text-pink-400 mb-4 font-semibold uppercase tracking-wider">Or enter manually</p>
              <form onSubmit={handleManualLookup} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ticket Code"
                  className="admin-field flex-grow px-4 py-3"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all">
                  Look Up
                </button>
              </form>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="flex flex-col items-center py-12">
            <Loader size={48} className="text-pink-500 animate-spin mb-4" />
            <p className="text-xl font-semibold text-pink-200">Looking up ticket...</p>
          </div>
        )}

        {state === 'checking' && (
          <div className="flex flex-col items-center py-12">
            <Loader size={48} className="text-pink-500 animate-spin mb-4" />
            <p className="text-xl font-semibold text-pink-200">Checking in...</p>
          </div>
        )}

        {state === 'preview' && ticketData && (
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-6">Ticket Preview</h3>
            
            <div className="w-full bg-zinc-900/50 p-5 rounded-2xl border border-pink-500/20 mb-6">
              <p className="text-zinc-400 text-sm mb-1">Name</p>
              <p className="text-xl font-bold mb-4">{ticketData.encorian?.name || '-'}</p>
              
              <p className="text-zinc-400 text-sm mb-1">Ticket Code</p>
              <p className="text-lg mb-4">{ticketData.ticket.ticketCode}</p>
              
              <p className="text-zinc-400 text-sm mb-1">Status</p>
              {ticketData.ticket.status === 'valid' && (
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-semibold">VALID</span>
              )}
              {ticketData.ticket.status === 'used' && (
                <div className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full font-semibold">
                  ALREADY USED {ticketData.ticket.usedAt && `(${new Date(ticketData.ticket.usedAt).toLocaleString()})`}
                </div>
              )}
              {ticketData.ticket.status === 'cancelled' && (
                <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 rounded-full font-semibold">CANCELLED</span>
              )}
            </div>

            {ticketData.ticket.status === 'valid' && (
              <button 
                onClick={handleCheckIn}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-lg mb-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
              >
                <CheckCircle size={24} /> CHECK IN
              </button>
            )}
            
            <button 
              onClick={scanNext}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 rounded-2xl transition-all"
            >
              Scan Next
            </button>
          </div>
        )}

        {state === 'success' && ticketData && (
          <div className="flex flex-col items-center">
            <div className="bg-green-500/20 border-2 border-green-500 w-full p-6 rounded-2xl flex flex-col items-center mb-6">
              <CheckCircle size={64} className="text-green-400 mb-4" />
              <h3 className="text-2xl font-bold text-green-400 mb-6 text-center">CHECK-IN SUCCESSFUL</h3>
              
              <div className="w-full space-y-3 text-center">
                <div>
                  <p className="text-green-200/70 text-sm">Name</p>
                  <p className="text-xl font-semibold text-green-100">{ticketData.encorian?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-green-200/70 text-sm">Ticket Code</p>
                  <p className="text-lg text-green-100">{ticketData.ticket.ticketCode}</p>
                </div>
                <div>
                  <p className="text-green-200/70 text-sm">Checked in at</p>
                  <p className="text-md text-green-100">{new Date(ticketData.ticket.usedAt || Date.now()).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={scanNext}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl text-lg transition-all"
            >
              Scan Next
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center">
            <div className="bg-red-500/20 border-2 border-red-500 w-full p-6 rounded-2xl flex flex-col items-center mb-6">
              <XCircle size={64} className="text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-red-400 mb-2 text-center">ERROR</h3>
              <p className="text-red-200 text-center">{errorMsg}</p>
            </div>
            
            <button 
              onClick={scanNext}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl text-lg transition-all"
            >
              Scan Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
