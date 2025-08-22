import{_ as s,c as e,a,o as i}from"./app-BMtGzWFk.js";const l={};function t(d,n){return i(),e("div",null,n[0]||(n[0]=[a(`<h1 id="react-sdk" tabindex="-1"><a class="header-anchor" href="#react-sdk"><span>React SDK</span></a></h1><h2 id="安装" tabindex="-1"><a class="header-anchor" href="#安装"><span>安装</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">npm install @melody-auth/react --save</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="authprovider" tabindex="-1"><a class="header-anchor" href="#authprovider"><span>AuthProvider</span></a></h2><p>将你的应用包裹在 <strong>AuthProvider</strong> 组件内，为应用中的其他组件提供认证上下文。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>clientId</td><td>string</td><td>前端所连接的 app <strong>clientId</strong></td><td>N/A</td><td>是</td></tr><tr><td>redirectUri</td><td>string</td><td>认证成功后重定向的 URL</td><td>N/A</td><td>是</td></tr><tr><td>serverUri</td><td>string</td><td>托管认证服务器的 URL</td><td>N/A</td><td>是</td></tr><tr><td>scopes</td><td>string[]</td><td>需要申请的权限作用域</td><td>N/A</td><td>否</td></tr><tr><td>storage</td><td>&#39;sessionStorage&#39; | &#39;localStorage&#39;</td><td>用于存储认证令牌的存储类型</td><td>&#39;localStorage&#39;</td><td>否</td></tr><tr><td>onLoginSuccess</td><td>(attr: { locale?: string; state?: string }) =&gt; void</td><td>登录成功后执行的回调函数</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { AuthProvider } from &#39;@melody-auth/react&#39;</span>
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
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isauthenticated" tabindex="-1"><a class="header-anchor" href="#isauthenticated"><span>isAuthenticated</span></a></h2><p>用于判断当前用户是否已通过认证。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticating, isAuthenticated } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isAuthenticating) return &lt;Spinner /&gt;</span>
<span class="line">  if (isAuthenticated) return &lt;Button&gt;登出&lt;/Button&gt;</span>
<span class="line">  if (!isAuthenticated) return &lt;Button&gt;登录&lt;/Button&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginredirect" tabindex="-1"><a class="header-anchor" href="#loginredirect"><span>loginRedirect</span></a></h2><p>通过浏览器重定向的方式开启新的认证流程。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>指定认证流程使用的语言</td><td>N/A</td><td>否</td></tr><tr><td>state</td><td>string</td><td>若不使用自动生成的随机串，可自定义 state 参数</td><td>N/A</td><td>否</td></tr><tr><td>policy</td><td>string</td><td>指定要使用的策略</td><td>&#39;sign_in_or_sign_up&#39;</td><td>否</td></tr><tr><td>org</td><td>string</td><td>指定要使用的组织，值为组织的 slug</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
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
<span class="line">    return &lt;Button onClick={handleLogin}&gt;登录&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginpopup" tabindex="-1"><a class="header-anchor" href="#loginpopup"><span>loginPopup</span></a></h2><p>在弹窗中开启新的认证流程。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>指定认证流程使用的语言</td><td>N/A</td><td>否</td></tr><tr><td>state</td><td>string</td><td>若不使用自动生成的随机串，可自定义 state 参数</td><td>N/A</td><td>否</td></tr><tr><td>org</td><td>string</td><td>指定要使用的组织，值为组织的 slug</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
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
<span class="line">    return &lt;Button onClick={handleLogin}&gt;登录&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="logoutredirect" tabindex="-1"><a class="header-anchor" href="#logoutredirect"><span>logoutRedirect</span></a></h2><p>触发退出登录流程。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>postLogoutRedirectUri</td><td>string</td><td>退出后跳转的 URL</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticated, logoutRedirect } = useAuth()</span>
<span class="line"></span>
<span class="line">  const handleLogout = () =&gt; {</span>
<span class="line">    logoutRedirect({ postLogoutRedirectUri: &#39;http://localhost:3000/&#39; })</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (isAuthenticated) {</span>
<span class="line">    return &lt;Button onClick={handleLogout}&gt;登出&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquiretoken" tabindex="-1"><a class="header-anchor" href="#acquiretoken"><span>acquireToken</span></a></h2><p>获取用户的 <strong>accessToken</strong>，若已过期则自动刷新。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticated, acquireToken } = useAuth()</span>
<span class="line"></span>
<span class="line">  const handleFetchUserInfo = () =&gt; {</span>
<span class="line">    const accessToken = await acquireToken()</span>
<span class="line">    // 使用 accessToken 获取受保护资源</span>
<span class="line">    await fetch(&#39;/...&#39;, {</span>
<span class="line">      headers: {</span>
<span class="line">        Authorization: \`Bearer \${accessToken}\`,</span>
<span class="line">      },</span>
<span class="line">    })</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (isAuthenticated) {</span>
<span class="line">    return &lt;Button onClick={handleFetchUserInfo}&gt;获取用户信息&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquireuserinfo" tabindex="-1"><a class="header-anchor" href="#acquireuserinfo"><span>acquireUserInfo</span></a></h2><p>从认证服务器获取当前用户的公开信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticated, acquireUserInfo } = useAuth()</span>
<span class="line"></span>
<span class="line">  const handleFetchUserInfo = () =&gt; {</span>
<span class="line">    const userInfo = await acquireUserInfo()</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  if (isAuthenticated) {</span>
<span class="line">    return &lt;Button onClick={handleFetchUserInfo}&gt;获取用户信息&lt;/Button&gt;</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="userinfo" tabindex="-1"><a class="header-anchor" href="#userinfo"><span>userInfo</span></a></h2><p>当前用户信息。在访问 <strong>userInfo</strong> 之前，请先调用 <strong>acquireUserInfo</strong>。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { userInfo } = useAuth()</span>
<span class="line"></span>
<span class="line">  &lt;div&gt;{JSON.stringify(userInfo)}&lt;/div&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isauthenticating" tabindex="-1"><a class="header-anchor" href="#isauthenticating"><span>isAuthenticating</span></a></h2><p>指示 SDK 是否正在初始化并尝试获取用户认证状态。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isAuthenticating } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isAuthenticating) return &lt;Spinner /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isloadingtoken" tabindex="-1"><a class="header-anchor" href="#isloadingtoken"><span>isLoadingToken</span></a></h2><p>指示 SDK 是否正在获取或刷新令牌。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isLoadingToken } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isLoadingToken) return &lt;Spinner /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isloadinguserinfo" tabindex="-1"><a class="header-anchor" href="#isloadinguserinfo"><span>isLoadingUserInfo</span></a></h2><p>指示 SDK 是否正在获取用户信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { isLoadingUserInfo } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (isLoadingUserInfo) return &lt;Spinner /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="authenticationerror" tabindex="-1"><a class="header-anchor" href="#authenticationerror"><span>authenticationError</span></a></h2><p>指示是否发生了与认证流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { authenticationError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (authenticationError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquiretokenerror" tabindex="-1"><a class="header-anchor" href="#acquiretokenerror"><span>acquireTokenError</span></a></h2><p>指示是否发生了与 acquireToken 流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { acquireTokenError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (acquireTokenError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquireuserinfoerror" tabindex="-1"><a class="header-anchor" href="#acquireuserinfoerror"><span>acquireUserInfoError</span></a></h2><p>指示是否发生了与 acquireUserInfo 流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { acquireUserInfoError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (acquireUserInfoError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="idtoken" tabindex="-1"><a class="header-anchor" href="#idtoken"><span>idToken</span></a></h2><p>当前用户的 <strong>id_token</strong>。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { idToken } = useAuth()</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="account" tabindex="-1"><a class="header-anchor" href="#account"><span>account</span></a></h2><p>从 <strong>id_token</strong> 解码得到的账户信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { account } = useAuth()</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginerror" tabindex="-1"><a class="header-anchor" href="#loginerror"><span>loginError</span></a></h2><p>指示是否发生了与登录流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { loginError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (loginError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="logouterror" tabindex="-1"><a class="header-anchor" href="#logouterror"><span>logoutError</span></a></h2><p>指示是否发生了与退出流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { useAuth } from &#39;@melody-auth/react&#39;</span>
<span class="line"></span>
<span class="line">export default function Home () {</span>
<span class="line">  const { logoutError } = useAuth()</span>
<span class="line"></span>
<span class="line">  if (logoutError) return &lt;Alert /&gt;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="示例应用" tabindex="-1"><a class="header-anchor" href="#示例应用"><span>示例应用</span></a></h2><p>使用 React SDK 的示例应用：<code>https://github.com/ValueMelody/melody-auth-examples/tree/main/vite-react-demo</code>。</p>`,63)]))}const c=s(l,[["render",t]]),p=JSON.parse('{"path":"/zh/react-sdk.html","title":"React SDK","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1754789420000,"contributors":[{"name":"Baozier","username":"Baozier","email":"byn9826@gmail.com","commits":16,"url":"https://github.com/Baozier"}],"changelog":[{"hash":"358b6a2c7b84b67228a8105b10393c204347c5b3","time":1754789420000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add docs for web-sdk (#419)"},{"hash":"1f6a42a6b45fdfb25e862e4b91e0a9988ee80459","time":1748744819000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add docs in CN (#378)"},{"hash":"ba72a1c20806e31ae16be18f2593e2ec602d5e7e","time":1745898277000,"email":"byn9826@gmail.com","author":"Baozier","message":"Exposure idToken from sdks (#340)"},{"hash":"1de79ce15fa8c1f80735a6a2fd5599b92a5b2577","time":1744426336000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add doc for how to customize branding (#299)","tag":"v1.2.6"},{"hash":"a5d2ea53baf6745787853bdf5c8a83c4b68cd248","time":1742010392000,"email":"byn9826@gmail.com","author":"Baozier","message":"Exposure userInfo directly from react-sdk and use in admin-panel (#266)"},{"hash":"dfab4ec2f967fd41a982ec46405efe2f0604329e","time":1741821787000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add vue sdk package @melody-auth/vue (#260)"},{"hash":"dcc7904d45937761251f8fe19254c40c61c15711","time":1739930974000,"email":"byn9826@gmail.com","author":"Baozier","message":"Support login with popup in react-sdk (#233)"},{"hash":"2cffc8969ef12e367cb0caa78e545107191f80d7","time":1730941938000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add docs for how to trigger a policy (#189)","tag":"v1.1.0"},{"hash":"84e6126d4d32fc04825dc55dd506e5a1a09e2ab5","time":1726794251000,"email":"byn9826@gmail.com","author":"Baozier","message":"Allow set and load state during login redirect (#163)"},{"hash":"155079ce08bb29f776a1cac7bd21e984f8ba88c5","time":1723405770000,"email":"byn9826@gmail.com","author":"Baozier","message":"Decode id_token as account in react sdk (#95)"},{"hash":"5804351a18bc976430f49e83543ec0a9eea480a6","time":1723336999000,"email":"byn9826@gmail.com","author":"Baozier","message":"Full locale support for identity pages and emails (#85)"},{"hash":"d265a44f90805217c6ec87dc91039de176ef8813","time":1723065969000,"email":"byn9826@gmail.com","author":"Baozier","message":"Default refresh token storage to localStorage (#79)"},{"hash":"e382551b92e0befd63ebfd7589710ceb5746c342","time":1722648544000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add loading effect when manage resources in admin panel (#64)"},{"hash":"300dcd66ab1f55330473a42d3e830126b75a3fc7","time":1722545376000,"email":"byn9826@gmail.com","author":"Baozier","message":"Export more loading and error state from react-sdk (#61)"},{"hash":"7a3a2e2e84aa4f2e5d66c7b0f4830abb4ed9a72b","time":1722476406000,"email":"byn9826@gmail.com","author":"Baozier","message":"Exposure isLoading state when react sdk is fetching user info (#59)"},{"hash":"c667eebfc475caf5e63d9676f6201d086086fd97","time":1721333760000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add doc for react-sdk (#24)"}]},"filePathRelative":"zh/react-sdk.md"}');export{c as comp,p as data};
