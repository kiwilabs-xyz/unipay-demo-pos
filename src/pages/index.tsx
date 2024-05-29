import { useRef, useState } from "react";
import { Payment } from "@/components/Payment";
import Image from "next/image";

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
      <div className="border border-black p-4 rounded-lg flex flex-col gap-4 w-96 bg-white">
        <div className="h-[60px] relative"><Image style={{ objectFit: 'contain' }} src="/logo.png" fill alt="Superswap cafe" /></div>
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

