import { useState } from "react";
import { CreditCard, X } from "lucide-react";

// PaymentModal – drop this in right under your imports
export const PaymentModal = ({ isOpen, onClose, onOnline, onCOD, amount }) => {
  const [tab, setTab] = useState("online");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 relative">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 text-center ${
              tab === "online" ? "font-bold border-b-2 border-pink-600" : ""
            }`}
            onClick={() => setTab("online")}
          >
            Pay Online
          </button>
          <button
            className={`flex-1 py-2 text-center ${
              tab === "cod" ? "font-bold border-b-2 border-pink-600" : ""
            }`}
            onClick={() => setTab("cod")}
          >
            Cash on Delivery
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {tab === "online" ? (
            <>
              <p className="mb-4">Amount: ₹{amount}</p>
              <button
                className="w-full py-2 bg-pink-600 text-white rounded flex items-center justify-center"
                onClick={() => {
                  onOnline();
                  onClose();
                }}
              >
                <CreditCard className="mr-2" /> Pay ₹{amount}
              </button>
            </>
          ) : (
            <>
              <p className="mb-4">You’ll pay ₹{amount} on delivery.</p>
              <button
                className="w-full py-2 bg-green-600 text-white rounded"
                onClick={() => {
                  onCOD();
                  onClose();
                }}
              >
                Confirm COD
              </button>
            </>
          )}
        </div>

        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
    </div>
  );
};
