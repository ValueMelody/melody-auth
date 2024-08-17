import{_ as e,c as n,o as s,a}from"./app-QxJpWEps.js";const i={},t=a(`<h1 id="react-sdk" tabindex="-1"><a class="header-anchor" href="#react-sdk"><span>React SDK</span></a></h1><h2 id="installation" tabindex="-1"><a class="header-anchor" href="#installation"><span>Installation</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">npm install @melody-auth/react --save</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="authprovider" tabindex="-1"><a class="header-anchor" href="#authprovider"><span>AuthProvider</span></a></h2><p>Wrap your application inside AuthProvider component to provide the auth related context to your application components.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>clientId</td><td>string</td><td>The auth clientId your frontend connects to</td><td>N/A</td><td>Yes</td></tr><tr><td>redirectUri</td><td>string</td><td>The URL to redirect users after successful authentication</td><td>N/A</td><td>Yes</td></tr><tr><td>serverUri</td><td>string</td><td>The URL where you host the melody auth server</td><td>N/A</td><td>Yes</td></tr><tr><td>scopes</td><td>string[]</td><td>Permission scopes to request for user access</td><td>N/A</td><td>No</td></tr><tr><td>storage</td><td>&#39;sessionStorage&#39; | &#39;localStorage&#39;</td><td>Storage type for authentication tokens</td><td>&#39;localStorage&#39;</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { AuthProvider } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function RootLayout ({ children }: {</span>
<span class="line">  children: React.ReactNode;</span>
<span class="line">}) {</span>
<span class="line">  return (</span>
<span class="line">    &lt;html lang=&#39;en&#39;&gt;</span>
<span class="line">      &lt;AuthProvider</span>
<span class="line">        clientId={process.env.CLIENT_ID ?? &#39;&#39;}</span>
<span class="line">        redirectUri={process.env.REDIRECT_URI ?? &#39;&#39;}</span>
<span class="line">        serverUri={process.env.SERVER_URI ?? &#39;&#39;}</span>
<span class="line">      &gt;</span>
<span class="line">        &lt;body&gt;</span>
<span class="line">          {children}</span>
<span class="line">        &lt;/body&gt;</span>
<span class="line">      &lt;/AuthProvider&gt;</span>
<span class="line">    &lt;/html&gt;</span>
<span class="line">  )</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isauthenticated" tabindex="-1"><a class="header-anchor" href="#isauthenticated"><span>isAuthenticated</span></a></h2><p>Indicates if the current user is authenticated.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticating, isAuthenticated } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isAuthenticating) return &lt;Spinner /&gt;</span>
<span class="line">  if (isAuthenticated) return &lt;Button&gt;Logout&lt;/Button&gt;</span>
<span class="line">  if (!isAuthenticated) return &lt;Button&gt;Login&lt;/Button&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginredirect" tabindex="-1"><a class="header-anchor" href="#loginredirect"><span>loginRedirect</span></a></h2><p>Triggers a new authentication flow.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>Specifies the locale to use in the authentication flow</td><td>N/A</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticated, loginRedirect } = useAuth()</span>
<span class="line"></span>
<span class="line">  const handleLogin = () =&gt; {</span>
<span class="line">    loginRedirect()</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (!isAuthenticated) {</span>
<span class="line">    return &lt;Button onClick={handleLogin}&gt;Login&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="logoutredirect" tabindex="-1"><a class="header-anchor" href="#logoutredirect"><span>logoutRedirect</span></a></h2><p>Triggers the logout flow.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>postLogoutRedirectUri</td><td>string</td><td>The URL to redirect users after logout</td><td>N/A</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticated, logoutRedirect } = useAuth()</span>
<span class="line"></span>
<span class="line">  const handleLogout = () =&gt; {</span>
<span class="line">    logoutRedirect({ postLogoutRedirectUri: &#39;http://localhost:3000/&#39; })</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (isAuthenticated) {</span>
<span class="line">    return &lt;Button onClick={handleLogout}&gt;Logout&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquiretoken" tabindex="-1"><a class="header-anchor" href="#acquiretoken"><span>acquireToken</span></a></h2><p>Gets the user&#39;s accessToken, or refreshes it if expired.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticated, acquireToken } = useAuth()</span>
<span class="line"></span>
<span class="line">  const handleFetchUserInfo = () =&gt; {</span>
<span class="line">    const accessToken = await acquireToken()</span>
<span class="line">    await fetch(&#39;/...&#39;, {</span>
<span class="line">      headers: {</span>
<span class="line">        Authorization: \`Bearer \${accessToken}\`,</span>
<span class="line">      },</span>
<span class="line">    })</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (isAuthenticated) {</span>
<span class="line">    return &lt;Button onClick={handleFetchUserInfo}&gt;Fetch User Info&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquireuserinfo" tabindex="-1"><a class="header-anchor" href="#acquireuserinfo"><span>acquireUserInfo</span></a></h2><p>Gets the user&#39;s public info from the auth server.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticated, acquireUserInfo } = useAuth()</span>
<span class="line"></span>
<span class="line">  const handleFetchUserInfo = () =&gt; {</span>
<span class="line">    const userInfo = await acquireUserInfo()</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (isAuthenticated) {</span>
<span class="line">    return &lt;Button onClick={handleFetchUserInfo}&gt;Fetch User Info&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isauthenticating" tabindex="-1"><a class="header-anchor" href="#isauthenticating"><span>isAuthenticating</span></a></h2><p>Indicates whether the SDK is initializing and attempting to obtain the user&#39;s authentication state.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticating } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isAuthenticating) return &lt;Spinner /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isloadingtoken" tabindex="-1"><a class="header-anchor" href="#isloadingtoken"><span>isLoadingToken</span></a></h2><p>Indicates whether the SDK is acquiring token.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isLoadingToken } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isLoadingToken) return &lt;Spinner /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isloadinguserinfo" tabindex="-1"><a class="header-anchor" href="#isloadinguserinfo"><span>isLoadingUserInfo</span></a></h2><p>Indicates whether the SDK is acquiring user info.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isLoadingUserInfo } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isLoadingUserInfo) return &lt;Spinner /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="authenticationerror" tabindex="-1"><a class="header-anchor" href="#authenticationerror"><span>authenticationError</span></a></h2><p>Indicates whether there is an authentication process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { authenticationError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (authenticationError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquiretokenerror" tabindex="-1"><a class="header-anchor" href="#acquiretokenerror"><span>acquireTokenError</span></a></h2><p>Indicates whether there is an acquireToken process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { acquireTokenError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (acquireTokenError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquireuserinfoerror" tabindex="-1"><a class="header-anchor" href="#acquireuserinfoerror"><span>acquireUserInfoError</span></a></h2><p>Indicates whether there is an acquireUserInfo process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { acquireUserInfoError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (acquireUserInfoError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="account" tabindex="-1"><a class="header-anchor" href="#account"><span>account</span></a></h2><p>Decoded account information from id_token.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { account } = useAuth()</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginerror" tabindex="-1"><a class="header-anchor" href="#loginerror"><span>loginError</span></a></h2><p>Indicates whether there is an login process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { loginError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (loginError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="logouterror" tabindex="-1"><a class="header-anchor" href="#logouterror"><span>logoutError</span></a></h2><p>Indicates whether there is an login process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { logoutError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (logoutError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,51),l=[t];function r(d,c){return s(),n("div",null,l)}const o=e(i,[["render",r],["__file","react-sdk.html.vue"]]),p=JSON.parse('{"path":"/react-sdk.html","title":"React SDK","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Installation","slug":"installation","link":"#installation","children":[]},{"level":2,"title":"AuthProvider","slug":"authprovider","link":"#authprovider","children":[]},{"level":2,"title":"isAuthenticated","slug":"isauthenticated","link":"#isauthenticated","children":[]},{"level":2,"title":"loginRedirect","slug":"loginredirect","link":"#loginredirect","children":[]},{"level":2,"title":"logoutRedirect","slug":"logoutredirect","link":"#logoutredirect","children":[]},{"level":2,"title":"acquireToken","slug":"acquiretoken","link":"#acquiretoken","children":[]},{"level":2,"title":"acquireUserInfo","slug":"acquireuserinfo","link":"#acquireuserinfo","children":[]},{"level":2,"title":"isAuthenticating","slug":"isauthenticating","link":"#isauthenticating","children":[]},{"level":2,"title":"isLoadingToken","slug":"isloadingtoken","link":"#isloadingtoken","children":[]},{"level":2,"title":"isLoadingUserInfo","slug":"isloadinguserinfo","link":"#isloadinguserinfo","children":[]},{"level":2,"title":"authenticationError","slug":"authenticationerror","link":"#authenticationerror","children":[]},{"level":2,"title":"acquireTokenError","slug":"acquiretokenerror","link":"#acquiretokenerror","children":[]},{"level":2,"title":"acquireUserInfoError","slug":"acquireuserinfoerror","link":"#acquireuserinfoerror","children":[]},{"level":2,"title":"account","slug":"account","link":"#account","children":[]},{"level":2,"title":"loginError","slug":"loginerror","link":"#loginerror","children":[]},{"level":2,"title":"logoutError","slug":"logouterror","link":"#logouterror","children":[]}],"git":{"updatedTime":1723405770000,"contributors":[{"name":"Baozier","email":"byn9826@gmail.com","commits":7}]},"filePathRelative":"react-sdk.md"}');export{o as comp,p as data};
