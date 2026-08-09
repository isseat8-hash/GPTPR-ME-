const histories = new Map();

const MAX_MESSAGES = 20;

function getHistory(userId) {
    return histories.get(userId) || [];
}

function addMessage(userId, role, content) {
    if (!histories.has(userId)) {
        histories.set(userId, []);
    }

    const history = histories.get(userId);

    history.push({
        role,
        content
    });

    while (history.length > MAX_MESSAGES) {
        history.shift();
    }
}

function clearHistory(userId) {
    histories.delete(userId);
}

module.exports = {
    getHistory,
    addMessage,
    clearHistory
};
