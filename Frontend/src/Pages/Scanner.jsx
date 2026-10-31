import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  QrCode,
  CheckCircle2,
  XCircle,
  Loader,
  Camera,
  RefreshCcw,
  Upload,
  AlertTriangle,
  Zap,
  ZapOff,
  User,
  Ticket,
  Clock,
  FlipHorizontal,
  Banknote,
} from 'lucide-react';
import { encorianAPI } from '../api';

export default function Scanner() {
  const [state, setState] = useState('scanning');
  const [manualCode, setManualCode] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  const scannerRef = useRef(null);
  const isProcessingScan = useRef(false);
  const isStoppingRef = useRef(false);
  const fileInputRef = useRef(null);
  const activeCameraIdRef = useRef(null);
  const lastScannedCodeRef = useRef(null);
  const ignoreUntilRef = useRef(0);

  const playScanChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);

      if (navigator.vibrate) {
        navigator.vibrate([100, 40, 100]);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!window.isSecureContext && !isLocal) {
        setIsSecure(false);
      }
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    try {
      if (scannerRef.current) {
        try {
          const s = scannerRef.current.getState?.();
          if (s === 2 || s === 3 || scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch (err) {
          console.warn('Scanner stop warning:', err?.message || err);
        }
        try {
          scannerRef.current.clear?.();
        } catch {}
        scannerRef.current = null;
      }
    } finally {
      isStoppingRef.current = false;
      setTorchOn(false);
      setHasTorch(false);
    }
  }, []);

  const handleLookup = useCallback(async (code) => {
    if (!code || isProcessingScan.current) return;
    const trimmed = code.trim();
    if (!trimmed) return;

    const now = Date.now();
    if (trimmed === lastScannedCodeRef.current && now < ignoreUntilRef.current) {
      return;
    }

    isProcessingScan.current = true;
    lastScannedCodeRef.current = trimmed;
    ignoreUntilRef.current = now + 4000;

    playScanChime();
    await stopScanner();

    setState('loading');
    setErrorMsg('');

    try {
      const res = await encorianAPI.lookupTicket(trimmed);
      setTicketData(res.data);
      setState('preview');
    } catch (err) {
      setErrorMsg(err.userMessage || 'Ticket not found or code is invalid.');
      setState('error');
    }
  }, [playScanChime, stopScanner]);

  const startCamera = useCallback(async (cameraId = null) => {
    setCameraError('');
    await stopScanner();

    const container = document.getElementById('qr-reader');
    if (!container) return;

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      let cameraConfig;
      if (cameraId) {
        cameraConfig = { deviceId: { exact: cameraId } };
      } else if (activeCameraIdRef.current) {
        cameraConfig = { deviceId: { exact: activeCameraIdRef.current } };
      } else {
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setCameras(devices);
            const rearCamera = devices.find(d => /back|rear|environment/i.test(d.label));
            const chosen = rearCamera || devices[0];
            activeCameraIdRef.current = chosen.id;
            setActiveCameraId(chosen.id);
            cameraConfig = { deviceId: { exact: chosen.id } };
          } else {
            cameraConfig = { facingMode: 'environment' };
          }
        } catch {
          cameraConfig = { facingMode: 'environment' };
        }
      }

      await scanner.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.floor(minEdge * 0.72);
            return { width: edge, height: edge };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleLookup(decodedText);
        },
        () => {}
      );

      try {
        const capabilities = scanner.getRunningTrackCapabilities?.();
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err) {
      console.error('Camera start error:', err);
      const name = err?.name || '';
      const message = err?.message || '';

      if (name === 'NotAllowedError' || /permission/i.test(message)) {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser address bar.');
      } else if (name === 'NotFoundError' || /device/i.test(message)) {
        setCameraError('No camera found on this device. You can enter the ticket code manually or upload an image.');
      } else if (name === 'NotReadableError' || /in use/i.test(message)) {
        setCameraError('Camera is currently in use by another application. Please close it and retry.');
      } else {
        try {
          const scanner = new Html5Qrcode('qr-reader');
          scannerRef.current = scanner;
          await scanner.start(
            { facingMode: 'user' },
            { fps: 15, qrbox: { width: 240, height: 240 } },
            (decodedText) => handleLookup(decodedText),
            () => {}
          );
          setCameraError('');
        } catch (fallbackErr) {
          setCameraError('Unable to start camera. Please verify camera permissions or use manual lookup.');
        }
      }
    }
  }, [handleLookup, stopScanner]);

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === activeCameraIdRef.current);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    activeCameraIdRef.current = nextCamera.id;
    setActiveCameraId(nextCamera.id);
    await startCamera(nextCamera.id);
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState('loading');
    setErrorMsg('');

    try {
      const scanner = new Html5Qrcode('file-scanner-temp');
      const decodedText = await scanner.scanFile(file, true);
      await scanner.clear();
      handleLookup(decodedText);
    } catch (err) {
      setErrorMsg('No readable QR code found in the selected image. Please try again or type the code.');
      setState('error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (state === 'scanning') {
      isProcessingScan.current = false;
      const timer = setTimeout(() => {
        startCamera(activeCameraIdRef.current);
      }, 120);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [state, startCamera, stopScanner]);

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
      setErrorMsg(err.userMessage || 'Check-in failed. Please try again.');
      setState('error');
    }
  };

  const scanNext = () => {
    isProcessingScan.current = false;
    if (ticketData?.ticket?.ticketCode) {
      lastScannedCodeRef.current = ticketData.ticket.ticketCode;
    }
    ignoreUntilRef.current = Date.now() + 4000;
    setTicketData(null);
    setManualCode('');
    setErrorMsg('');
    setState('scanning');
  };

  return (
    <div className="admin-page min-h-screen flex flex-col items-center p-4 sm:p-6 text-white">
      <div id="file-scanner-temp" className="hidden"></div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="w-full max-w-lg mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-500 tracking-wider">THE ENCORE</h1>
          <h2 className="text-sm sm:text-base text-pink-300 font-medium">Ticket Check-In Scanner</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin?tab=ots-tickets"
            onClick={stopScanner}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white text-xs sm:text-sm font-bold transition-all border border-emerald-500/30"
          >
            <Banknote size={15} /> OTS Sales
          </Link>
          <Link
            to="/admin"
            onClick={stopScanner}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 hover:text-white text-xs sm:text-sm font-semibold transition-all border border-pink-500/20"
          >
            <ArrowLeft size={16} /> Admin
          </Link>
        </div>
      </div>

      {!isSecure && (
        <div className="w-full max-w-lg mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300">Camera Requires Secure Connection (HTTPS)</p>
            <p className="mt-1 text-amber-200/80">
              Web browsers only permit camera access over HTTPS or localhost. If camera fails, please use HTTPS or enter codes manually below.
            </p>
          </div>
        </div>
      )}

      <div className="account-panel w-full max-w-lg p-4 sm:p-6 rounded-3xl border border-pink-500/25 shadow-2xl">
        <div className={state === 'scanning' ? 'flex flex-col items-center' : 'hidden'}>
          {cameraError ? (
            <div className="w-full bg-red-500/15 border border-red-500/40 p-5 rounded-2xl text-center mb-6">
              <AlertTriangle size={36} className="text-red-400 mx-auto mb-2" />
              <p className="text-red-200 text-sm mb-4 leading-relaxed">{cameraError}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => startCamera(activeCameraIdRef.current)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-lg transition-all"
                >
                  <RefreshCcw size={14} /> Retry Camera
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-pink-200 text-xs font-semibold border border-pink-500/20 transition-all"
                >
                  <Upload size={14} /> Upload QR Image
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full mb-4">
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-pink-500/30 bg-black shadow-inner aspect-square flex items-center justify-center">
                <div id="qr-reader" className="w-full h-full [&_video]:object-cover"></div>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border border-pink-400/40">
                    <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-pink-500 rounded-tl-lg"></span>
                    <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-pink-500 rounded-tr-lg"></span>
                    <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-pink-500 rounded-bl-lg"></span>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-pink-500 rounded-br-lg"></span>

                    <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_12px_#ec4899] animate-[bounce_2.5s_infinite]"></div>
                  </div>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  {hasTorch && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                        torchOn ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/50' : 'bg-black/60 text-white hover:bg-black/80'
                      }`}
                      title="Toggle Flashlight"
                    >
                      {torchOn ? <Zap size={18} /> : <ZapOff size={18} />}
                    </button>
                  )}
                  {cameras.length > 1 && (
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all border border-white/10"
                      title="Switch Camera (Front / Rear)"
                    >
                      <FlipHorizontal size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-pink-300/80 px-1 mt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                  Camera Live
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:text-pink-200 underline inline-flex items-center gap-1"
                >
                  <Upload size={12} /> Scan from Photo
                </button>
              </div>
            </div>
          )}

          <div className="w-full border-t border-pink-500/20 pt-5 mt-2">
            <p className="text-center text-xs text-pink-300/80 mb-3 font-semibold uppercase tracking-wider">
              Or enter ticket code manually
            </p>
            <form onSubmit={handleManualLookup} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. ENC-A1B2C3D4"
                className="admin-field flex-grow px-3.5 py-2.5 text-sm uppercase tracking-wider font-mono"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-pink-600/30 whitespace-nowrap"
              >
                Verify
              </button>
            </form>
          </div>
        </div>

        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader size={48} className="text-pink-500 animate-spin mb-4" />
            <p className="text-lg font-bold text-white">Looking up ticket...</p>
            <p className="text-xs text-pink-300/70 mt-1">Verifying attendee details from database</p>
          </div>
        )}

        {state === 'checking' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader size={48} className="text-green-400 animate-spin mb-4" />
            <p className="text-lg font-bold text-white">Processing check-in...</p>
            <p className="text-xs text-pink-300/70 mt-1">Marking ticket as used in system</p>
          </div>
        )}

        {state === 'preview' && ticketData && (
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-pink-500 mb-4">Ticket Verification</h3>

            <div className="w-full bg-black/40 p-5 rounded-2xl border border-pink-500/30 mb-5 space-y-4">
              <div className="flex items-start gap-3">
                <User size={20} className="text-pink-400 mt-1 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-pink-300/70 uppercase tracking-wider">Attendee Name</p>
                  <p className="text-lg sm:text-xl font-extrabold text-white truncate">
                    {ticketData.encorian?.name || 'Unknown'}
                  </p>
                  {ticketData.encorian?.email && (
                    <p className="text-xs text-pink-200/60 truncate">{ticketData.encorian.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-pink-500/15 pt-3">
                <Ticket size={20} className="text-pink-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-pink-300/70 uppercase tracking-wider">Ticket Code</p>
                  <p className="text-base font-mono font-bold text-pink-300 tracking-wider">
                    {ticketData.ticket.ticketCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-pink-500/15 pt-3">
                <p className="text-xs text-pink-300/70 uppercase tracking-wider">Status</p>
                {ticketData.ticket.status === 'valid' && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-green-500/20 text-green-400 border border-green-500/40 animate-pulse">
                    READY FOR CHECK-IN
                  </span>
                )}
                {ticketData.ticket.status === 'used' && (
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                      ALREADY USED
                    </span>
                    {ticketData.ticket.usedAt && (
                      <p className="text-[11px] text-yellow-200/70 mt-1">
                        Checked in: {new Date(ticketData.ticket.usedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                {ticketData.ticket.status === 'cancelled' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                    CANCELLED / INVALID
                  </span>
                )}
              </div>
            </div>

            {ticketData.ticket.status === 'valid' && (
              <button
                type="button"
                onClick={handleCheckIn}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold py-3.5 rounded-2xl text-base mb-3 flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-500/25 active:scale-95"
              >
                <CheckCircle2 size={22} /> CONFIRM CHECK-IN
              </button>
            )}

            <button
              type="button"
              onClick={scanNext}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all border border-pink-500/20"
            >
              Scan Next Ticket
            </button>
          </div>
        )}

        {state === 'success' && ticketData && (
          <div className="flex flex-col items-center text-center">
            <div className="w-full bg-green-500/20 border-2 border-green-500/80 p-6 rounded-2xl mb-5 animate-in zoom-in-95 duration-200">
              <CheckCircle2 size={64} className="text-green-400 mx-auto mb-3" />
              <h3 className="text-2xl font-black text-green-400 tracking-wide mb-1">
                CHECK-IN SUCCESSFUL!
              </h3>
              <p className="text-xs text-green-200/80 mb-5">Attendee admitted to The Encore</p>

              <div className="bg-black/30 rounded-xl p-4 text-left space-y-2.5 border border-green-500/30">
                <div>
                  <p className="text-[11px] text-green-200/70 uppercase">Attendee</p>
                  <p className="text-lg font-bold text-white">{ticketData.encorian?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-green-200/70 uppercase">Ticket Code</p>
                  <p className="text-sm font-mono font-semibold text-green-300">{ticketData.ticket.ticketCode}</p>
                </div>
                <div>
                  <p className="text-[11px] text-green-200/70 uppercase">Timestamp</p>
                  <p className="text-xs text-green-100 flex items-center gap-1.5 mt-0.5">
                    <Clock size={13} /> {new Date(ticketData.ticket.usedAt || Date.now()).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              autoFocus
              onClick={scanNext}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-extrabold py-4 rounded-2xl text-base shadow-xl shadow-pink-600/30 transition-all active:scale-95"
            >
              Scan Next Ticket
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center text-center">
            <div className="w-full bg-red-500/20 border-2 border-red-500/80 p-6 rounded-2xl mb-5 animate-in zoom-in-95 duration-200">
              <XCircle size={64} className="text-red-400 mx-auto mb-3" />
              <h3 className="text-2xl font-black text-red-400 tracking-wide mb-2">
                VERIFICATION ERROR
              </h3>
              <p className="text-sm text-red-200 leading-relaxed mb-2">{errorMsg}</p>
            </div>

            <button
              type="button"
              onClick={scanNext}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-pink-600/30"
            >
              Try Again / Scan Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
