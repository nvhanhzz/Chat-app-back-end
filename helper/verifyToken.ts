import jwt from "jsonwebtoken";

const verifyToken = (token: string, key: string): { id: string } | null => {
    try {
        return jwt.verify(token, key) as { id: string };
    } catch (err) {
        console.error('Error verifying token:', err);
        return null;
    }
}

export default verifyToken;