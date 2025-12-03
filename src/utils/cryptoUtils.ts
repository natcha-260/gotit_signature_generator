import * as rs from "jsrsasign@11.1.0";

/**
 * Generates a SHA256withRSA signature for the given data
 * @param data - The string data to sign
 * @param privateKeyPEM - The private key in PEM format
 * @param doubleEncode - If true, encodes the Base64 result in Base64 again
 * @returns Base64 encoded signature (or double Base64 encoded if doubleEncode is true)
 */
export function generateSignature(data: string, privateKeyPEM: string, doubleEncode: boolean = false): string {
  try {
    // Create a Signature object
    const sig = new rs.KJUR.crypto.Signature({ alg: "SHA256withRSA" });
    
    // Initialize with private key
    sig.init(privateKeyPEM);
    
    // Update with data to sign
    sig.updateString(data);
    
    // Generate signature in hex format
    const sigValueHex = sig.sign();
    
    // Convert hex to Base64
    let sigValueBase64 = rs.hextob64(sigValueHex);
    
    // Double encode if requested
    if (doubleEncode) {
      sigValueBase64 = btoa(sigValueBase64);
    }
    
    return sigValueBase64;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Signature generation failed: ${error.message}`);
    }
    throw new Error("Signature generation failed");
  }
}

/**
 * Generates a 2048-bit RSA key pair for testing purposes
 * @returns Object containing private and public keys in PEM format
 */
export async function generateKeyPair(): Promise<{ privateKey: string; publicKey: string }> {
  try {
    // Generate RSA key pair (2048 bits)
    const rsaKeypair = rs.KEYUTIL.generateKeypair("RSA", 2048);
    
    // Export private key to PEM format
    const privateKeyPEM = rs.KEYUTIL.getPEM(rsaKeypair.prvKeyObj, "PKCS8PRV");
    
    // Export public key to PEM format
    const publicKeyPEM = rs.KEYUTIL.getPEM(rsaKeypair.pubKeyObj);
    
    return {
      privateKey: privateKeyPEM,
      publicKey: publicKeyPEM
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Key pair generation failed: ${error.message}`);
    }
    throw new Error("Key pair generation failed");
  }
}

/**
 * Verifies a signature using the public key
 * @param data - The original string data that was signed
 * @param signatureBase64 - The Base64 encoded signature
 * @param publicKeyPEM - The public key in PEM format
 * @returns true if signature is valid, false otherwise
 */
export function verifySignature(
  data: string,
  signatureBase64: string,
  publicKeyPEM: string
): boolean {
  try {
    // Create a Signature object for verification
    const sig = new rs.KJUR.crypto.Signature({ alg: "SHA256withRSA" });
    
    // Initialize with public key
    sig.init(publicKeyPEM);
    
    // Update with data
    sig.updateString(data);
    
    // Convert Base64 signature to hex
    const sigValueHex = rs.b64tohex(signatureBase64);
    
    // Verify the signature
    return sig.verify(sigValueHex);
  } catch (error) {
    return false;
  }
}