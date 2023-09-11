export const generateRandomUsername = () => {
    return 'user' + Math.random().toString(36).substr(2, 8);
}

export const generateChatId = (senderId: string, receiverId: string) => {
    const combinedIds = `${senderId}_${receiverId}`;
    let hash = 0;

    for (let i = 0; i < combinedIds.length; i++) {
        const char = combinedIds.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString();
}

