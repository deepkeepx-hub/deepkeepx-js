const validate = {
    phone(value) {
        return /^1[3-9]\d{9}$/.test(value);
    },
    email(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }
};

export default validate;