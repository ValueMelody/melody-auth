import{_ as s,c as n,a,o as t}from"./app-DYNaD-s_.js";const d={};function i(l,e){return t(),n("div",null,e[0]||(e[0]=[a(`<h1 id="web-sdk" tabindex="-1"><a class="header-anchor" href="#web-sdk"><span>Web SDK</span></a></h1><p>Web SDK 可让你将 Melody Auth 集成到使用原生 JavaScript 的 Web 应用程序中。</p><h2 id="安装" tabindex="-1"><a class="header-anchor" href="#安装"><span>安装</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">npm install @melody-auth/web --save</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="配置" tabindex="-1"><a class="header-anchor" href="#配置"><span>配置</span></a></h2><p>Web SDK 的函数接受一个共享的配置对象。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>clientId</td><td>string</td><td>前端连接的认证 clientId</td><td>N/A</td><td>是</td></tr><tr><td>redirectUri</td><td>string</td><td>用户成功认证后重定向的 URL</td><td>N/A</td><td>是</td></tr><tr><td>serverUri</td><td>string</td><td>你托管 melody auth 服务器的 URL</td><td>N/A</td><td>是</td></tr><tr><td>scopes</td><td>string[]</td><td>请求用户访问权限的范围</td><td>N/A</td><td>否</td></tr><tr><td>storage</td><td>&#39;sessionStorage&#39; | &#39;localStorage&#39;</td><td>存储认证 token 的类型</td><td>&#39;localStorage&#39;</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import {</span>
<span class="line">  triggerLogin,</span>
<span class="line">  loadCodeAndStateFromUrl,</span>
<span class="line">  exchangeTokenByAuthCode,</span>
<span class="line">  exchangeTokenByRefreshToken,</span>
<span class="line">  getUserInfo,</span>
<span class="line">  logout,</span>
<span class="line">} from &#39;@melody-auth/web&#39;</span>
<span class="line"></span>
<span class="line">const config = {</span>
<span class="line">  clientId: &#39;&lt;CLIENT_ID&gt;&#39;,</span>
<span class="line">  redirectUri: &#39;&lt;CLIENT_REDIRECT_URI&gt;&#39;,</span>
<span class="line">  serverUri: &#39;&lt;AUTH_SERVER_URI&gt;&#39;,</span>
<span class="line">  // 可选</span>
<span class="line">  scopes: [&#39;openid&#39;, &#39;profile&#39;],</span>
<span class="line">  storage: &#39;localStorage&#39;,</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginredirect" tabindex="-1"><a class="header-anchor" href="#loginredirect"><span>loginRedirect</span></a></h2><p>通过重定向到认证服务器启动一个新的认证流程。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>指定认证流程中使用的语言环境</td><td>N/A</td><td>否</td></tr><tr><td>state</td><td>string</td><td>指定认证流程中使用的 state，如果不想使用随机生成的字符串</td><td>N/A</td><td>否</td></tr><tr><td>policy</td><td>string</td><td>指定认证流程中使用的策略</td><td>&#39;sign_in_or_sign_up&#39;</td><td>否</td></tr><tr><td>org</td><td>string</td><td>指定认证流程中使用的组织，值应为组织的 slug</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">await triggerLogin(&#39;redirect&#39;, config, {</span>
<span class="line">  locale: &#39;en&#39;,</span>
<span class="line">  // state: &#39;your-predictable-state&#39;,</span>
<span class="line">  // policy: &#39;sign_in_or_sign_up&#39;,</span>
<span class="line">  // org: &#39;your-org-slug&#39;,</span>
<span class="line">})</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginpopup" tabindex="-1"><a class="header-anchor" href="#loginpopup"><span>loginPopup</span></a></h2><p>在弹窗中启动一个新的认证流程。当用户完成认证时，你的 <code>authorizePopupHandler</code> 会被调用，并传入 <code>{ state, code }</code>。你必须用该 code 来交换 token。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>指定认证流程中使用的语言环境</td><td>N/A</td><td>否</td></tr><tr><td>state</td><td>string</td><td>指定认证流程中使用的 state，如果不想使用随机生成的字符串</td><td>N/A</td><td>否</td></tr><tr><td>policy</td><td>string</td><td>指定认证流程中使用的策略</td><td>&#39;sign_in_or_sign_up&#39;</td><td>否</td></tr><tr><td>org</td><td>string</td><td>指定认证流程中使用的组织，值应为组织的 slug</td><td>N/A</td><td>否</td></tr><tr><td>authorizePopupHandler</td><td>(data: { state: string; code: string }) =&gt; void</td><td>弹窗返回认证 code 时调用的处理器</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">await triggerLogin(&#39;popup&#39;, config, {</span>
<span class="line">  locale: &#39;en&#39;,</span>
<span class="line">  authorizePopupHandler: async ({ state, code }) =&gt; {</span>
<span class="line">    await exchangeTokenByAuthCode(code, state, config)</span>
<span class="line">    // token 已处理（见下文说明）</span>
<span class="line">  },</span>
<span class="line">})</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="handleredirectcallback" tabindex="-1"><a class="header-anchor" href="#handleredirectcallback"><span>handleRedirectCallback</span></a></h2><p>当用户通过重定向从认证服务器返回时，从 URL 中读取 <code>code</code> 和 <code>state</code>，并用它们交换 token。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">const { code, state } = loadCodeAndStateFromUrl()</span>
<span class="line">await exchangeTokenByAuthCode(code, state, config)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="存储内容" tabindex="-1"><a class="header-anchor" href="#存储内容"><span>存储内容</span></a></h3><p>成功调用 <code>exchangeTokenByAuthCode</code> 后：</p><ul><li>refresh token 和 id token 会使用配置的存储方式保存，键分别为 <code>StorageKey.RefreshToken</code> 和 <code>StorageKey.IdToken</code>。</li><li>access token 会从交换函数返回，但不会被持久化。需要立即使用，或者之后通过 refresh token 重新获取。</li></ul><h2 id="acquiretoken" tabindex="-1"><a class="header-anchor" href="#acquiretoken"><span>acquireToken</span></a></h2><p>在需要时使用已存储的 refresh token 获取新的 access token。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { getStorage, StorageKey } from &#39;@melody-auth/shared&#39;</span>
<span class="line"></span>
<span class="line">const storage = getStorage(config.storage)</span>
<span class="line">const refreshTokenRaw = storage.getItem(StorageKey.RefreshToken)</span>
<span class="line">const refreshToken = refreshTokenRaw &amp;&amp; JSON.parse(refreshTokenRaw).refreshToken</span>
<span class="line"></span>
<span class="line">if (!refreshToken) throw new Error(&#39;No refresh token found&#39;)</span>
<span class="line"></span>
<span class="line">const { accessToken, expiresIn, expiresOn } = await exchangeTokenByRefreshToken(</span>
<span class="line">  config,</span>
<span class="line">  refreshToken,</span>
<span class="line">)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquireuserinfo" tabindex="-1"><a class="header-anchor" href="#acquireuserinfo"><span>acquireUserInfo</span></a></h2><p>使用有效的 access token 从认证服务器获取用户的公开信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">const userInfo = await getUserInfo(config, { accessToken })</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="logoutredirect" tabindex="-1"><a class="header-anchor" href="#logoutredirect"><span>logoutRedirect</span></a></h2><p>注销用户。当 <code>localOnly</code> 为 false 且存在 refresh token 时，会先发送远程注销请求以获取注销后的重定向地址。然后清除本地 token 并重定向浏览器。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th></tr></thead><tbody><tr><td>postLogoutRedirectUri</td><td>string</td><td>用户注销后重定向的 URL</td></tr><tr><td>localOnly</td><td>boolean</td><td>如果为 true，则只清除本地 token 并重定向，不进行远程注销</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">import { getStorage, StorageKey } from &#39;@melody-auth/shared&#39;</span>
<span class="line"></span>
<span class="line">const storage = getStorage(config.storage)</span>
<span class="line">const idTokenRaw = storage.getItem(StorageKey.IdToken)</span>
<span class="line">const refreshTokenRaw = storage.getItem(StorageKey.RefreshToken)</span>
<span class="line">const accessToken = /* obtain via exchangeTokenByRefreshToken(...) */</span>
<span class="line">const refreshToken = refreshTokenRaw &amp;&amp; JSON.parse(refreshTokenRaw).refreshToken</span>
<span class="line"></span>
<span class="line">await logout(</span>
<span class="line">  config,</span>
<span class="line">  accessToken ?? &#39;&#39;,</span>
<span class="line">  refreshToken ?? null,</span>
<span class="line">  &#39;http://localhost:3000/&#39;,</span>
<span class="line">  false, // 设置为 true 跳过远程注销</span>
<span class="line">)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="示例应用" tabindex="-1"><a class="header-anchor" href="#示例应用"><span>示例应用</span></a></h2><p>查看使用 Web SDK 的最简 Vite 示例：<code>https://github.com/ValueMelody/melody-auth-examples/tree/main/vite-web-example</code>。</p>`,34)]))}const c=s(d,[["render",i]]),o=JSON.parse('{"path":"/zh/web-sdk.html","title":"Web SDK","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1754789420000,"contributors":[{"name":"Baozier","username":"Baozier","email":"byn9826@gmail.com","commits":1,"url":"https://github.com/Baozier"}],"changelog":[{"hash":"358b6a2c7b84b67228a8105b10393c204347c5b3","time":1754789420000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add docs for web-sdk (#419)"}]},"filePathRelative":"zh/web-sdk.md"}');export{c as comp,o as data};
