import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: 'e18fa070ca357c',
        pass: '090e252986ff3e'
    }
});

export default transporter;

