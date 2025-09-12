import { useState, useEffect } from 'react';
import api from '@/api';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ForgotPasswordOtpVerificationForm() {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60); // 1 minute timer
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const location = useLocation();
  const { email } = location.state || {};
  const navigate = useNavigate();

  // Countdown timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await api.post('/forgot_password_verify_otp/', { email, otp });
      toast.success(res.data.message);
      navigate('/forgot-password/', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.error || "OTP verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsResending(true);
    try {
      await api.post("/forgot_password_send_otp/", { email });
      toast.success("OTP resent successfully!");
      setTimer(60); // Reset timer
      setCanResend(false);
      setOtp("");
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            {/* SVG mail icon code */}
          </div>
          <h1 className="text-2xl font-semibold">Verify OTP</h1>
          <p className="text-gray-400 text-sm">
            We've sent a verification code to <br />
            <span className="text-white font-medium">{email || "your email"}</span>
          </p>
        </div>

        {/* OTP Form */}
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 text-center">
              Enter 6-digit code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="w-full max-w-[200px] mx-auto block px-4 py-3 text-center text-xl font-mono bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
              required
            />
          </div>

          {/* Timer and Resend */}
          <div className="text-center space-y-3">
            {!canResend ? (
              <p className="text-sm text-gray-400">
                Resend code in <span className="font-mono text-white">{formatTimer(timer)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 underline"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={otp.length !== 6 || isVerifying}
            className="w-full px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code? Check your spam folder or{' '}
            <button
              onClick={() => navigate('/forgot-password/', { state: { email } })}
              className="text-white hover:underline"
            >
              go back
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}



// import { useState } from 'react';
// import axios from 'axios';
// import api from '@/api';
// import { toast } from 'react-toastify';
// import { useLocation, useNavigate } from 'react-router-dom';

// export default function ForgotPasswordOtpVerificationForm() {
//   const [otp, setOtp] = useState('');
//   const location = useLocation();
//   const { email} = location.state || {};
//   const navigate = useNavigate()

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post('/forgot_password_verify_otp/', { email, otp });
//       toast.success(res.data.message)
//       navigate('/forgot-password/',{state: { email: email},})
//     } catch (error) {
//       console.log(error);
      
//       toast.error(error.response?.data?.error || "OTP verification failed");
//     }
//   };

//   return (
//     <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
//       <div className="inline-flex items-center gap-2 mb-2 mt-10">
//         <p className="prata-regular text-3xl">Verify OTP</p>
//         <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
//       </div>
//     <form onSubmit={handleVerifyOtp}>
//       <input
//         type="text"
//         className="w-[300px] px-3 py-2 border border-gray-800"
//         value={otp}
//         onChange={(e) => setOtp(e.target.value)}
//         placeholder="Enter OTP"
//         required
//       />
//       <br/>
//       <button type="submit" className="bg-black text-white px-8 py-2 font-light mt-4">Verify OTP</button>
//     </form>
//     </div>
//   );
// }
