let API = process.env.NEXT_PUBLIC_API_BASE_URL;

export const baseUrl = {
    // CREATE-ACCOUNTMASTER:`${API}`
    ACCOUNTMASTER: `${API}accountmaster`,

    // STAFF
    STAFF: `${API}staff`,
    LOGIN: `${API}staff/login`,

    // Inquiry
    INQUIRYCATEGORY: `${API}inquirycategory`,

    // Model
    MODEL_SUGGESTION: `${API}model`,
}