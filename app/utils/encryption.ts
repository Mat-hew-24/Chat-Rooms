//Caesar Cipher?? (demo purposes) (can use a library idk)
export function encryptMessage(message: string): string {
  try {
    // Convert to base64 and apply Caesar cipher
    const base64 = btoa(unescape(encodeURIComponent(message)))
    let encrypted = ''
    for (let i = 0; i < base64.length; i++) {
      const charCode = base64.charCodeAt(i)
      const shifted = String.fromCharCode(((charCode - 32 + 7) % 95) + 32)
      encrypted += shifted
    }
    return btoa(encrypted) // Double base64 encoding
  } catch (error) {
    console.error('Encryption error:', error)
    return message // Fallback to original message
  }
}

export function decryptMessage(encryptedMessage: string): string {
  try {
    // Reverse the encryption process
    const decoded = atob(encryptedMessage)
    let decrypted = ''

    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i)
      const shifted = String.fromCharCode(((charCode - 32 - 7 + 95) % 95) + 32)
      decrypted += shifted
    }

    const base64Decoded = atob(decrypted)
    return decodeURIComponent(escape(base64Decoded))
  } catch (error) {
    console.error('Decryption error:', error)
    return encryptedMessage // Fallback to encrypted message
  }
}

// Validate if a string is encrypted (basic check)
export function isEncrypted(text: string): boolean {
  try {
    atob(text)
    return true
  } catch {
    return false
  }
}
