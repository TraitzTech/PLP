export type Locale = 'en' | 'fr';

export async function getMessages(locale: Locale) {
    try {
        if (locale === 'fr') {
            const messages = await import('../messages/fr.json');
            return messages.default || messages;
        }

        const messages = await import('../messages/en.json');
        return messages.default || messages;
    } catch (err) {
        // fallback to English
        const messages = await import('../messages/en.json');
        return messages.default || messages;
    }
}