let API = process.env.NEXT_PUBLIC_API_BASE_URL;

export const baseUrl = {
    userLogin: `${API}staff/login`,
    // CREATE-ACCOUNTMASTER:`${API}`
    ACCOUNTMASTER: `${API}accountmaster`,

    // STAFF
    STAFF:`${API}staff/create`,
    FETCHALLSTAFF:`${API}staff`,
    DELETE:`${API}staff`,

    INQUIRYCATEGORY :`${API}inquirycategory`,

    // model
    MODEL_SUGGESTION: `${API}model`,
}