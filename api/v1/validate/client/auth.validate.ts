import { Request, Response, NextFunction } from 'express';

const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&]{6,}$/;

export const register = (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.body.fullName) {
        return res.status(400).json({ message: 'Họ và tên không được để trống.' });
    }
    if (!req.body.phone) {
        return res.status(400).json({ message: 'Số điện thoại không được để trống.' });
    }
    if (!req.body.email) {
        return res.status(400).json({ message: 'Email không được để trống.' });
    }
    if (!req.body.password) {
        return res.status(400).json({ message: 'Mật khẩu không được để trống.' });
    }
    if (!req.body.confirmPassword) {
        return res.status(400).json({ message: 'Xác nhận mật khẩu không được để trống.' });
    }
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Mật khẩu và xác nhận không khớp.' });
    }
    if (!regex.test(req.body.password)) {
        return res.status(400).json({ message: 'Mật khẩu phải bao gồm ít nhất 6 ký tự, có chứa chữ thường, chữ hoa, số , và ít nhật 1 ký tự đặc biệt (@, $, !, %, *, ?, &, #).' });
    }

    next();
}