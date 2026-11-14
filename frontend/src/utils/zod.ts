import { z } from 'zod'

// Zod normally probes for `new Function` to compile faster validators. The
// production Content-Security-Policy forbids eval, so the probe would only log
// a CSP violation; jitless mode skips it. Import `z` from here, not from 'zod'.
z.config({ jitless: true })

export { z }
