// Web Crypto API kullanarak güvenli şifreleme ve çözme işlemleri

export const encryptData = async (data, password) => {
  try {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Şifreden anahtar türetme (PBKDF2)
    const keyMaterial = await crypto.subtle.importKey(
      "raw", 
      enc.encode(password), 
      { name: "PBKDF2" }, 
      false, 
      ["deriveKey"]
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    
    // Veriyi şifreleme (AES-GCM)
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      enc.encode(JSON.stringify(data))
    );
    
    // Salt + IV + Şifreli Veriyi birleştir
    const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.byteLength);
    buffer.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);
    
    // Base64'e çevir
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error("Şifreleme hatası:", error);
    throw new Error("Veriler şifrelenemedi.");
  }
};

export const decryptData = async (encryptedBase64, password) => {
  try {
    const binary = atob(encryptedBase64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    
    const salt = buffer.slice(0, 16);
    const iv = buffer.slice(16, 28);
    const data = buffer.slice(28);
    
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
    );
    
    const decryptedContent = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv }, key, data
    );
    
    return JSON.parse(new TextDecoder().decode(decryptedContent));
  } catch (error) {
    throw new Error("Şifre hatalı veya dosya bozuk.");
  }
};