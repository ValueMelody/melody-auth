import{_ as n,c as s,a,o as i}from"./app-BTCWvB3H.js";const t={};function l(r,e){return i(),s("div",null,e[0]||(e[0]=[a(`<h1 id="react-sdk" tabindex="-1"><a class="header-anchor" href="#react-sdk"><span>React SDK</span></a></h1><h2 id="installation" tabindex="-1"><a class="header-anchor" href="#installation"><span>Installation</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">npm install @melody-auth/react --save</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="authprovider" tabindex="-1"><a class="header-anchor" href="#authprovider"><span>AuthProvider</span></a></h2><p>Wrap your application inside AuthProvider component to provide the auth related context to your application components.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>clientId</td><td>string</td><td>The auth clientId your frontend connects to</td><td>N/A</td><td>Yes</td></tr><tr><td>redirectUri</td><td>string</td><td>The URL to redirect users after successful authentication</td><td>N/A</td><td>Yes</td></tr><tr><td>serverUri</td><td>string</td><td>The URL where you host the melody auth server</td><td>N/A</td><td>Yes</td></tr><tr><td>scopes</td><td>string[]</td><td>Permission scopes to request for user access</td><td>N/A</td><td>No</td></tr><tr><td>storage</td><td>&#39;sessionStorage&#39; | &#39;localStorage&#39;</td><td>Storage type for authentication tokens</td><td>&#39;localStorage&#39;</td><td>No</td></tr><tr><td>onLoginSuccess</td><td>(attr: { locale?: string; state?: string }) =&gt; void</td><td>Function to execute after a successful login</td><td>N/A</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { AuthProvider } from &#39;@melody-auth/react&#39;</span>
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
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isauthenticated" tabindex="-1"><a class="header-anchor" href="#isauthenticated"><span>isAuthenticated</span></a></h2><p>Indicates if the current user is authenticated.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticating, isAuthenticated } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isAuthenticating) return &lt;Spinner /&gt;</span>
<span class="line">  if (isAuthenticated) return &lt;Button&gt;Logout&lt;/Button&gt;</span>
<span class="line">  if (!isAuthenticated) return &lt;Button&gt;Login&lt;/Button&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginredirect" tabindex="-1"><a class="header-anchor" href="#loginredirect"><span>loginRedirect</span></a></h2><p>Triggers a new authentication flow by redirecting to the auth server.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>Specifies the locale to use in the authentication flow</td><td>N/A</td><td>No</td></tr><tr><td>state</td><td>string</td><td>Specifies the state to use in the authentication flow if you prefer not to use a randomly generated string</td><td>N/A</td><td>No</td></tr><tr><td>policy</td><td>string</td><td>Specifies the policy to use in the authentication flow</td><td>&#39;sign_in_or_sign_up&#39;</td><td>No</td></tr><tr><td>org</td><td>string</td><td>Specifies the organization to use in the authentication flow, the value should be the slug of the organization</td><td>N/A</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticated, loginRedirect } = useAuth()</span>
<span class="line"></span>
<span class="line">  const handleLogin = () =&gt; {</span>
<span class="line">    loginRedirect({</span>
<span class="line">      locale: &#39;en&#39;,</span>
<span class="line">      state: JSON.stringify({ info: Math.random() })</span>
<span class="line">    })</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (!isAuthenticated) {</span>
<span class="line">    return &lt;Button onClick={handleLogin}&gt;Login&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginpopup" tabindex="-1"><a class="header-anchor" href="#loginpopup"><span>loginPopup</span></a></h2><p>Triggers a new authentication flow in a popup.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>Specifies the locale to use in the authentication flow</td><td>N/A</td><td>No</td></tr><tr><td>state</td><td>string</td><td>Specifies the state to use in the authentication flow if you prefer not to use a randomly generated string</td><td>N/A</td><td>No</td></tr><tr><td>org</td><td>string</td><td>Specifies the organization to use in the authentication flow, the value should be the slug of the organization</td><td>N/A</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticated, loginPopup } = useAuth()</span>
<span class="line"></span>
<span class="line">  const handleLogin = () =&gt; {</span>
<span class="line">    loginPopup({</span>
<span class="line">      locale: &#39;en&#39;,</span>
<span class="line">      state: JSON.stringify({ info: Math.random() })</span>
<span class="line">    })</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (!isAuthenticated) {</span>
<span class="line">    return &lt;Button onClick={handleLogin}&gt;Login&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="logoutredirect" tabindex="-1"><a class="header-anchor" href="#logoutredirect"><span>logoutRedirect</span></a></h2><p>Triggers the logout flow.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>postLogoutRedirectUri</td><td>string</td><td>The URL to redirect users after logout</td><td>N/A</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
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
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquiretoken" tabindex="-1"><a class="header-anchor" href="#acquiretoken"><span>acquireToken</span></a></h2><p>Gets the user&#39;s accessToken, or refreshes it if expired.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticated, acquireToken } = useAuth()</span>
<span class="line"></span>
<span class="line">  const handleFetchUserInfo = () =&gt; {</span>
<span class="line">    const accessToken = await acquireToken()</span>
<span class="line">    // Use the token to fetch protected resources</span>
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
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquireuserinfo" tabindex="-1"><a class="header-anchor" href="#acquireuserinfo"><span>acquireUserInfo</span></a></h2><p>Gets the user&#39;s public info from the auth server.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
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
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="userinfo" tabindex="-1"><a class="header-anchor" href="#userinfo"><span>userInfo</span></a></h2><p>The current user&#39;s details. Be sure to invoke acquireUserInfo before accessing userInfo.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { userInfo } = useAuth()</span>
<span class="line"></span>
<span class="line">  &lt;div&gt;{JSON.stringify(userInfo)}&lt;/div&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isauthenticating" tabindex="-1"><a class="header-anchor" href="#isauthenticating"><span>isAuthenticating</span></a></h2><p>Indicates whether the SDK is initializing and attempting to obtain the user&#39;s authentication state.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticating } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isAuthenticating) return &lt;Spinner /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isloadingtoken" tabindex="-1"><a class="header-anchor" href="#isloadingtoken"><span>isLoadingToken</span></a></h2><p>Indicates whether the SDK is acquiring token.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isLoadingToken } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isLoadingToken) return &lt;Spinner /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isloadinguserinfo" tabindex="-1"><a class="header-anchor" href="#isloadinguserinfo"><span>isLoadingUserInfo</span></a></h2><p>Indicates whether the SDK is acquiring user info.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isLoadingUserInfo } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isLoadingUserInfo) return &lt;Spinner /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="authenticationerror" tabindex="-1"><a class="header-anchor" href="#authenticationerror"><span>authenticationError</span></a></h2><p>Indicates whether there is an authentication process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { authenticationError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (authenticationError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquiretokenerror" tabindex="-1"><a class="header-anchor" href="#acquiretokenerror"><span>acquireTokenError</span></a></h2><p>Indicates whether there is an acquireToken process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { acquireTokenError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (acquireTokenError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquireuserinfoerror" tabindex="-1"><a class="header-anchor" href="#acquireuserinfoerror"><span>acquireUserInfoError</span></a></h2><p>Indicates whether there is an acquireUserInfo process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { acquireUserInfoError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (acquireUserInfoError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="idtoken" tabindex="-1"><a class="header-anchor" href="#idtoken"><span>idToken</span></a></h2><p>The id_token of the current user.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { idToken } = useAuth()</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="account" tabindex="-1"><a class="header-anchor" href="#account"><span>account</span></a></h2><p>Decoded account information from id_token.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { account } = useAuth()</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginerror" tabindex="-1"><a class="header-anchor" href="#loginerror"><span>loginError</span></a></h2><p>Indicates whether there is an login process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { loginError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (loginError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="logouterror" tabindex="-1"><a class="header-anchor" href="#logouterror"><span>logoutError</span></a></h2><p>Indicates whether there is an login process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { logoutError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (logoutError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,61)]))}const c=n(t,[["render",l]]),o=JSON.parse('{"path":"/react-sdk.html","title":"React SDK","lang":"en-US","frontmatter":{},"git":{"updatedTime":1745898277000,"contributors":[{"name":"Baozier","username":"Baozier","email":"byn9826@gmail.com","commits":14,"url":"https://github.com/Baozier"}],"changelog":[{"hash":"ba72a1c20806e31ae16be18f2593e2ec602d5e7e","time":1745898277000,"email":"byn9826@gmail.com","author":"Baozier","message":"Exposure idToken from sdks (#340)"},{"hash":"1de79ce15fa8c1f80735a6a2fd5599b92a5b2577","time":1744426336000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add doc for how to customize branding (#299)","tag":"v1.2.6"},{"hash":"a5d2ea53baf6745787853bdf5c8a83c4b68cd248","time":1742010392000,"email":"byn9826@gmail.com","author":"Baozier","message":"Exposure userInfo directly from react-sdk and use in admin-panel (#266)"},{"hash":"dfab4ec2f967fd41a982ec46405efe2f0604329e","time":1741821787000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add vue sdk package @melody-auth/vue (#260)"},{"hash":"dcc7904d45937761251f8fe19254c40c61c15711","time":1739930974000,"email":"byn9826@gmail.com","author":"Baozier","message":"Support login with popup in react-sdk (#233)"},{"hash":"2cffc8969ef12e367cb0caa78e545107191f80d7","time":1730941938000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add docs for how to trigger a policy (#189)","tag":"v1.1.0"},{"hash":"84e6126d4d32fc04825dc55dd506e5a1a09e2ab5","time":1726794251000,"email":"byn9826@gmail.com","author":"Baozier","message":"Allow set and load state during login redirect (#163)"},{"hash":"155079ce08bb29f776a1cac7bd21e984f8ba88c5","time":1723405770000,"email":"byn9826@gmail.com","author":"Baozier","message":"Decode id_token as account in react sdk (#95)"},{"hash":"5804351a18bc976430f49e83543ec0a9eea480a6","time":1723336999000,"email":"byn9826@gmail.com","author":"Baozier","message":"Full locale support for identity pages and emails (#85)"},{"hash":"d265a44f90805217c6ec87dc91039de176ef8813","time":1723065969000,"email":"byn9826@gmail.com","author":"Baozier","message":"Default refresh token storage to localStorage (#79)"},{"hash":"e382551b92e0befd63ebfd7589710ceb5746c342","time":1722648544000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add loading effect when manage resources in admin panel (#64)"},{"hash":"300dcd66ab1f55330473a42d3e830126b75a3fc7","time":1722545376000,"email":"byn9826@gmail.com","author":"Baozier","message":"Export more loading and error state from react-sdk (#61)"},{"hash":"7a3a2e2e84aa4f2e5d66c7b0f4830abb4ed9a72b","time":1722476406000,"email":"byn9826@gmail.com","author":"Baozier","message":"Exposure isLoading state when react sdk is fetching user info (#59)"},{"hash":"c667eebfc475caf5e63d9676f6201d086086fd97","time":1721333760000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add doc for react-sdk (#24)"}]},"filePathRelative":"react-sdk.md"}');export{c as comp,o as data};
