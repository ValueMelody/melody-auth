import{_ as n,c as s,a,o as i}from"./app-CMVXRBCr.js";const l={};function r(t,e){return i(),s("div",null,e[0]||(e[0]=[a(`<h1 id="common-questions" tabindex="-1"><a class="header-anchor" href="#common-questions"><span>Common Questions</span></a></h1><h2 id="how-to-verify-a-spa-access-token" tabindex="-1"><a class="header-anchor" href="#how-to-verify-a-spa-access-token"><span>How to verify a SPA access token</span></a></h2><p>When verifying a SPA access token that uses the RSA256 algorithm, you can obtain the public key by fetching the JWKS (JSON Web Key Set) from [Your auth server URL]/.well-known/jwks.json. Below is a code example demonstrating how to verify the token using the jwks-rsa library:</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { verify } from &#39;jsonwebtoken&#39;</span>
<span class="line">import jwksClient from &#39;jwks-rsa&#39; </span>
<span class="line"></span>
<span class="line">// Initialize JWKS client with the URL to fetch keys</span>
<span class="line">const client = jwksClient({ jwksUri: \`\${process.env.NEXT_PUBLIC_SERVER_URI}/.well-known/jwks.json\` })</span>
<span class="line"></span>
<span class="line">// Function to retrieve the signing key from the JWKS endpoint</span>
<span class="line">const getKey = (</span>
<span class="line">  header, callback,</span>
<span class="line">) =&gt; {</span>
<span class="line">  return client.getSigningKey(</span>
<span class="line">    header.kid,</span>
<span class="line">    (</span>
<span class="line">      err, key,</span>
<span class="line">    ) =&gt; {</span>
<span class="line">      if (err) {</span>
<span class="line">        callback(err)</span>
<span class="line">      } else {</span>
<span class="line">        const signingKey = key.publicKey || key.rsaPublicKey</span>
<span class="line">        callback(</span>
<span class="line">          null,</span>
<span class="line">          signingKey,</span>
<span class="line">        )</span>
<span class="line">      }</span>
<span class="line">    },</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">// Function to verify the JWT token</span>
<span class="line">const verifyJwtToken = (token: string) =&gt; {</span>
<span class="line">  return new Promise((</span>
<span class="line">    resolve, reject,</span>
<span class="line">  ) =&gt; {</span>
<span class="line">    verify(</span>
<span class="line">      token,</span>
<span class="line">      getKey,</span>
<span class="line">      {},</span>
<span class="line">      (</span>
<span class="line">        err, decoded,</span>
<span class="line">      ) =&gt; {</span>
<span class="line">        if (err) {</span>
<span class="line">          reject(err)</span>
<span class="line">        } else {</span>
<span class="line">          resolve(decoded)</span>
<span class="line">        }</span>
<span class="line">      },</span>
<span class="line">    )</span>
<span class="line">  })</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">// Function to verify the access token from request headers</span>
<span class="line">export const verifyAccessToken = async () =&gt; {</span>
<span class="line">  const headersList = headers()</span>
<span class="line">  const authHeader = headersList.get(&#39;authorization&#39;)</span>
<span class="line">  const accessToken = authHeader?.split(&#39; &#39;)[1]</span>
<span class="line"></span>
<span class="line">  if (!accessToken) return false</span>
<span class="line"></span>
<span class="line">  const tokenBody = await verifyJwtToken(accessToken)</span>
<span class="line"></span>
<span class="line">  if (!tokenBody) return false</span>
<span class="line"></span>
<span class="line">  return true</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="how-to-support-a-new-locale" tabindex="-1"><a class="header-anchor" href="#how-to-support-a-new-locale"><span>How to support a new locale</span></a></h2><p>English (EN) and French (FR) are supported by default in this project. To add support for additional locales, follow these steps:</p><ul><li>Update the server/src/configs/locale.ts file, ensuring that translations for your new locale are provided.</li><li>Update the SUPPORTED_LOCALES environment variable to include your new locale in the array.</li></ul><h2 id="how-to-rotate-jwt-secret" tabindex="-1"><a class="header-anchor" href="#how-to-rotate-jwt-secret"><span>How to rotate JWT secret</span></a></h2><p>To rotate your JWT secret, follow these steps:</p><ol><li><p>Generate a New JWT Secret:<br> Run the secret generation script based on your environment.<br> After running these commands, a new pair of JWT secrets will take effect. Your old JWT secret will be marked as deprecated. This means the old secret will no longer be used to sign new tokens, but existing tokens signed with the old secret will still be verified.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">cd server</span>
<span class="line">npm run node:secret:generate # For node env</span>
<span class="line">npm run dev:secret:generate # For Cloudflare local env</span>
<span class="line">npm run prod:secret:generate # For Cloudflare remote env</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>Clean the Old Secret:<br> Run the secret clean script whenever you want to stop verifying tokens signed with the old secret. After running these commands, the old secret will be removed, and any tokens signed with the old secret will no longer be valid.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">cd server</span>
<span class="line">npm run node:secret:clean # For node env</span>
<span class="line">npm run dev:secret:clean # For Cloudflare local env</span>
<span class="line">npm run prod:secret:clean # For Cloudflare remote env</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li></ol><h2 id="how-to-setup-mfa" tabindex="-1"><a class="header-anchor" href="#how-to-setup-mfa"><span>How to setup MFA</span></a></h2><ul><li>Enforcing specific MFA types: You can set OTP_MFA_IS_REQUIRED, SMS_MFA_IS_REQUIRED, or EMAIL_MFA_IS_REQUIRED to true to enforce those MFA methods as a login requirement.</li><li>Letting users choose one of the supported MFA types: If OTP_MFA_IS_REQUIRED, SMS_MFA_IS_REQUIRED, and EMAIL_MFA_IS_REQUIRED are all set to false, you can set ENFORCE_ONE_MFA_ENROLLMENT to contain the MFA types you want to support. The user will then be required to enroll in one of the selected MFA types.</li><li>You can also use the MFA enrollment functionality provided by the admin panel or the S2S API to customize your MFA enrollment flow.</li></ul><h2 id="how-to-trigger-a-different-policy" tabindex="-1"><a class="header-anchor" href="#how-to-trigger-a-different-policy"><span>How to trigger a different policy</span></a></h2><ul><li>To trigger a different policy, add policy=[policy] as a query string when redirecting the user to the authorization page.<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">  const url = serverUri +</span>
<span class="line">    &#39;/oauth2/v1/authorize?&#39; +</span>
<span class="line">    &#39;response_type=code&#39; +</span>
<span class="line">    &#39;&amp;state=&#39; + state +</span>
<span class="line">    &#39;&amp;client_id=&#39; + clientId +</span>
<span class="line">    &#39;&amp;redirect_uri=&#39; + redirectUri +</span>
<span class="line">    &#39;&amp;code_challenge=&#39; + codeChallenge +</span>
<span class="line">    &#39;&amp;code_challenge_method=S256&#39; +</span>
<span class="line">    &#39;&amp;policy=&#39; + policy +</span>
<span class="line">    &#39;&amp;scope=&#39; + scope +</span>
<span class="line">    &#39;&amp;locale=&#39; + locale</span>
<span class="line">  window.location.href = url</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li>When using the React SDK, you can trigger the loginRedirect function with a policy parameter:<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const { loginRedirect } = useAuth()</span>
<span class="line"></span>
<span class="line">loginRedirect({</span>
<span class="line">  policy: &#39;change_password&#39;,</span>
<span class="line">})</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li>Supported Policies <ul><li>sign_in_or_sign_up: Default policy.</li><li>update_info: Allows users to update their information.</li><li>change_password: Allows users to change their password (for password-based users only). Requires ENABLE_PASSWORD_RESET to be set to true in the configuration.</li><li>change_email: Allows users to change their email address (for password-based users only). Requires ENABLE_EMAIL_VERIFICATION to be set to true in the configuration.</li><li>reset_mfa: Allows users to reset their enrolled MFA (Multi-Factor Authentication) method.</li><li>manage_passkey: Allows users to manage their passkey. Requires ALLOW_PASSKEY_ENROLLMENT to be set to true in the configuration.</li></ul></li></ul><h2 id="how-to-change-theme-branding-for-authorization-pages" tabindex="-1"><a class="header-anchor" href="#how-to-change-theme-branding-for-authorization-pages"><span>How to change theme/branding for authorization pages</span></a></h2><ul><li>You can change the default theme/branding by setting the <code>DefaultBranding</code> variable in server/src/configs/variable.ts.</li><li>In case you want to use different theme/branding for different clients <ul><li>set ENABLE_ORG to true in server/wrangler.toml</li><li>create a new org in the admin panel, with a unique slug</li><li>update the theme/branding for the org you just created in the admin panel</li><li>trigger a login redirect to the authorization page with the org=[slug] as query string</li></ul></li></ul>`,16)]))}const o=n(l,[["render",r]]),d=JSON.parse('{"path":"/q_a.html","title":"Common Questions","lang":"en-US","frontmatter":{},"git":{"updatedTime":1744426336000,"contributors":[{"name":"Baozier","username":"Baozier","email":"byn9826@gmail.com","commits":10,"url":"https://github.com/Baozier"}],"changelog":[{"hash":"1de79ce15fa8c1f80735a6a2fd5599b92a5b2577","time":1744426336000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add doc for how to customize branding (#299)","tag":"v1.2.6"},{"hash":"aae4d95e8433a742b28daad51ebcbe978e83d7bf","time":1739329461000,"email":"byn9826@gmail.com","author":"Baozier","message":"Support update user info through policy (#225)"},{"hash":"dab232c28ad153e90129d65b72ad543d428b9685","time":1739055609000,"email":"byn9826@gmail.com","author":"Baozier","message":"Update docs structure (#223)","tag":"v1.1.6"},{"hash":"510754787c966d06cdcfa188333b8816de1f496b","time":1739041389000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add manage_passkey policy (#222)"},{"hash":"51d7a7e93d4439340cc642f6eeb680f2b6168e36","time":1733194397000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add screenshots and update doc for supported policies (#197)"},{"hash":"2cffc8969ef12e367cb0caa78e545107191f80d7","time":1730941938000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add docs for how to trigger a policy (#189)","tag":"v1.1.0"},{"hash":"149cf7efad817dd4c9cf11b491321f58946562f9","time":1727388619000,"email":"byn9826@gmail.com","author":"Baozier","message":"Manage sms mfa through admin panel and s2s api (#173)"},{"hash":"b1b97b7e8af43a423fca07d543b4549dbb2ec9ac","time":1725934571000,"email":"byn9826@gmail.com","author":"Baozier","message":"Support jwt secret rotate (#149)","tag":"v1.0.1"},{"hash":"8159c9c939baca22eb8330fd741bc9122e64dd27","time":1724877022000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add more tests for locale support (#131)"},{"hash":"80876958a62dff3365f57aeab46b04c6e8d9dbe3","time":1723340760000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add doc for how to verify SPA accessToken (#88)"}]},"filePathRelative":"q&a.md"}');export{o as comp,d as data};
