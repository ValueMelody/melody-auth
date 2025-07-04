import{_ as e,c as s,a,o as i}from"./app-BVdeq8C2.js";const t={};function l(d,n){return i(),s("div",null,n[0]||(n[0]=[a(`<h1 id="angular-sdk" tabindex="-1"><a class="header-anchor" href="#angular-sdk"><span>Angular SDK</span></a></h1><h2 id="安装" tabindex="-1"><a class="header-anchor" href="#安装"><span>安装</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">npm install @melody-auth/angular --save</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="authprovider" tabindex="-1"><a class="header-anchor" href="#authprovider"><span>AuthProvider</span></a></h2><p>在应用启动时向引导模块提供认证相关配置。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>clientId</td><td>string</td><td>前端连接的 app <strong>clientId</strong></td><td>N/A</td><td>是</td></tr><tr><td>redirectUri</td><td>string</td><td>认证成功后重定向的 URL</td><td>N/A</td><td>是</td></tr><tr><td>serverUri</td><td>string</td><td>托管认证服务器的 URL</td><td>N/A</td><td>是</td></tr><tr><td>scopes</td><td>string[]</td><td>需要申请的权限作用域</td><td>N/A</td><td>否</td></tr><tr><td>storage</td><td>&#39;sessionStorage&#39; | &#39;localStorage&#39;</td><td>用于存储认证令牌的存储类型</td><td>&#39;localStorage&#39;</td><td>否</td></tr><tr><td>onLoginSuccess</td><td>(attr: { locale?: string; state?: string }) =&gt; void</td><td>登录成功后的回调函数</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { bootstrapApplication } from &#39;@angular/platform-browser&#39;</span>
<span class="line">import { provideMelodyAuth } from &#39;@melody-auth/angular&#39;</span>
<span class="line">import { AppComponent } from &#39;./app/app.component&#39;</span>
<span class="line"></span>
<span class="line">bootstrapApplication(AppComponent, {</span>
<span class="line">  providers: [</span>
<span class="line">    provideMelodyAuth({</span>
<span class="line">      clientId: import.meta.env.NG_APP_AUTH_SPA_CLIENT_ID,</span>
<span class="line">      redirectUri: import.meta.env.NG_APP_CLIENT_URI,</span>
<span class="line">      serverUri: import.meta.env.NG_APP_AUTH_SERVER_URI,</span>
<span class="line">      storage: &#39;localStorage&#39;,</span>
<span class="line">    }),</span>
<span class="line">  ],</span>
<span class="line">})</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="isauthenticated" tabindex="-1"><a class="header-anchor" href="#isauthenticated"><span>isAuthenticated</span></a></h2><p>用于判断当前用户是否已通过认证。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div *ngIf=&quot;authService.isAuthenticating&quot;&gt;Loading...&lt;/div&gt;</span>
<span class="line">&lt;div *ngIf=&quot;!authService.isAuthenticating &amp;&amp; authService.isAuthenticated&quot;&gt;</span>
<span class="line">  已登录</span>
<span class="line">&lt;/div&gt;</span>
<span class="line">&lt;div *ngIf=&quot;!authService.isAuthenticating &amp;&amp; !authService.isAuthenticated&quot;&gt;</span>
<span class="line">  未登录</span>
<span class="line">&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginredirect" tabindex="-1"><a class="header-anchor" href="#loginredirect"><span>loginRedirect</span></a></h2><p>通过浏览器重定向的方式开启新的认证流程。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>指定认证流程使用的语言</td><td>N/A</td><td>否</td></tr><tr><td>state</td><td>string</td><td>若不使用自动生成的随机串，可自定义 state 参数</td><td>N/A</td><td>否</td></tr><tr><td>policy</td><td>string</td><td>指定要使用的策略</td><td>&#39;sign_in_or_sign_up&#39;</td><td>否</td></tr><tr><td>org</td><td>string</td><td>指定要使用的组织，值为组织的 slug</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { CommonModule } from &#39;@angular/common&#39;</span>
<span class="line">import { Component } from &#39;@angular/core&#39;</span>
<span class="line">import { AuthService } from &#39;@melody-auth/angular&#39;</span>
<span class="line"></span>
<span class="line">@Component({</span>
<span class="line">  selector: &#39;auth-component&#39;,</span>
<span class="line">  template: \`</span>
<span class="line">    &lt;button (click)=&quot;onLogin()&quot;&gt;登录&lt;/button&gt;</span>
<span class="line">  \`,</span>
<span class="line">  imports: [CommonModule],</span>
<span class="line">  standalone: true,</span>
<span class="line">})</span>
<span class="line">export class AuthActionsComponent {</span>
<span class="line">  constructor (private authService: AuthService) {}</span>
<span class="line"></span>
<span class="line">  onLogin () {</span>
<span class="line">    this.authService.loginRedirect({</span>
<span class="line">      locale: &#39;en&#39;,</span>
<span class="line">      state: JSON.stringify({ info: Math.random() }),</span>
<span class="line">    })</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="loginpopup" tabindex="-1"><a class="header-anchor" href="#loginpopup"><span>loginPopup</span></a></h2><p>在弹窗中开启新的认证流程。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>locale</td><td>string</td><td>指定认证流程使用的语言</td><td>N/A</td><td>否</td></tr><tr><td>state</td><td>string</td><td>若不使用自动生成的随机串，可自定义 state 参数</td><td>N/A</td><td>否</td></tr><tr><td>org</td><td>string</td><td>指定要使用的组织，值为组织的 slug</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { CommonModule } from &#39;@angular/common&#39;</span>
<span class="line">import { Component } from &#39;@angular/core&#39;</span>
<span class="line">import { AuthService } from &#39;@melody-auth/angular&#39;</span>
<span class="line"></span>
<span class="line">@Component({</span>
<span class="line">  selector: &#39;auth-component&#39;,</span>
<span class="line">  template: \`</span>
<span class="line">    &lt;button (click)=&quot;onLoginPopup()&quot;&gt;登录&lt;/button&gt;</span>
<span class="line">  \`,</span>
<span class="line">  imports: [CommonModule],</span>
<span class="line">  standalone: true,</span>
<span class="line">})</span>
<span class="line">export class AuthActionsComponent {</span>
<span class="line">  constructor (private authService: AuthService) {}</span>
<span class="line"></span>
<span class="line">  onLoginPopup () {</span>
<span class="line">    this.authService.loginPopup({</span>
<span class="line">      locale: &#39;en&#39;,</span>
<span class="line">      state: JSON.stringify({ info: Math.random() }),</span>
<span class="line">    })</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="logoutredirect" tabindex="-1"><a class="header-anchor" href="#logoutredirect"><span>logoutRedirect</span></a></h2><p>触发退出登录流程。</p><table><thead><tr><th>参数</th><th>类型</th><th>描述</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td>postLogoutRedirectUri</td><td>string</td><td>退出后跳转的 URL</td><td>N/A</td><td>否</td></tr></tbody></table><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { CommonModule } from &#39;@angular/common&#39;</span>
<span class="line">import { Component } from &#39;@angular/core&#39;</span>
<span class="line">import { AuthService } from &#39;@melody-auth/angular&#39;</span>
<span class="line"></span>
<span class="line">@Component({</span>
<span class="line">  selector: &#39;auth-component&#39;,</span>
<span class="line">  template: \`</span>
<span class="line">    &lt;button (click)=&quot;onLogout()&quot;&gt;登出&lt;/button&gt;</span>
<span class="line">  \`,</span>
<span class="line">  imports: [CommonModule],</span>
<span class="line">  standalone: true,</span>
<span class="line">})</span>
<span class="line">export class AuthActionsComponent {</span>
<span class="line">  constructor (private authService: AuthService) {}</span>
<span class="line"></span>
<span class="line">  onLogout () {</span>
<span class="line">    this.authService.logoutRedirect({ postLogoutRedirectUri: &#39;http://localhost:4200/&#39; })</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquiretoken" tabindex="-1"><a class="header-anchor" href="#acquiretoken"><span>acquireToken</span></a></h2><p>获取用户的 <strong>accessToken</strong>，若已过期则自动刷新。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">import { HttpClient } from &#39;@angular/common/http&#39;</span>
<span class="line">import { Injectable } from &#39;@angular/core&#39;</span>
<span class="line">import { AuthService } from &#39;@melody-auth/angular&#39;</span>
<span class="line"></span>
<span class="line">@Injectable({ providedIn: &#39;root&#39; })</span>
<span class="line">export class UserService {</span>
<span class="line">  constructor (</span>
<span class="line">    private http: HttpClient,</span>
<span class="line">    private authService: AuthService,</span>
<span class="line">  ) {}</span>
<span class="line"></span>
<span class="line">  async fetchUserInfo () {</span>
<span class="line">    const token = await this.authService.acquireToken()</span>
<span class="line">    return this.http.get(&#39;/api/user&#39;, {</span>
<span class="line">      headers: { Authorization: \`Bearer \${token}\` },</span>
<span class="line">    }).toPromise()</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="acquireuserinfo" tabindex="-1"><a class="header-anchor" href="#acquireuserinfo"><span>acquireUserInfo</span></a></h2><p>从认证服务器获取当前用户的公开信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">const userInfo = await this.authService.acquireUserInfo()</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="userinfo" tabindex="-1"><a class="header-anchor" href="#userinfo"><span>userInfo</span></a></h2><p>当前用户信息。在访问 <strong>userInfo</strong> 之前，请先调用 <strong>acquireUserInfo</strong>。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.userInfo | json }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="isauthenticating" tabindex="-1"><a class="header-anchor" href="#isauthenticating"><span>isAuthenticating</span></a></h2><p>指示 SDK 是否正在初始化并尝试获取用户认证状态。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.isAuthenticating }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="isloadingtoken" tabindex="-1"><a class="header-anchor" href="#isloadingtoken"><span>isLoadingToken</span></a></h2><p>指示 SDK 是否正在获取或刷新令牌。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.isLoadingToken }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="isloadinguserinfo" tabindex="-1"><a class="header-anchor" href="#isloadinguserinfo"><span>isLoadingUserInfo</span></a></h2><p>指示 SDK 是否正在获取用户信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.isLoadingUserInfo }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="authenticationerror" tabindex="-1"><a class="header-anchor" href="#authenticationerror"><span>authenticationError</span></a></h2><p>指示是否发生了与认证流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.authenticationError }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="acquiretokenerror" tabindex="-1"><a class="header-anchor" href="#acquiretokenerror"><span>acquireTokenError</span></a></h2><p>指示是否发生了与 acquireToken 流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.acquireTokenError }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="acquireuserinfoerror" tabindex="-1"><a class="header-anchor" href="#acquireuserinfoerror"><span>acquireUserInfoError</span></a></h2><p>指示是否发生了与 acquireUserInfo 流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.acquireUserInfoError }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="idtoken" tabindex="-1"><a class="header-anchor" href="#idtoken"><span>idToken</span></a></h2><p>当前用户的 <strong>id_token</strong>。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.idToken }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="account" tabindex="-1"><a class="header-anchor" href="#account"><span>account</span></a></h2><p>从 <strong>id_token</strong> 解码得到的账户信息。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.account | json }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="loginerror" tabindex="-1"><a class="header-anchor" href="#loginerror"><span>loginError</span></a></h2><p>指示是否发生了与登录流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.loginError }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="logouterror" tabindex="-1"><a class="header-anchor" href="#logouterror"><span>logoutError</span></a></h2><p>指示是否发生了与退出流程相关的错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line">&lt;div&gt;{{ authService.logoutError }}&lt;/div&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div>`,61)]))}const c=e(t,[["render",l]]),p=JSON.parse('{"path":"/zh/angular-sdk.html","title":"Angular SDK","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1748744819000,"contributors":[{"name":"Baozier","username":"Baozier","email":"byn9826@gmail.com","commits":1,"url":"https://github.com/Baozier"}],"changelog":[{"hash":"1f6a42a6b45fdfb25e862e4b91e0a9988ee80459","time":1748744819000,"email":"byn9826@gmail.com","author":"Baozier","message":"Add docs in CN (#378)"}]},"filePathRelative":"zh/angular-sdk.md"}');export{c as comp,p as data};
