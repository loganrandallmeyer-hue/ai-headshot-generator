import { Resend } from 'resend'

// Resend allows 40MB per email; stay comfortably under it
const MAX_EMAIL_BYTES = 30 * 1024 * 1024

interface Attachment {
  filename: string
  content: Buffer
}

/**
 * Download the generated images and email them as ATTACHMENTS.
 * Replicate's output URLs expire within about an hour — emailing links
 * would leave paying customers with dead buttons. Attachments are theirs
 * forever. Large sets are split across multiple emails to stay under
 * Resend's size limit.
 */
export async function sendHeadshotsEmail(
  toEmail: string,
  imageUrls: string[]
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY!)

  // Download every generated image (in parallel)
  const downloads = await Promise.allSettled(
    imageUrls.map(async (url, i): Promise<Attachment> => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to download image ${i + 1}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const ext = url.split('.').pop()?.toLowerCase() === 'png' ? 'png' : 'jpg'
      return { filename: `headshot-${String(i + 1).padStart(2, '0')}.${ext}`, content: buf }
    })
  )

  const attachments = downloads
    .filter((d): d is PromiseFulfilledResult<Attachment> => d.status === 'fulfilled')
    .map((d) => d.value)

  if (attachments.length === 0) {
    throw new Error('Could not download any generated images for email delivery')
  }

  // Split into batches under the size limit
  const batches: Attachment[][] = []
  let current: Attachment[] = []
  let currentBytes = 0
  for (const att of attachments) {
    if (current.length > 0 && currentBytes + att.content.length > MAX_EMAIL_BYTES) {
      batches.push(current)
      current = []
      currentBytes = 0
    }
    current.push(att)
    currentBytes += att.content.length
  }
  if (current.length > 0) batches.push(current)

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b]
    const partLabel = batches.length > 1 ? ` (part ${b + 1} of ${batches.length})` : ''

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /></head>
      <body style="background:#090909; color:#F0EBE0; font-family:sans-serif; padding:40px 20px; max-width:600px; margin:0 auto;">

        <div style="text-align:center; margin-bottom:32px;">
          <h1 style="font-size:32px; font-weight:300; color:#F0EBE0; margin:0 0 8px;">
            Your headshots are ready
          </h1>
          <p style="color:#A89F92; font-size:15px; margin:0;">
            ${attachments.length} professional AI headshot${attachments.length !== 1 ? 's' : ''}${partLabel} — attached to this email as high-resolution files.
          </p>
        </div>

        <div style="background:#141414; border:1px solid #2A2A2A; border-radius:16px; padding:24px; margin-bottom:32px;">
          <h2 style="font-size:18px; color:#F0EBE0; margin:0 0 12px; font-weight:400;">How to use your headshots</h2>
          <ul style="color:#A89F92; font-size:14px; line-height:2; padding-left:20px; margin:0;">
            <li>Save the attached images to your device</li>
            <li>Update your LinkedIn profile photo</li>
            <li>Add to your resume, portfolio, or website</li>
            <li>Use in email signatures or business cards</li>
            <li>You have full commercial rights — use them anywhere, forever</li>
          </ul>
        </div>

        <p style="color:#A89F92; font-size:12px; text-align:center;">
          Questions? Reply to this email or contact us at hello@snapshotai.com<br />
          © ${new Date().getFullYear()} SnapShot AI
        </p>

      </body>
      </html>
    `

    const { error } = await resend.emails.send({
      from: 'SnapShot AI <hello@snapshotai.com>',
      to: toEmail,
      subject: `Your ${attachments.length} professional AI headshots are ready${partLabel}`,
      html,
      attachments: batch.map((a) => ({ filename: a.filename, content: a.content })),
    })
    if (error) {
      throw new Error(`Email delivery failed: ${error.message}`)
    }
  }
}
