import{_ as s,e,f as i,o as a}from"./app-DIXxwoTd.js";const t={};function l(r,n){return a(),e("div",null,n[0]||(n[0]=[i(`<h1 id="vue-sdk" tabindex="-1"><a class="header-anchor" href="#vue-sdk"><span>Vue SDK</span></a></h1><h2 id="installation" tabindex="-1"><a class="header-anchor" href="#installation"><span>Installation</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">npm install @melody-auth/vue --save</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="authprovider" tabindex="-1"><a class="header-anchor" href="#authprovider"><span>AuthProvider</span></a></h2><p>Wrap your application inside AuthProvider component to provide the auth related context to your application components.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>clientId</td><td>string</td><td>The auth clientId your frontend connects to</td><td>N/A</td><td>Yes</td></tr><tr><td>redirectUri</td><td>string</td><td>The URL to redirect users after successful authentication</td><td>N/A</td><td>Yes</td></tr><tr><td>serverUri</td><td>string</td><td>The URL where you host the melody auth server</td><td>N/A</td><td>Yes</td></tr><tr><td>scopes</td><td>string[]</td><td>Permission scopes to request for user access</td><td>N/A</td><td>No</td></tr><tr><td>storage</td><td>&#39;sessionStorage&#39; | &#39;localStorage&#39;</td><td>Storage type for authentication tokens</td><td>&#39;localStorage&#39;</td><td>No</td></tr><tr><td>onLoginSuccess</td><td>(attr: { locale?: string; state?: string }) =&gt; void</td><td>Function to execute after a successful login</td><td>N/A</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { createApp } from &#39;vue&#39;</span>
<span class="line">import { AuthProvider } from &#39;@melody-auth/vue&#39;</span>
<span class="line">import App from &#39;./App.vue&#39;</span>
<span class="line"></span>
<span class="line">const app = createApp(App)</span>
<span class="line"></span>
<span class="line">app.use(</span>
<span class="line">  AuthProvider,</span>
<span class="line">  {</span>
<span class="line">    clientId: import.meta.env.VITE_AUTH_SPA_CLIENT_ID,</span>
<span class="line">    redirectUri: import.meta.env.VITE_CLIENT_URI,</span>
<span class="line">    serverUri: import.meta.env.VITE_AUTH_SERVER_URI,</span>
<span class="line">    storage: &#39;localStorage&#39;,</span>
<span class="line">  },</span>
<span class="line">)</span>
<span class="line"></span>
<span class="line">app.mount(&#39;#app&#39;)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isauthenticated" tabindex="-1"><a class="header-anchor" href="#isauthenticated"><span>isAuthenticated</span></a></h2><p>Indicates if the current user is authenticated.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { isAuthenticated } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;isAuthenticating&quot;&gt;</span>
<span class="line">    &lt;Spinner /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">  &lt;div v-else&gt;</span>
<span class="line">    &lt;div v-if=&quot;isAuthenticated&quot;&gt;</span>
<span class="line">      &lt;button</span>
<span class="line">        Logout</span>
<span class="line">      &lt;/button&gt;</span>
<span class="line">    &lt;/div&gt;</span>
<span class="line">    &lt;div v-else&gt;</span>
<span class="line">      &lt;button&gt;</span>
<span class="line">        Login</span>
<span class="line">      &lt;/button&gt;</span>
<span class="line">    &lt;/div&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="loginredirect" tabindex="-1"><a class="header-anchor" href="#loginredirect"><span>loginRedirect</span></a></h3><p>Triggers a new authentication flow by redirecting to the auth server.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>Specifies the locale to use in the authentication flow</td><td>N/A</td><td>No</td></tr><tr><td>state</td><td>string</td><td>Specifies the state to use in the authentication flow if you prefer not to use a randomly generated string</td><td>N/A</td><td>No</td></tr><tr><td>policy</td><td>string</td><td>Specifies the policy to use in the authentication flow</td><td>&#39;sign_in_or_sign_up&#39;</td><td>No</td></tr><tr><td>org</td><td>string</td><td>Specifies the organization to use in the authentication flow</td><td>N/A</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { loginRedirect } = useAuth()</span>
<span class="line"></span>
<span class="line">function handleLogin() {</span>
<span class="line">  loginRedirect({ locale: &#39;en&#39; })</span>
<span class="line">}</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;button @click=&quot;handleLogin&quot;&gt;</span>
<span class="line">    Login with Redirect</span>
<span class="line">  &lt;/button&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="loginpopup" tabindex="-1"><a class="header-anchor" href="#loginpopup"><span>loginPopup</span></a></h3><p>Triggers a new authentication flow in a popup.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>Specifies the locale to use in the authentication flow</td><td>N/A</td><td>No</td></tr><tr><td>state</td><td>string</td><td>Specifies the state to use in the authentication flow if you prefer not to use a randomly generated string</td><td>N/A</td><td>No</td></tr><tr><td>org</td><td>string</td><td>Specifies the organization to use in the authentication flow</td><td>N/A</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { loginPopup } = useAuth()</span>
<span class="line"></span>
<span class="line">function handleLogin() {</span>
<span class="line">  loginPopup({ locale: &#39;en&#39; })</span>
<span class="line">}</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;button @click=&quot;handleLogin&quot;&gt;</span>
<span class="line">    Login with Popup</span>
<span class="line">  &lt;/button&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="logoutredirect" tabindex="-1"><a class="header-anchor" href="#logoutredirect"><span>logoutRedirect</span></a></h3><p>Triggers the logout flow.</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th><th>Required</th></tr></thead><tbody><tr><td>postLogoutRedirectUri</td><td>string</td><td>The URL to redirect users after logout</td><td>N/A</td><td>No</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { logoutRedirect } = useAuth()</span>
<span class="line"></span>
<span class="line">function handleLogout() {</span>
<span class="line">  logoutRedirect({ postLogoutRedirectUri: &#39;http://localhost:3000/&#39; })</span>
<span class="line">}</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;button @click=&quot;handleLogout&quot;&gt;</span>
<span class="line">    Logout</span>
<span class="line">  &lt;/button&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="acquiretoken" tabindex="-1"><a class="header-anchor" href="#acquiretoken"><span>acquireToken</span></a></h3><p>Gets the user&#39;s access token, or refreshes it if expired.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { acquireToken, isAuthenticated } = useAuth()</span>
<span class="line"></span>
<span class="line">async function fetchUserInfo() {</span>
<span class="line">  const token = await acquireToken()</span>
<span class="line">  // Use the token to fetch protected resources</span>
<span class="line">  await fetch(&#39;/...&#39;, {</span>
<span class="line">    headers: {</span>
<span class="line">      Authorization: \`Bearer \${accessToken}\`,</span>
<span class="line">    },</span>
<span class="line">  })</span>
<span class="line">}</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;button v-if=&quot;isAuthenticated&quot; @click=&quot;fetchUserInfo&quot;&gt;</span>
<span class="line">    Fetch User Info</span>
<span class="line">  &lt;/button&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="acquireuserinfo" tabindex="-1"><a class="header-anchor" href="#acquireuserinfo"><span>acquireUserInfo</span></a></h3><p>Gets the user&#39;s public info from the auth server.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { acquireUserInfo, isAuthenticated } = useAuth()</span>
<span class="line"></span>
<span class="line">async function fetchPublicInfo() {</span>
<span class="line">  const userInfo = await acquireUserInfo()</span>
<span class="line">  console.log(userInfo)</span>
<span class="line">}</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;button v-if=&quot;isAuthenticated&quot; @click=&quot;fetchPublicInfo&quot;&gt;</span>
<span class="line">    Fetch Public User Info</span>
<span class="line">  &lt;/button&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="isauthenticating" tabindex="-1"><a class="header-anchor" href="#isauthenticating"><span>isAuthenticating</span></a></h3><p>Indicates whether the SDK is initializing and attempting to obtain the user&#39;s authentication state.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { isAuthenticating } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;isAuthenticating&quot;&gt;</span>
<span class="line">    &lt;Spinner /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="isloadingtoken" tabindex="-1"><a class="header-anchor" href="#isloadingtoken"><span>isLoadingToken</span></a></h3><p>Indicates whether the SDK is acquiring the token.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { isLoadingToken } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;isLoadingToken&quot;&gt;</span>
<span class="line">    &lt;Spinner /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="isloadinguserinfo" tabindex="-1"><a class="header-anchor" href="#isloadinguserinfo"><span>isLoadingUserInfo</span></a></h3><p>Indicates whether the SDK is acquiring the user&#39;s information.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { isLoadingUserInfo } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;isLoadingUserInfo&quot;&gt;</span>
<span class="line">    &lt;Spinner /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="authenticationerror" tabindex="-1"><a class="header-anchor" href="#authenticationerror"><span>authenticationError</span></a></h3><p>Indicates whether there is an error during authentication.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { authenticationError } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;authenticationError&quot;&gt;</span>
<span class="line">    &lt;Alert message=&quot;Authentication error&quot; /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="acquiretokenerror" tabindex="-1"><a class="header-anchor" href="#acquiretokenerror"><span>acquireTokenError</span></a></h3><p>Indicates whether there is an error during token acquisition.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { acquireTokenError } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;acquireTokenError&quot;&gt;</span>
<span class="line">    &lt;Alert message=&quot;Error acquiring token&quot; /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="acquireuserinfoerror" tabindex="-1"><a class="header-anchor" href="#acquireuserinfoerror"><span>acquireUserInfoError</span></a></h3><p>Indicates whether there is an error while acquiring user information.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { acquireUserInfoError } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;acquireUserInfoError&quot;&gt;</span>
<span class="line">    &lt;Alert message=&quot;Error acquiring user info&quot; /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="account" tabindex="-1"><a class="header-anchor" href="#account"><span>account</span></a></h3><p>Decoded account information from the id_token.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { account } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div&gt;</span>
<span class="line">    &lt;pre&gt;{{ account }}&lt;/pre&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="loginerror" tabindex="-1"><a class="header-anchor" href="#loginerror"><span>loginError</span></a></h3><p>Indicates whether there is a login process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { loginError } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;loginError&quot;&gt;</span>
<span class="line">    &lt;Alert message=&quot;Login error&quot; /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="logouterror" tabindex="-1"><a class="header-anchor" href="#logouterror"><span>logoutError</span></a></h3><p>Indicates whether there is a logout process related error.</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { logoutError } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;logoutError&quot;&gt;</span>
<span class="line">    &lt;Alert message=&quot;Logout error&quot; /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,55)]))}const c=s(t,[["render",l],["__file","vue-sdk.html.vue"]]),p=JSON.parse('{"path":"/vue-sdk.html","title":"Vue SDK","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Installation","slug":"installation","link":"#installation","children":[]},{"level":2,"title":"AuthProvider","slug":"authprovider","link":"#authprovider","children":[]},{"level":2,"title":"isAuthenticated","slug":"isauthenticated","link":"#isauthenticated","children":[{"level":3,"title":"loginRedirect","slug":"loginredirect","link":"#loginredirect","children":[]},{"level":3,"title":"loginPopup","slug":"loginpopup","link":"#loginpopup","children":[]},{"level":3,"title":"logoutRedirect","slug":"logoutredirect","link":"#logoutredirect","children":[]},{"level":3,"title":"acquireToken","slug":"acquiretoken","link":"#acquiretoken","children":[]},{"level":3,"title":"acquireUserInfo","slug":"acquireuserinfo","link":"#acquireuserinfo","children":[]},{"level":3,"title":"isAuthenticating","slug":"isauthenticating","link":"#isauthenticating","children":[]},{"level":3,"title":"isLoadingToken","slug":"isloadingtoken","link":"#isloadingtoken","children":[]},{"level":3,"title":"isLoadingUserInfo","slug":"isloadinguserinfo","link":"#isloadinguserinfo","children":[]},{"level":3,"title":"authenticationError","slug":"authenticationerror","link":"#authenticationerror","children":[]},{"level":3,"title":"acquireTokenError","slug":"acquiretokenerror","link":"#acquiretokenerror","children":[]},{"level":3,"title":"acquireUserInfoError","slug":"acquireuserinfoerror","link":"#acquireuserinfoerror","children":[]},{"level":3,"title":"account","slug":"account","link":"#account","children":[]},{"level":3,"title":"loginError","slug":"loginerror","link":"#loginerror","children":[]},{"level":3,"title":"logoutError","slug":"logouterror","link":"#logouterror","children":[]}]}],"git":{"updatedTime":1741821787000,"contributors":[{"name":"Baozier","username":"Baozier","email":"byn9826@gmail.com","commits":1,"url":"https://github.com/Baozier"}],"changelog":[{"hash":"dfab4ec2f967fd41a982ec46405efe2f0604329e","date":1741821787000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add vue sdk package @melody-auth/vue (#260)"}]},"filePathRelative":"vue-sdk.md"}');export{c as comp,p as data};
