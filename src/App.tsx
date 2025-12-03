import { SignatureGenerator } from "./components/SignatureGenerator";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-gray-900 mb-3">SHA256withRSA Signature Generator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate cryptographic signatures for Buzzebees API integration. Your private key is stored securely in your browser and never leaves your device.
          </p>
        </div>
        <SignatureGenerator />
      </div>
    </div>
  );
}