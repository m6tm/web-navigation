
const API_KEY = 'AIzaSyA1jXQgUFQs_bx8ZYqAXkWE0biiHwQdc7A';

const DEFAULT_PROMPT = `
    Dis moi de que tu vois dans cette image au format JSON suivant:
    Section = {
        "name": "string",
        "content": "number",
        "contentType": "string"
    }
    Return: Array<Section>
`;

// const GEMINI_AI_STUDIO_URL = 'https://aistudio.google.com/prompts/new_chat'
const GEMINI_AI_STUDIO_URL = 'https://aistudio.google.com'

module.exports = {
    API_KEY,
    DEFAULT_PROMPT,
    GEMINI_AI_STUDIO_URL,
}