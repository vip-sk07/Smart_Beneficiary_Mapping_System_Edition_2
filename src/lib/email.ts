import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
    },
});

const APP_NAME = "Smart Beneficiary Mapping System";

export async function sendApplicationStatusEmail(
    userEmail: string,
    userName: string,
    schemeName: string,
    status: string,
    remarks?: string | null
) {
    try {
        const mailOptions = {
            from: `"${APP_NAME}" <${process.env.EMAIL_HOST_USER}>`,
            to: userEmail,
            subject: `Your application for ${schemeName} has been ${status.toLowerCase()}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2>Hello ${userName},</h2>
                    <p>There is an update on your application for <strong>${schemeName}</strong>.</p>
                    <p>Your application status is now: <strong style="color: ${status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange'
                };">${status}</strong>.</p>
                    ${remarks ? `<p><strong>Admin Remarks:</strong> ${remarks}</p>` : ''}
                    <p>You can view more details by visiting your applications dashboard.</p>
                    <a href="${process.env.NEXTAUTH_URL}/applications" style="display: inline-block; padding: 10px 20px; color: white; background-color: #1a38f5; text-decoration: none; border-radius: 5px;">View Applications</a>
                    <br/><br/>
                    <p>Best regards,<br/>The ${APP_NAME} Team</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending application status email:", error);
    }
}

export async function sendGrievanceResolvedEmail(
    userEmail: string,
    userName: string,
    subject: string,
    adminReply: string
) {
    try {
        const mailOptions = {
            from: `"${APP_NAME}" <${process.env.EMAIL_HOST_USER}>`,
            to: userEmail,
            subject: "Your grievance has been resolved",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2>Hello ${userName},</h2>
                    <p>Your grievance regarding <strong>"${subject}"</strong> has been resolved by our admin team.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #138808; margin: 20px 0;">
                        <strong>Admin Reply:</strong><br/>
                        ${adminReply}
                    </div>
                    <p>You can view your grievance history on your dashboard.</p>
                    <a href="${process.env.NEXTAUTH_URL}/grievances" style="display: inline-block; padding: 10px 20px; color: white; background-color: #1a38f5; text-decoration: none; border-radius: 5px;">View Grievances</a>
                    <br/><br/>
                    <p>Best regards,<br/>The ${APP_NAME} Team</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending grievance resolved email:", error);
    }
}

export async function sendNewSchemeEmail(
    userEmail: string,
    userName: string,
    schemeName: string,
    schemeDescription: string
) {
    try {
        const mailOptions = {
            from: `"${APP_NAME}" <${process.env.EMAIL_HOST_USER}>`,
            to: userEmail,
            subject: `New scheme announced: ${schemeName}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2>Hello ${userName},</h2>
                    <p>A new government scheme has just been announced that might be relevant to you.</p>
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1a38f5;">${schemeName}</h3>
                        <p>${schemeDescription}</p>
                    </div>
                    <p>Check "Browse Schemes" on the portal to learn more and see if you're eligible.</p>
                    <a href="${process.env.NEXTAUTH_URL}/schemes" style="display: inline-block; padding: 10px 20px; color: white; background-color: #1a38f5; text-decoration: none; border-radius: 5px;">Browse Schemes</a>
                    <br/><br/>
                    <p>Best regards,<br/>The ${APP_NAME} Team</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending new scheme email:", error);
    }
}

export async function sendDocumentExpiryEmail(
    userEmail: string,
    userName: string,
    documentName: string,
    expiryDate: Date,
    daysUntilExpiry: number
) {
    try {
        const isExpired = daysUntilExpiry <= 0;
        const mailOptions = {
            from: `"${APP_NAME}" <${process.env.EMAIL_HOST_USER}>`,
            to: userEmail,
            subject: isExpired
                ? `Action Required: Your ${documentName} has expired`
                : `Reminder: Your ${documentName} expires in ${daysUntilExpiry} days`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2>Hello ${userName},</h2>
                    <p style="color: ${isExpired ? '#dc2626' : '#d97706'}; font-weight: bold;">
                        ${isExpired
                    ? `⚠️ Your ${documentName} has expired and requires immediate attention.`
                    : `⏰ Reminder: Your ${documentName} will expire in ${daysUntilExpiry} days.`
                }
                    </p>
                    <p><strong>Document:</strong> ${documentName}</p>
                    <p><strong>Expiry Date:</strong> ${new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(expiryDate)}</p>
                    <p>Please renew your document as soon as possible to avoid any disruption in accessing government schemes.</p>
                    <a href="${process.env.NEXTAUTH_URL}/documents" style="display: inline-block; padding: 10px 20px; color: white; background-color: #1a38f5; text-decoration: none; border-radius: 5px;">View Documents</a>
                    <br/><br/>
                    <p>Best regards,<br/>The ${APP_NAME} Team</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending document expiry email:", error);
    }
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
    try {
        const mailOptions = {
            from: `"${APP_NAME}" <${process.env.EMAIL_HOST_USER}>`,
            to: userEmail,
            subject: `Welcome to Smart Beneficiary Mapping System`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2>Welcome to the Smart Beneficiary Mapping System, ${userName}!</h2>
                    <p>We're thrilled to have you here. This platform helps you seamlessly discover and apply for government welfare schemes based on your profile.</p>
                    <p><strong>Quick Steps to Get Started:</strong></p>
                    <ol>
                        <li>Complete your profile completely to get accurate scheme matches.</li>
                        <li>Browse the available schemes or chat with our AI Assistant to find relevant ones.</li>
                        <li>Click "Apply" to send your application online smoothly.</li>
                    </ol>
                    <p>If you have any issues, feel free to submit a grievance from your dashboard.</p>
                    <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 10px 20px; color: white; background-color: #1a38f5; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                    <br/><br/>
                    <p>Best regards,<br/>The ${APP_NAME} Team</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
}
