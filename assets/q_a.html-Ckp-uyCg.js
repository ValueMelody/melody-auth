import{_ as n,c as s,o as e,a}from"./app-Cd_Rl9ss.js";const i={},l=a(`<h1 id="common-questions" tabindex="-1"><a class="header-anchor" href="#common-questions"><span>Common Questions</span></a></h1><h2 id="how-to-verify-a-spa-access-token" tabindex="-1"><a class="header-anchor" href="#how-to-verify-a-spa-access-token"><span>How to verify a SPA access token</span></a></h2><p>When verifying a SPA access token that uses the RSA256 algorithm, you can obtain the public key by fetching the JWKS (JSON Web Key Set) from [Your auth server URL]/.well-known/jwks.json. Below is a code example demonstrating how to verify the token using the jwks-rsa library:</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { verify } from &#39;jsonwebtoken&#39;</span>
<span class="line">import jwksClient from &#39;jwks-rsa&#39; </span>
<span class="line"></span>
<span class="line">// Initialize JWKS client with the URL to fetch keys</span>
<span class="line">const client = jwksClient({ jwksUri: \`\${process.env.NEXT_PUBLIC_SERVER_URI}/.well-known/jwks.json\` })</span>
<span class="line"></span>
<span class="line">// Function to retrieve the signing key from the JWKS endpoint</span>
<span class="line">const getKey = (</span>
<span class="line">  header, callback,</span>
<span class="line">) =&gt; {</span>
<span class="line">  client.getSigningKey(</span>
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
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="how-to-support-a-new-locale" tabindex="-1"><a class="header-anchor" href="#how-to-support-a-new-locale"><span>How to support a new locale</span></a></h2><p>English (EN) and French (FR) are supported by default in this project. To add support for additional locales, follow these steps:</p><ul><li>Update the server/src/configs/locale.ts file, ensuring that translations for your new locale are provided.</li><li>Update the SUPPORTED_LOCALES environment variable to include your new locale in the array.</li></ul>`,7),c=[l];function r(t,d){return e(),s("div",null,c)}const o=n(i,[["render",r],["__file","q_a.html.vue"]]),v=JSON.parse('{"path":"/q_a.html","title":"Common Questions","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"How to verify a SPA access token","slug":"how-to-verify-a-spa-access-token","link":"#how-to-verify-a-spa-access-token","children":[]},{"level":2,"title":"How to support a new locale","slug":"how-to-support-a-new-locale","link":"#how-to-support-a-new-locale","children":[]}],"git":{"updatedTime":1724877022000,"contributors":[{"name":"Baozier","email":"byn9826@gmail.com","commits":2}]},"filePathRelative":"q&a.md"}');export{o as comp,v as data};
