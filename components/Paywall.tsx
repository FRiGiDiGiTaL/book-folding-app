import React from "react";

const Paywall = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Unlock Full Access</h1>
      <p className="mb-6 text-gray-700">
        Get instant access to generate your custom book folding pattern.
      </p>
      <a
        href="https://buy.stripe.com/test_cNi28s8Gf0Ag9Rk0cCbQY00"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
      >
        Buy Now
      </a>
    </div>
  );
};

export default Paywall;
