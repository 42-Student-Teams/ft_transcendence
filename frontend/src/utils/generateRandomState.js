function generateRandomState(length = 16, expirationMinutes = 5) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const expirationTime = Date.now() + expirationMinutes * 60000; // Set expiration time
    return { state: result, expirationTime };
}

export { generateRandomState };
