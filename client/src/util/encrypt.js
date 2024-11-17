export async function Encrypt(file, passphrase) {
    try {
      // Convert the passphrase to an ArrayBuffer
      const encoder = new TextEncoder();
      const passphraseArray = encoder.encode(passphrase);
  
      // Generate a random salt for the key derivation function
      const salt = crypto.getRandomValues(new Uint8Array(16));
  
      // Derive the encryption key from the passphrase and salt
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passphraseArray,
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );
  
      const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV
  
      const keyBytes = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt, // Use the same salt for encryption and decryption
          iterations: 100000, // You can adjust the number of iterations for security
          hash: "SHA-256",
        },
        keyMaterial,
        256
      );
  
      const encryptionKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        "AES-GCM",
        true,
        ["encrypt"]
      );
  
      // Read the file as an ArrayBuffer
      const fileArrayBuffer = await file.arrayBuffer();
  
      // Encrypt the file using AES-GCM
      const encryptedFile = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        encryptionKey,
        fileArrayBuffer
      );

      const blob = new Blob([encryptedFile], {type: file.type});
      blob.iv = iv
      blob.salt = salt
      // blob.size = file.size
      blob.name = file.name
      blob.lastModified = file.lastModified
      blob.encrypted = true
  
      // Return the encrypted file along with salt and IV as an object
      return {
        blob,
        // salt,
        // iv,
        // // Include original file information
        // size: blob.size,
        // name: file.name,
        // lastModified: file.lastModified,
        // type: file.type,
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      throw error;
    }
  }
  
  export async function Decrypt(encryptedData, passphrase) {
    try {
      //only need encrypted file & name
      //the rest will come from the db
      const { encryptedFile, salt, iv } = encryptedData;
  
      // Convert the passphrase to an ArrayBuffer
      const encoder = new TextEncoder();
      const passphraseArray = encoder.encode(passphrase);
  
      // Derive the encryption key from the passphrase and salt
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passphraseArray,
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );
  
      const keyBytes = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt, // Use the same salt as in encryption
          iterations: 100000, // Use the same number of iterations as in encryption
          hash: "SHA-256",
        },
        keyMaterial,
        256
      );
  
      const decryptionKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        "AES-GCM",
        true,
        ["decrypt"]
      );
  
      // Decrypt the file using AES-GCM
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv,
        },
        decryptionKey,
        encryptedFile
      );
  
      // Create a Blob from the decrypted data
      const decryptedBlob = new Blob([decryptedData]);
  
      // Create a File object with the decrypted data and original file attributes
      // const decryptedFile = new File([decryptedBlob]);
  
      return decryptedBlob;
    } catch (error) {
      console.error("Decryption failed:", error);
      throw error;
    }
  }