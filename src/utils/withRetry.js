/**
 * Executa uma função com retry logic e exponential backoff.
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} baseDelay - Base delay in ms (default: 1000)
 * @returns {Promise} Result of fn or throws last error
 */
export const withRetry = async (fn, maxRetries = 3, baseDelay = 1000) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Não retry em erros estruturais ou de permissão
            const nonRetryableErrors = [
                'permission-denied',
                'not-found',
                'failed-precondition', // Ex: Firestore não inicializado
            ];
            const isTargetIDError = error.message?.includes('Target ID already exists');

            if (nonRetryableErrors.includes(error.code) || isTargetIDError) {
                console.error(`[withRetry] Non-retryable error: ${error.code || error.message}`);
                throw error;
            }

            // Se é o último retry, throw
            if (attempt === maxRetries) {
                console.error(`[withRetry] All ${maxRetries} retries failed:`, error.message);
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = baseDelay * Math.pow(2, attempt);
            console.warn(`[withRetry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
};
