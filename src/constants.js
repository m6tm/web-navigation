
module.exports.API_KEY = 'AIzaSyA1jXQgUFQs_bx8ZYqAXkWE0biiHwQdc7A';

module.exports.DEFAULT_PROMPT = `
    Dis moi de que tu vois dans cette image au format JSON suivant:
    Section = {
        "name": "string",
        "content": "number",
        "contentType": "string"
    }
    Return: Array<Section>
`;
