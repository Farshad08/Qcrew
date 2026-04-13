// app.js - Shared utilities for Qcrew
const API_BASE = '/api';

// Authentication helper
function getUser() {
    const userStr = localStorage.getItem('qcrew_user');
    if (!userStr) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(userStr);
}

function handleLogout() {
    localStorage.removeItem('qcrew_user');
    window.location.href = 'index.html';
}

// Queue API calls
async function fetchShops() {
    try {
        const response = await fetch(`${API_BASE}/shops`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching shops:", error);
        return null;
    }
}

async function fetchQueue(shopId) {
    if (!shopId) return null;
    try {
        const response = await fetch(`${API_BASE}/queue?shop_id=${shopId}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching queue:", error);
        return null;
    }
}

async function bookSlot(userId, shopId, service) {
    try {
        const response = await fetch(`${API_BASE}/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, shop_id: shopId, service })
        });
        return await response.json();
    } catch (error) {
        console.error("Error booking slot:", error);
        return null;
    }
}

function formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatWaitTime(mins) {
    if (mins <= 0) return "It's your turn soon!";
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0) return `${hrs}h ${m}m`;
    return `${m} mins`;
}
