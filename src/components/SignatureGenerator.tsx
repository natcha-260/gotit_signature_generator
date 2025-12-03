import { useState, useEffect } from "react";
import { Key, FileJson, Lock, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { generateSignature, generateKeyPair } from "../utils/cryptoUtils";

export function SignatureGenerator() {
  const [privateKey, setPrivateKey] = useState("");
  const [jsonPayload, setJsonPayload] = useState(`{
  "user_id": "96dafdc1-936c-47ed-984c-bce9ad9a61be",
  "order_id": "ORD123",
  "order_items": [
    {
      "transaction_id": "9cc7e2fe-9e16-4a6d-b81f-91979ca741fd",
      "item_name": {
        "en": "Gift voucher 100k",
        "vi": "Phiếu quà tặng 100k"
      },
      "quantity": 1,
      "redeem_points": 100
    }
  ],
  "signature": ""
}`);
  const [signature, setSignature] = useState("");
  const [finalPayload, setFinalPayload] = useState("");
  const [error, setError] = useState("");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [generatingKeys, setGeneratingKeys] = useState(false);
  const [doubleEncode, setDoubleEncode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load private key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("rsa_private_key");
    if (savedKey) {
      setPrivateKey(savedKey);
    }
  }, []);

  // Save private key to localStorage whenever it changes
  useEffect(() => {
    if (privateKey.trim()) {
      localStorage.setItem("rsa_private_key", privateKey);
    }
  }, [privateKey]);

  const handleGenerateSignature = () => {
    try {
      setError("");
      setSignature("");
      setFinalPayload("");

      if (!privateKey.trim()) {
        setError("Please provide a private key");
        return;
      }

      if (!jsonPayload.trim()) {
        setError("Please provide a JSON payload");
        return;
      }

      // Parse the JSON to validate it
      let payload;
      try {
        payload = JSON.parse(jsonPayload);
      } catch (e) {
        setError("Invalid JSON format");
        return;
      }

      // Step 1: Exclude signature field
      const { signature: _, ...payloadWithoutSignature } = payload;

      // Step 2: Convert to string
      const payloadString = JSON.stringify(payloadWithoutSignature);

      // Step 3 & 4: Generate signature and convert to Base64 (with optional double encoding)
      const generatedSignature = generateSignature(payloadString, privateKey, doubleEncode);
      setSignature(generatedSignature);

      // Create final payload with signature
      const final = {
        ...payloadWithoutSignature,
        signature: generatedSignature
      };
      setFinalPayload(JSON.stringify(final, null, 2));

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate signature");
    }
  };

  const handleGenerateKeyPair = async () => {
    try {
      setGeneratingKeys(true);
      setError("");
      const { privateKey: privKey, publicKey: pubKey } = await generateKeyPair();
      setPrivateKey(privKey);
      
      // Show public key in a dialog or alert
      const message = `Key pair generated successfully!\n\nYour PUBLIC KEY (share this with Buzzebees):\n\n${pubKey}\n\nThe private key has been loaded into the form. Keep it secure!`;
      alert(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate key pair");
    } finally {
      setGeneratingKeys(false);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      setError(`Failed to copy ${type}`);
    }
  };

  const handleClearPrivateKey = () => {
    if (confirm("Are you sure you want to clear the stored private key?")) {
      setPrivateKey("");
      localStorage.removeItem("rsa_private_key");
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Private Key Input */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Key className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-gray-900">Private Key</h2>
                  <p className="text-gray-500">Stored locally in your browser</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateKeyPair}
                  disabled={generatingKeys}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {generatingKeys ? "Generating..." : "Generate Keys"}
                </button>
                {privateKey && (
                  <button
                    onClick={handleClearPrivateKey}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Clear stored key"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="-----BEGIN PRIVATE KEY-----&#10;MIIEvgIBADANBgkqhkiG9w0BAQEFAASC...&#10;-----END PRIVATE KEY-----"
              className="w-full h-40 p-3 border border-gray-200 rounded-lg font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
            />
            {privateKey && (
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Private key loaded</span>
              </div>
            )}
          </div>

          {/* JSON Payload Input */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileJson className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-gray-900">Request Payload</h2>
                <p className="text-gray-500">The signature field will be auto-excluded</p>
              </div>
            </div>
            <textarea
              value={jsonPayload}
              onChange={(e) => setJsonPayload(e.target.value)}
              placeholder='{"user_id": "...", "order_id": "...", "signature": ""}'
              className="w-full h-80 p-3 border border-gray-200 rounded-lg font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-gray-900 mb-4">Settings</h3>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={doubleEncode}
                  onChange={(e) => setDoubleEncode(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-900 group-hover:text-indigo-600 transition-colors">
                    Double Base64 Encoding
                  </span>
                  {doubleEncode && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      ON
                    </span>
                  )}
                </div>
                <p className="text-gray-500">
                  Encode the Base64 signature in Base64 again (Base64(Base64(signature)))
                </p>
              </div>
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSignature}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Signature...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Generate Signature</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-900">Signature generated successfully!</p>
                <p className="text-green-700">You can now copy and use it in your API request</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900">Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Signature Output */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-gray-900">Generated Signature</h2>
                  <p className="text-gray-500">
                    {doubleEncode ? "Double Base64 encoded" : "Base64 encoded"}
                  </p>
                </div>
              </div>
              {signature && (
                <button
                  onClick={() => handleCopy(signature, "signature")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 group"
                  title="Copy signature"
                >
                  {copiedItem === "signature" ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                      <span className="text-gray-600 group-hover:text-gray-900">Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 min-h-[120px] max-h-[200px] overflow-y-auto">
              {signature ? (
                <p className="font-mono break-all text-gray-800">{signature}</p>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                  Signature will appear here after generation
                </div>
              )}
            </div>
          </div>

          {/* Final Payload Output */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileJson className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-gray-900">Complete Payload</h2>
                  <p className="text-gray-500">Ready to send to API</p>
                </div>
              </div>
              {finalPayload && (
                <button
                  onClick={() => handleCopy(finalPayload, "payload")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 group"
                  title="Copy final payload"
                >
                  {copiedItem === "payload" ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                      <span className="text-gray-600 group-hover:text-gray-900">Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 max-h-[400px] overflow-y-auto">
              {finalPayload ? (
                <pre className="font-mono whitespace-pre-wrap break-all text-gray-800">
                  {finalPayload}
                </pre>
              ) : (
                <div className="flex items-center justify-center min-h-[120px] text-gray-400 italic">
                  Complete payload will appear here after generation
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-blue-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                i
              </div>
              How it works
            </h3>
            <ol className="space-y-2 text-blue-800">
              <li className="flex gap-2">
                <span className="flex-shrink-0">1.</span>
                <span>The signature field is excluded from the payload</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">2.</span>
                <span>The payload is converted to JSON string using JSON.stringify()</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">3.</span>
                <span>The string is signed using SHA256withRSA with your private key</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">4.</span>
                <span>The signature is converted to Base64 format</span>
              </li>
              {doubleEncode && (
                <li className="flex gap-2 text-indigo-700">
                  <span className="flex-shrink-0">5.</span>
                  <span>The Base64 signature is encoded in Base64 again</span>
                </li>
              )}
              <li className="flex gap-2">
                <span className="flex-shrink-0">{doubleEncode ? '6' : '5'}.</span>
                <span>The signature is added back to the payload</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}