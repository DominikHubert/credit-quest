const API_URL = '/api/data'; // Relative URL for same-origin (served by Node)

export const api = {
    async loadData() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Failed to load data');
            return await res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    },

    async saveData(data) {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (err) {
            console.error("Save failed:", err);
        }
    }
};
