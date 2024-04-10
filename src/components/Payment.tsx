import { useEffect, useState } from "react";
import { RoundSpinner, SpokeSpinner } from "./LoadingSpinner";
import { QRCode } from "react-qrcode-logo";
import { Check } from "@mynaui/icons-react";

// Status strings that the backend could return
enum PaymentStatus {
  AwaitingTxStatus = "AWAITING_TX_HASH",
  Pending = "PENDING",
  Success = "SUCCESS",
  Invalid = "TX_INVALID",
  Reverted = "TX_REVERTED",
}

// for client side states
enum ClientPaymentStatus {
  GeneratingQRCode = "GENERATING_QR_CODE",
  GeneralError = "GENERAL_ERROR",
}

function isStatusFinal(status: PaymentStatus): boolean {
  return [
    PaymentStatus.Success,
    PaymentStatus.Invalid,
    PaymentStatus.Reverted,
  ].includes(status);
}

export function Payment({ amount }: { amount: string }) {
  const [status, setStatus] = useState<PaymentStatus | ClientPaymentStatus>(
    ClientPaymentStatus.GeneratingQRCode
  );
  const [qrCode, setQRCode] = useState<string>();
  const [unipayWebhook, setUnipayWebhook] = useState<string>();

  // fetch QR code string and unipayId
  useEffect(() => {
    async function fetchQRCode() {
      try {
        const res = await fetch(
          `https://unipay-api-production.up.railway.app/qr?amount=${amount}`
        );
        const { qrCode, webhook } = await res.json();
        setQRCode(qrCode);
        setUnipayWebhook(webhook);
        setStatus(PaymentStatus.AwaitingTxStatus);
      } catch (_) {
        setStatus(ClientPaymentStatus.GeneralError);
      }
    }

    fetchQRCode();
  }, [amount]);

  // poll for payment status given webhook
  useEffect(() => {
    if (!unipayWebhook) return;

    const interval = setInterval(async () => {
      const res = await fetch(unipayWebhook);
      const { status } = await res.json();

      setStatus(status as PaymentStatus);

      if (isStatusFinal(status)) {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [unipayWebhook]);

  if (status === ClientPaymentStatus.GeneratingQRCode)
    return (
      <div className="flex justify-center">
        <SpokeSpinner />
      </div>
    );

  if (qrCode && status === PaymentStatus.AwaitingTxStatus) {
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

  if (status === ClientPaymentStatus.GeneralError) {
    return (
      <div className="flex flex-col self-center text-center">
        <div>There was an error. Try again?</div>
        <div className="text-4xl">😭</div>
      </div>
    );
  }

  if (status === PaymentStatus.Reverted) {
    return (
      <div className="flex flex-col self-center text-center">
        <div>Your transaction failed :( Try again?</div>
        <div className="text-4xl">😭</div>
      </div>
    );
  }

  if (status === PaymentStatus.Invalid) {
    return (
      <div className="flex flex-col self-center text-center">
        <div>You submitted an invalid transaction hash.</div>
        <div className="text-4xl">🤨</div>
      </div>
    );
  }
}
