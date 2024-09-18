import{_ as e,c as n,o as s,a}from"./app-CY33o2qe.js";const i={},l=a(`<h1 id="common-questions" tabindex="-1"><a class="header-anchor" href="#common-questions"><span>Common Questions</span></a></h1><h2 id="how-to-verify-a-spa-access-token" tabindex="-1"><a class="header-anchor" href="#how-to-verify-a-spa-access-token"><span>How to verify a SPA access token</span></a></h2><p>When verifying a SPA access token that uses the RSA256 algorithm, you can obtain the public key by fetching the JWKS (JSON Web Key Set) from [Your auth server URL]/.well-known/jwks.json. Below is a code example demonstrating how to verify the token using the jwks-rsa library:</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { verify } from &#39;jsonwebtoken&#39;</span>
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
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="how-to-support-a-new-locale" tabindex="-1"><a class="header-anchor" href="#how-to-support-a-new-locale"><span>How to support a new locale</span></a></h2><p>English (EN) and French (FR) are supported by default in this project. To add support for additional locales, follow these steps:</p><ul><li>Update the server/src/configs/locale.ts file, ensuring that translations for your new locale are provided.</li><li>Update the SUPPORTED_LOCALES environment variable to include your new locale in the array.</li></ul><h2 id="how-to-rotate-jwt-secret" tabindex="-1"><a class="header-anchor" href="#how-to-rotate-jwt-secret"><span>How to rotate JWT secret</span></a></h2><p>To rotate your JWT secret, follow these steps:</p><ol><li>Generate a New JWT Secret Run the secret generation script based on your environment:</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">cd server</span>
<span class="line">npm run node:secret:generate # For node env</span>
<span class="line">npm run dev:secret:generate # For Cloudflare local env</span>
<span class="line">npm run prod:secret:generate # For Cloudflare remote env</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>After running these commands, a new pair of JWT secrets will take effect. Your old JWT secret will be marked as deprecated. This means the old secret will no longer be used to sign new tokens, but existing tokens signed with the old secret will still be verified.</p><ol start="2"><li>Clean the Old Secret Run the secret clean script whenever you want to stop verifying tokens signed with the old secret:</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">cd server</span>
<span class="line">npm run node:secret:clean # For node env</span>
<span class="line">npm run dev:secret:clean # For Cloudflare local env</span>
<span class="line">npm run prod:secret:clean # For Cloudflare remote env</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>After running these commands, the old secret will be removed, and any tokens signed with the old secret will no longer be valid.</p>`,15),t=[l];function r(c,d){return s(),n("div",null,t)}const p=e(i,[["render",r],["__file","q_a.html.vue"]]),v=JSON.parse('{"path":"/q_a.html","title":"Common Questions","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"How to verify a SPA access token","slug":"how-to-verify-a-spa-access-token","link":"#how-to-verify-a-spa-access-token","children":[]},{"level":2,"title":"How to support a new locale","slug":"how-to-support-a-new-locale","link":"#how-to-support-a-new-locale","children":[]},{"level":2,"title":"How to rotate JWT secret","slug":"how-to-rotate-jwt-secret","link":"#how-to-rotate-jwt-secret","children":[]}],"git":{"updatedTime":1725934571000,"contributors":[{"name":"Baozier","email":"byn9826@gmail.com","commits":3}]},"filePathRelative":"q&a.md"}');export{p as comp,v as data};