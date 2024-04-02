import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { RoundSpinner, SpokeSpinner } from "@/components/spinner";
import { QRCode } from "react-qrcode-logo";
import { Check } from "@mynaui/icons-react";

function sanitizedAmountInput(amount: string) {
  if (!amount.includes(".")) return `${amount}.00`

  const [dollar, rawCents] = amount.split(".")
  const cents = (() => {
    if (rawCents.length > 2) return rawCents.substring(0, 2)
    if (rawCents.length === 2) return rawCents
    if (rawCents.length === 1) return `${rawCents}0`
    return "00"
  })()
  return `${dollar}.${cents}`
}

export default function Home() {
  const [amount, setAmount] = useState<string>();
  const [confirmedAmount, setConfirmedAmount] = useState<string>();

  const inputContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputFocus = () => {
    inputContainerRef.current?.focus();
  };

  const handleInputBlur = () => {
    inputContainerRef.current?.blur();
  };

  const handleInputClick = () => {
    inputRef.current?.focus();
  };

  const onStartOver = () => {
    setAmount(undefined)
    setConfirmedAmount(undefined)
  }

  const onCheckout = () => {
    if (!amount) return 
  
    const sanitizedAmount = sanitizedAmountInput(amount)
    setConfirmedAmount(sanitizedAmount)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 font-mono">
      <div className="border border-black p-4 rounded-lg flex flex-col gap-4 w-96">
        <div className="text-xl font-bold self-center">UniPay Demo POS</div>
        {confirmedAmount ? (
          <div className="text-center text-2xl font-bold">
            Paying ${confirmedAmount}
          </div>
        ) : (
          <div
            onClick={handleInputClick}
            ref={inputContainerRef}
            className="flex flex-col border border-black rounded-lg p-2 focus:border-blue-50"
          >
            Amount
            <div className="flex items-end">
              $
              <input
                ref={inputRef}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="focus:outline-none flex-1"
                value={amount ?? ""}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
              />
            </div>
          </div>
        )}
        {confirmedAmount ? (
          <Payment amount={confirmedAmount} />
        ) : (
          <button
            onClick={onCheckout}
            className="bg-uniswap-pink-500 rounded-md text-white py-4 px-12 disabled:bg-uniswap-pink-100 text-center flex justify-center"
            disabled={!amount}
          >
            Checkout
          </button>
        )}
        <button onClick={onStartOver} className="text-uniswap-pink-100 text-xs hover:text-uniswap-pink-500 self-center">Start over</button>
      </div>
    </main>
  );
}

enum PaymentStatus {
  GeneratingQRCode = "Generating QR Code",
  AwaitingPayment = "Scan with Uniswap Wallet",
  Pending = "Payment pending",
  Success = "Payment received!",
  Error = "Error",
}

function Payment({ amount }: { amount: string }) {
  const [status, setStatus] = useState(PaymentStatus.GeneratingQRCode);
  const [qrCode, setQRCode] = useState<string>();
  const [unipayId, setUnipayId] = useState<string>();
  const [unipayStatus, setUnipayStatus] = useState<string>();

  // fetch QR code string and unipayId
  useEffect(() => {
    async function fetchQRCode() {
      try {
        const res = await fetch(`https://unipay-api-production.up.railway.app/qr?amount=${amount}`);
        const { code } = await res.json();
        console.log("code", code)
        setQRCode(code)
      } catch (_) {
        setStatus(PaymentStatus.Error)
      }
      
    }

    fetchQRCode();
  }, [amount]);

  // poll for payment status given unipay ID
  useEffect(() => {
    setInterval(() => {}, 2000);
  }, [unipayId]);

  if (status === PaymentStatus.GeneratingQRCode)
    return (
      <div className="flex justify-center">
        <SpokeSpinner />
      </div>
    );

  if (qrCode && status === PaymentStatus.AwaitingPayment) {
    return (
      <div className="self-center text-center">
        <div>Scan with Uniswap Wallet</div>
        <QRCode
          value={qrCode}
          size={250}
          qrStyle="dots"
          eyeRadius={5}
          fgColor="#FF007A"
        />
      </div>
    );
  }

  if (status === PaymentStatus.Pending) {
    return (
      <div className="flex flex-col self-center text-center">
        <div>Payment pending</div>
        <div className="py-12">
        <RoundSpinner color="pink" size="xl" />
        </div>
      </div>
    );
  }

  if (status === PaymentStatus.Success) {
    return (
      <div className="flex flex-col self-center text-center">
        <div>Payment success!</div>
        <div className="flex justify-center py-12">
          <Check color="#FF007A" size="150" />
        </div>
      </div>
    );
  }

  if (status === PaymentStatus.Error) {
    return (
      <div className="flex flex-col self-center text-center">
        <div>There was an error. Try again?</div>
        <div className="text-4xl">😭</div>
      </div>
    );
  }
}
