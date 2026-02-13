let API = process.env.NEXT_PUBLIC_API_BASE_URL;

export const baseUrl = {
    userLogin: `${API}staff/login`,
    ACCOUNTMASTER: `${API}accountmaster`,

    // STAFF
    STAFF:`${API}staff/create`,
    FETCHALLSTAFF:`${API}staff`,
    DELETE:`${API}staff`,

    INQUIRYCATEGORY :`${API}inquirycategory`,

    // model
    MODEL_SUGGESTION: `${API}model`,
    MODEL_BY_CATEGORY: (categoryId: string) => `${API}model/category/${categoryId}`,
    
    // lead
    LEAD: `${API}lead`,
}