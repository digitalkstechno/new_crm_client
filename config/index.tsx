let API = process.env.NEXT_PUBLIC_API_BASE_URL;

export const baseUrl = {
    ACCOUNTMASTER: `${API}accountmaster`,

    // STAFF
    STAFF: `${API}staff`,
    LOGIN: `${API}staff/login`,

    // ROLE
    ROLE: `${API}role`,
    ROLE_STATUSES: `${API}role/statuses`,

    // Inquiry
    INQUIRYCATEGORY: `${API}inquirycategory`,

    // Customization Type
    CUSTOMIZATIONTYPE: `${API}customizationtype`,

    // Model
    MODEL_SUGGESTION: `${API}model`,
    MODEL_BY_CATEGORY: (categoryId: string) => `${API}model/category/${categoryId}`,
    
    // lead
    LEAD: `${API}lead`,
}