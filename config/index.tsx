let API = process.env.NEXT_PUBLIC_API_BASE_URL;

export const baseUrl = {
    ACCOUNTMASTER: `${API}accountmaster`,

    // STAFF
    STAFF: `${API}staff`,
    STAFF_DROPDOWN: `${API}staff/dropdown`,
    LOGIN: `${API}staff/login`,

    // ROLE
    ROLE: `${API}role`,
    ROLE_STATUSES: `${API}role/statuses`,

    // Inquiry
    INQUIRYCATEGORY: `${API}inquirycategory`,
    INQUIRYCATEGORY_DROPDOWN: `${API}inquirycategory/dropdown`,

    // Customization Type
    CUSTOMIZATIONTYPE: `${API}customizationtype`,
    CUSTOMIZATIONTYPE_DROPDOWN: `${API}customizationtype/dropdown`,

    // Model
    MODEL_SUGGESTION: `${API}model`,
    MODEL_BY_CATEGORY: (categoryId: string) => `${API}model/category/${categoryId}`,
    
    // lead
    LEAD: `${API}lead`,
}