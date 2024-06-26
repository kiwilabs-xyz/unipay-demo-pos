import { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { recoverMessageAddress } from "viem";
import { v4 as uuid } from 'uuid'

export default function CheckIn() {
  const [nonce, setNonce] = useState(uuid())
  const webhook = `https://unisap-pos-pay-20c498b4406f.herokuapp.com/webhook/${nonce}`;
  const message = `Sign this message to check into the Uniswap Cafe! Nonce: ${nonce}`;

  const [address, setAddress] = useState<string>();
  const [copied, setCopied] = useState(false);

  const qrCodeJson = {
    method: "personal_sign",
    chainId: 8453,
    message,
    webhook,
    dapp: {
      name: "Uniswap Cafe",
      url: "https://uniswap.org",
      icon: "",
    },
  };

  // poll for payment status given webhook
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(webhook);
        const { response } = await res.json();

        const recoveredAddress = await recoverMessageAddress({
          message,
          signature: response,
        });

        setAddress(recoveredAddress);
        setNonce(uuid());
      } catch (_) {}
    }, 2000);

    return () => clearInterval(interval);
  }, [webhook]);

  const qrCode = `uwulink${JSON.stringify(qrCodeJson)}`;

  return (
    <main className="flex min-h-screen flex-col items-center p-24 font-mono">
      <div className="border border-black p-4 rounded-lg flex flex-col items-center gap-4 w-96 bg-white">
        <div>Check in to UniPay</div>
        {!address ? (
          <div>
            <QRCode
              value={qrCode}
              size={250}
              qrStyle="dots"
              eyeRadius={5}
              fgColor="#FF007A"
            />
            <button
              className="text-uniswap-pink-100 text-xs hover:text-uniswap-pink-500 self-center"
              onClick={() => {
                navigator.clipboard.writeText(qrCode);
                setCopied(true);
              }}
            >
              {copied ? "Copied!" : "Copy QR code"}
            </button>
          </div>
        ) : (
          <div>Hello {address}!</div>
        )}
      </div>
    </main>
  );
}
