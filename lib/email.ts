import { Resend } from 'resend'

/**
 * Send the completed headshots to the customer's email.
 * imageUrls: array of Replicate CDN URLs for the generated headshots.
 */
export async function sendHeadshotsEmail(
  toEmail: string,
  imageUrls: string[]
): Promise<void> {
  // Build the HTML email with download links
  const imageLinks = imageUrls
    .map(
      (url, i) =>
        `<a href="${url}" download="headshot-${i + 1}.jpg" style="display:inline-block; margin:6px; padding:8px 16px; background:#C9A550; color:#090909; border-radius:20px; font-family:sans-serif; font-size:13px; text-decoration:none; font-weight:600;">
          Download #${i + 1}
        </a>`
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="background:#090909; color:#F0EBE0; font-family:sans-serif; padding:40px 20px; max-width:600px; margin:0 auto;">

      <div style="text-align:center; margin-bottom:32px;">
        <h1 style="font-size:32px; font-weight:300; color:#F0EBE0; margin:0 0 8px;">
          Your headshots are ready ✨
        </h1>
        <p style="color:#A89F92; font-size:15px; margin:0;">
          ${imageUrls.length} professional AI headshots, just for you.
        </p>
      </div>

      <div style="background:#141414; border:1px solid #2A2A2A; border-radius:16px; padding:24px; margin-bottom:32px;">
        <p style="color:#A89F92; font-size:13px; margin:0 0 16px; text-transform:uppercase; letter-spacing:0.1em;">
          Download your headshots
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:4px;">
          ${imageLinks}
        </div>
      </div>

      <div style="background:#141414; border:1px solid #2A2A2A; border-radius:16px; padding:24px; margin-bottom:32px;">
        <h2 style="font-size:18px; color:#F0EBE0; margin:0 0 12px; font-weight:400;">How to use your headshots</h2>
        <ul style="color:#A89F92; font-size:14px; line-height:2; padding-left:20px; margin:0;">
          <li>Download your favorites using the buttons above</li>
          <li>Update your LinkedIn profile photo</li>
          <li>Add to your resume, portfolio, or website</li>
          <li>Use in email signatures or business cards</li>
          <li>Share anywhere — you have full commercial rights</li>
        </ul>
      </div>

      <p style="color:#A89F92; font-size:12px; text-align:center;">
        Questions? Reply to this email or contact us at hello@snapshotai.com<br />
        © ${new Date().getFullYear()} SnapShot AI
      </p>

    </body>
    </html>
  `

  const resend = new Resend(process.env.RESEND_API_KEY!)
  await resend.emails.send({
    from: 'SnapShot AI <hello@snapshotai.com>',
    to: toEmail,
    subject: `Your ${imageUrls.length} professional AI headshots are ready! ✨`,
    html,
  })
}
