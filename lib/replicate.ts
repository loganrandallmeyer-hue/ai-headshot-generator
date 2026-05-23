import Replicate from 'replicate'

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

// PhotoMaker model — preserves face likeness while generating headshots
const PHOTOMAKER_VERSION =
  'ddfc2b08d209f9fa8c1eca692712918bd449f695d785824b1fe844f1af4041a8'

const HEADSHOT_STYLES = [
  { style: 'Photographic (Default)', bg: 'white background, studio lighting' },
  { style: 'Photographic (Default)', bg: 'office background, professional environment' },
  { style: 'Photographic (Default)', bg: 'blurred bokeh background, outdoor natural light' },
  { style: 'Photographic (Default)', bg: 'dark gradient background, dramatic studio lighting' },
  { style: 'Photographic (Default)', bg: 'light grey background, soft lighting' },
]

/**
 * Upload a file to Replicate's CDN and return a URL.
 * This is used so we can pass image URLs to the model.
 */
export async function uploadFileToReplicate(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const response = await fetch('https://api.replicate.com/v1/files', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': mimeType,
    },
    body: buffer as unknown as BodyInit,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Replicate file upload failed: ${err}`)
  }

  const data = await response.json()
  // Return the URL that can be used in predictions
  return data.urls.get
}

/**
 * Generate professional headshots using PhotoMaker.
 * Takes the first uploaded image as the face reference.
 * Returns an array of image URLs.
 */
export async function generateHeadshots(imageUrls: string[]): Promise<string[]> {
  const primaryImage = imageUrls[0] // Use first image as main face reference

  const allResults: string[] = []

  // Generate headshots for each style (10 per style = 50 total)
  for (const { style, bg } of HEADSHOT_STYLES) {
    const prompt = `professional corporate headshot photo of a person img, ${bg}, sharp focus, high resolution, business attire, confident expression, photorealistic`

    const output = await replicate.run(
      `tencentarc/photomaker:${PHOTOMAKER_VERSION}`,
      {
        input: {
          prompt,
          input_image: primaryImage,
          num_outputs: 10,
          guidance_scale: 5,
          negative_prompt:
            'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, cartoon, painting, illustration, drawing',
          style_name: style,
          style_strength_ratio: 20,
          num_inference_steps: 50,
        },
      }
    ) as string[]

    allResults.push(...output)
  }

  return allResults
}
