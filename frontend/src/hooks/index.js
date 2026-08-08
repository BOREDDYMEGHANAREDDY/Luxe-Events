import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { paymentsAPI } from '../utils/api';

// ─── useFetch ──────────────────────────────────────────────────────
export const useFetch = (apiFn, deps = [], options = {}) => {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      const result = res.data?.data ?? res.data;
      setData(result);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      setError(err.message);
      if (onError) onError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  }, []);

  return { data, loading, error, refetch: execute };
};

// ─── useDebounce ──────────────────────────────────────────────────
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ─── useRazorpay ──────────────────────────────────────────────────
export const useRazorpay = () => {
  const [processing, setProcessing] = useState(false);

  const loadScript = () =>
    new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id  = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const initiatePayment = useCallback(async ({ bookingId, paymentType = 'advance', onSuccess, onFailure }) => {
    setProcessing(true);
    try {
      const loaded = await loadScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load');

      const orderRes = await paymentsAPI.createOrder({ bookingId, paymentType });
      const orderData = orderRes.data.data;

      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'Luxe Events',
        description: `Booking #${orderData.bookingId}`,
        image:       '/logo192.png',
        order_id:    orderData.orderId,
        prefill:     orderData.prefill,
        notes:       orderData.notes,
        theme:       orderData.theme,
        handler: async (response) => {
          try {
            const verifyRes = await paymentsAPI.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              paymentDbId:         orderData.paymentId,
              bookingId,
            });
            toast.success('Payment successful! Booking confirmed.');
            if (onSuccess) onSuccess(verifyRes.data.data);
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
            if (onFailure) onFailure(err);
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast('Payment cancelled', { icon: 'ℹ️' });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        if (onFailure) onFailure(response.error);
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Payment initiation failed');
      if (onFailure) onFailure(err);
      setProcessing(false);
    }
  }, []);

  return { initiatePayment, processing };
};

// ─── useCountUp ───────────────────────────────────────────────────
export const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const frameRef = useRef(null);

  const startCount = useCallback(() => {
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  }, [end, duration, start]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);
  return { count, startCount };
};

// ─── useLocalStorage ──────────────────────────────────────────────
export const useLocalStorage = (key, initialValue) => {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  const setValue = (value) => {
    setStored(value);
    localStorage.setItem(key, JSON.stringify(value));
  };
  return [stored, setValue];
};

// ─── useIntersectionObserver ──────────────────────────────────────
export const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, ...options });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};
