/**
 * Page render tests — server-renders every page component through React
 * and asserts key content is present (and fake content is gone).
 */
import React from 'react'

let failures = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.log(`  FAIL  ${name} ${detail}`) }
}

// ---- stub next/link and next/navigation (pages render outside the Next runtime) ----
function stubModule(name: string, exports: unknown) {
  const path = require.resolve(name)
  // @ts-expect-error constructing a minimal Module record
  require.cache[path] = { id: path, filename: path, loaded: true, exports }
}
stubModule('next/link', {
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    React.createElement('a', { href: props.href as string, className: props.className as string }, props.children as React.ReactNode),
})
stubModule('next/navigation', {
  __esModule: true,
  useSearchParams: () =>
    new URLSearchParams({
      session_id: 'sess-1',
      email: 'buyer@example.com',
      prediction_id: 'pred-1',
      preview_url: encodeURIComponent('https://replicate.delivery/fake/preview.jpg'),
      tier: 'premium',
    }),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
})

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { renderToString } = require('react-dom/server')

function render(name: string, mod: string): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Page = require(mod).default
  try {
    return renderToString(React.createElement(Page))
  } catch (e) {
    failures++
    console.log(`  FAIL  ${name} threw during render: ${e}`)
    return ''
  }
}

console.log('\nLanding page (/):')
const landing = render('landing', '../app/page')
check('renders', landing.length > 1000)
check('brand present', landing.includes('SnapShot'))
check('trust promise present', landing.includes('Preview before you pay'))
check('all three price points shown', landing.includes('$9.99') && landing.includes('$19.99') && landing.includes('$24.99'))
check('privacy + terms linked', landing.includes('/privacy') && landing.includes('/terms'))
check('NO fake stock avatars (pravatar)', !landing.includes('pravatar'))
check('NO fabricated social proof', !landing.includes('2,400'))
check('FAQ covers photo privacy', landing.includes('What happens to my uploaded photos'))

console.log('\nUpload page (/upload):')
const upload = render('upload', '../app/upload/page')
check('renders', upload.includes('Upload Your Photos'))
check('free-preview CTA present', upload.includes('Generate Free Preview'))
check('photo tips present', upload.includes('Good natural lighting'))
check('deletion promise present', upload.includes('deleted within 24 hours'))

console.log('\nPreview page (/preview):')
const preview = render('preview', '../app/preview/page')
check('renders with session params', preview.includes('Your Preview Is Ready'))
check('all tiers selectable', preview.includes('1 Headshot') && preview.includes('15 Headshots') && preview.includes('30 Headshots'))
check('delivery email shown', preview.includes('buyer@example.com'))

console.log('\nSuccess page (/success):')
const success = render('success', '../app/success/page')
check('renders', success.includes('Payment Confirmed'))
check('no stale "50 headshots" claim', !success.includes('50 professional'))

console.log('\nPrivacy page (/privacy):')
const privacy = render('privacy', '../app/privacy/page')
check('renders', privacy.includes('Privacy Policy'))
check('24h deletion policy stated', privacy.includes('24 hours'))

console.log('\nTerms page (/terms):')
const terms = render('terms', '../app/terms/page')
check('renders', terms.includes('Terms of Service'))
check('commercial license stated', terms.includes('commercial-use license'))

console.log(failures === 0 ? '\nALL RENDER TESTS PASSED' : `\n${failures} TEST(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
