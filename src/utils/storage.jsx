// utils/storage.js
export const setUserInLocalStorage = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
};

export const getUserFromLocalStorage = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
};

export const clearUserFromLocalStorage = () => {
    localStorage.removeItem('user');
};
