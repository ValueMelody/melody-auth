import{_ as n,c as e,a,o as i}from"./app-BwuRVzcB.js";const l={};function t(d,s){return i(),e("div",null,s[0]||(s[0]=[a(`<h1 id="vue-sdk" tabindex="-1"><a class="header-anchor" href="#vue-sdk"><span>Vue SDK</span></a></h1><h2 id="安装" tabindex="-1"><a class="header-anchor" href="#安装"><span>安装</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">npm install @melody-auth/vue --save</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="authprovider" tabindex="-1"><a class="header-anchor" href="#authprovider"><span>AuthProvider</span></a></h2><p>将你的应用包裹在 <strong>AuthProvider</strong> 组件内，为应用中的其他组件提供认证上下文。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>clientId</td><td>string</td><td>前端所连接的 app <strong>clientId</strong></td><td>N/A</td><td>是</td></tr><tr><td>redirectUri</td><td>string</td><td>认证成功后重定向的 URL</td><td>N/A</td><td>是</td></tr><tr><td>serverUri</td><td>string</td><td>托管认证服务器的 URL</td><td>N/A</td><td>是</td></tr><tr><td>scopes</td><td>string[]</td><td>需要申请的权限作用域</td><td>N/A</td><td>否</td></tr><tr><td>storage</td><td>&#39;sessionStorage&#39; | &#39;localStorage&#39;</td><td>用于存储认证令牌的存储类型</td><td>&#39;localStorage&#39;</td><td>否</td></tr><tr><td>onLoginSuccess</td><td>(attr: { locale?: string; state?: string }) =&gt; void</td><td>登录成功后执行的回调函数</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { createApp } from &#39;vue&#39;</span>
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
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isauthenticated" tabindex="-1"><a class="header-anchor" href="#isauthenticated"><span>isAuthenticated</span></a></h2><p>用于判断当前用户是否已通过认证。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { isAuthenticating, isAuthenticated } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;isAuthenticating&quot;&gt;</span>
<span class="line">    &lt;Spinner /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">  &lt;div v-else&gt;</span>
<span class="line">    &lt;button v-if=&quot;isAuthenticated&quot;&gt;</span>
<span class="line">      登出</span>
<span class="line">    &lt;/button&gt;</span>
<span class="line">    &lt;button v-else&gt;</span>
<span class="line">      登录</span>
<span class="line">    &lt;/button&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginredirect" tabindex="-1"><a class="header-anchor" href="#loginredirect"><span>loginRedirect</span></a></h2><p>通过浏览器重定向的方式开启新的认证流程。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>指定认证流程使用的语言</td><td>N/A</td><td>否</td></tr><tr><td>state</td><td>string</td><td>若不使用自动生成的随机串，可自定义 state 参数</td><td>N/A</td><td>否</td></tr><tr><td>policy</td><td>string</td><td>指定要使用的策略</td><td>&#39;sign_in_or_sign_up&#39;</td><td>否</td></tr><tr><td>org</td><td>string</td><td>指定要使用的组织，值为组织的 slug</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
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
<span class="line">    登录</span>
<span class="line">  &lt;/button&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginpopup" tabindex="-1"><a class="header-anchor" href="#loginpopup"><span>loginPopup</span></a></h2><p>在弹窗中开启新的认证流程。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>指定认证流程使用的语言</td><td>N/A</td><td>否</td></tr><tr><td>state</td><td>string</td><td>若不使用自动生成的随机串，可自定义 state 参数</td><td>N/A</td><td>否</td></tr><tr><td>org</td><td>string</td><td>指定要使用的组织，值为组织的 slug</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { loginPopup } = useAuth()</span>
<span class="line"></span>
<span class="line">function handleLogin() {</span>
<span class="line">  loginPopup({</span>
<span class="line">    locale: &#39;en&#39;,</span>
<span class="line">    state: JSON.stringify({ info: Math.random() })</span>
<span class="line">  })</span>
<span class="line">}</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;button @click=&quot;handleLogin&quot;&gt;</span>
<span class="line">    登录</span>
<span class="line">  &lt;/button&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="logoutredirect" tabindex="-1"><a class="header-anchor" href="#logoutredirect"><span>logoutRedirect</span></a></h2><p>触发退出登录流程。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>postLogoutRedirectUri</td><td>string</td><td>退出后跳转的 URL</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
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
<span class="line">    登出</span>
<span class="line">  &lt;/button&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquiretoken" tabindex="-1"><a class="header-anchor" href="#acquiretoken"><span>acquireToken</span></a></h2><p>获取用户的 <strong>accessToken</strong>，若已过期则自动刷新。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { acquireToken } = useAuth()</span>
<span class="line"></span>
<span class="line">async function handleFetchUserInfo() {</span>
<span class="line">  const accessToken = await acquireToken()</span>
<span class="line">  // 使用 accessToken 获取受保护资源</span>
<span class="line">  await fetch(&#39;/...&#39;, {</span>
<span class="line">    headers: {</span>
<span class="line">      Authorization: \`Bearer \${accessToken}\`,</span>
<span class="line">    },</span>
<span class="line">  })</span>
<span class="line">}</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;button @click=&quot;handleFetchUserInfo&quot;&gt;</span>
<span class="line">    获取用户信息</span>
<span class="line">  &lt;/button&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquireuserinfo" tabindex="-1"><a class="header-anchor" href="#acquireuserinfo"><span>acquireUserInfo</span></a></h2><p>从认证服务器获取当前用户的公开信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { acquireUserInfo } = useAuth()</span>
<span class="line"></span>
<span class="line">async function handleFetchUserInfo() {</span>
<span class="line">  const userInfo = await acquireUserInfo()</span>
<span class="line">}</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;button @click=&quot;handleFetchUserInfo&quot;&gt;</span>
<span class="line">    获取用户信息</span>
<span class="line">  &lt;/button&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="userinfo" tabindex="-1"><a class="header-anchor" href="#userinfo"><span>userInfo</span></a></h2><p>当前用户信息。在访问 <strong>userInfo</strong> 之前，请先调用 <strong>acquireUserInfo</strong>。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { userInfo } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div&gt;</span>
<span class="line">    &lt;pre&gt;{{ JSON.stringify(userInfo) }}&lt;/pre&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isauthenticating" tabindex="-1"><a class="header-anchor" href="#isauthenticating"><span>isAuthenticating</span></a></h2><p>指示 SDK 是否正在初始化并尝试获取用户认证状态。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { isAuthenticating } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;isAuthenticating&quot;&gt;</span>
<span class="line">    &lt;Spinner /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isloadingtoken" tabindex="-1"><a class="header-anchor" href="#isloadingtoken"><span>isLoadingToken</span></a></h2><p>指示 SDK 是否正在获取或刷新令牌。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { isLoadingToken } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;isLoadingToken&quot;&gt;</span>
<span class="line">    &lt;Spinner /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isloadinguserinfo" tabindex="-1"><a class="header-anchor" href="#isloadinguserinfo"><span>isLoadingUserInfo</span></a></h2><p>指示 SDK 是否正在获取用户信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { isLoadingUserInfo } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;isLoadingUserInfo&quot;&gt;</span>
<span class="line">    &lt;Spinner /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="authenticationerror" tabindex="-1"><a class="header-anchor" href="#authenticationerror"><span>authenticationError</span></a></h2><p>指示是否发生了与认证流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { authenticationError } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;authenticationError&quot;&gt;</span>
<span class="line">    &lt;Alert message=&quot;Authentication error&quot; /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquiretokenerror" tabindex="-1"><a class="header-anchor" href="#acquiretokenerror"><span>acquireTokenError</span></a></h2><p>指示是否发生了与 acquireToken 流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { acquireTokenError } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;acquireTokenError&quot;&gt;</span>
<span class="line">    &lt;Alert message=&quot;Acquire token error&quot; /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquireuserinfoerror" tabindex="-1"><a class="header-anchor" href="#acquireuserinfoerror"><span>acquireUserInfoError</span></a></h2><p>指示是否发生了与 acquireUserInfo 流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { acquireUserInfoError } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;acquireUserInfoError&quot;&gt;</span>
<span class="line">    &lt;Alert message=&quot;Acquire user info error&quot; /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="idtoken" tabindex="-1"><a class="header-anchor" href="#idtoken"><span>idToken</span></a></h2><p>当前用户的 <strong>id_token</strong>。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { idToken } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div&gt;</span>
<span class="line">    &lt;pre&gt;{{ idToken }}&lt;/pre&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="account" tabindex="-1"><a class="header-anchor" href="#account"><span>account</span></a></h2><p>从 <strong>id_token</strong> 解码得到的账户信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { account } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div&gt;</span>
<span class="line">    &lt;pre&gt;{{ account }}&lt;/pre&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginerror" tabindex="-1"><a class="header-anchor" href="#loginerror"><span>loginError</span></a></h2><p>指示是否发生了与登录流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { loginError } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;loginError&quot;&gt;</span>
<span class="line">    &lt;Alert message=&quot;Login error&quot; /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="logouterror" tabindex="-1"><a class="header-anchor" href="#logouterror"><span>logoutError</span></a></h2><p>指示是否发生了与退出流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">&lt;script setup lang=&quot;ts&quot;&gt;</span>
<span class="line">import { useAuth } from &#39;@melody-auth/vue&#39;</span>
<span class="line">const { logoutError } = useAuth()</span>
<span class="line">&lt;/script&gt;</span>
<span class="line"></span>
<span class="line">&lt;template&gt;</span>
<span class="line">  &lt;div v-if=&quot;logoutError&quot;&gt;</span>
<span class="line">    &lt;Alert message=&quot;Logout error&quot; /&gt;</span>
<span class="line">  &lt;/div&gt;</span>
<span class="line">&lt;/template&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="示例应用" tabindex="-1"><a class="header-anchor" href="#示例应用"><span>示例应用</span></a></h2><p>使用 Vue SDK 的示例应用：<code>https://github.com/ValueMelody/melody-auth-examples/tree/main/vite-vue-example</code>。</p>`,63)]))}const c=n(l,[["render",t]]),p=JSON.parse('{"path":"/zh/vue-sdk.html","title":"Vue SDK","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1754789420000,"contributors":[{"name":"Baozier","username":"Baozier","email":"byn9826@gmail.com","commits":6,"url":"https://github.com/Baozier"}],"changelog":[{"hash":"358b6a2c7b84b67228a8105b10393c204347c5b3","time":1754789420000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add docs for web-sdk (#419)"},{"hash":"1f6a42a6b45fdfb25e862e4b91e0a9988ee80459","time":1748744819000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add docs in CN (#378)"},{"hash":"ba72a1c20806e31ae16be18f2593e2ec602d5e7e","time":1745898277000,"email":"byn9826@gmail.com","author":"Baozier","message":"Exposure idToken from sdks (#340)"},{"hash":"5c4b22ca13843f6dc0a76ee403ea55dc4493a952","time":1745186261000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add an S2S API to generate impersonation refresh_token (#328)"},{"hash":"a5d2ea53baf6745787853bdf5c8a83c4b68cd248","time":1742010392000,"email":"byn9826@gmail.com","author":"Baozier","message":"Exposure userInfo directly from react-sdk and use in admin-panel (#266)"},{"hash":"dfab4ec2f967fd41a982ec46405efe2f0604329e","time":1741821787000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add vue sdk package @melody-auth/vue (#260)"}]},"filePathRelative":"zh/vue-sdk.md"}');export{c as comp,p as data};
