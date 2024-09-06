import{_ as e,c as n,o as s,a}from"./app-Cd_Rl9ss.js";const i={},l=a(`<h1 id="server-setup" tabindex="-1"><a class="header-anchor" href="#server-setup"><span>Server Setup</span></a></h1><h2 id="environment-setup-cloudflare" tabindex="-1"><a class="header-anchor" href="#environment-setup-cloudflare"><span>Environment Setup (Cloudflare)</span></a></h2><h3 id="_1-cloudflare-account-setup" tabindex="-1"><a class="header-anchor" href="#_1-cloudflare-account-setup"><span>1. Cloudflare Account Setup</span></a></h3><ol><li>Sign up for a Cloudflare account if you don&#39;t have one already.</li><li>Install Wrangler CLI and authenticate:</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">npx wrangler</span>
<span class="line">wrangler login</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-cloudflare-resource-creation" tabindex="-1"><a class="header-anchor" href="#_2-cloudflare-resource-creation"><span>2. Cloudflare Resource Creation</span></a></h3><p>Go to Cloudflare dashboard</p><ol><li>Create a Worker:</li></ol><ul><li>Go to Workers &amp; Pages -&gt; Overview -&gt; Click &quot;Create&quot; button</li><li>Name the worker &quot;melody-auth&quot;</li><li>After creation, go to the worker settings -&gt; Variables</li><li>Add a variable named &quot;AUTH_SERVER_URL&quot; with the value set to your worker&#39;s URL (e.g., https://melody-auth.[your-account-name].workers.dev)</li></ul><ol start="2"><li>Create a D1 database:</li></ol><ul><li>Go to Workers &amp; Pages -&gt; D1 -&gt; Click &quot;Create database&quot; button</li></ul><ol start="3"><li>Create a KV namespace:</li></ol><ul><li>Go to Workers &amp; Pages -&gt; KV -&gt; Click &quot;Create a namespace&quot; button</li></ul><h3 id="_3-project-setup" tabindex="-1"><a class="header-anchor" href="#_3-project-setup"><span>3. Project Setup</span></a></h3><ol><li>Clone the repository:</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">git clone git@github.com:ValueMelody/melody-auth.git</span>
<span class="line">cd melody-auth</span>
<span class="line">npm install</span>
<span class="line">npm run build</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>Update <code>server/wrangler.toml</code>: Replace the KV id and D1 id with your newly created resources:</li></ol><div class="language-toml line-numbers-mode" data-highlighter="prismjs" data-ext="toml" data-title="toml"><pre class="language-toml"><code><span class="line"><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token table class-name">kv_namespaces</span><span class="token punctuation">]</span><span class="token punctuation">]</span></span>
<span class="line"><span class="token key property">binding</span> <span class="token punctuation">=</span> <span class="token string">&quot;KV&quot;</span></span>
<span class="line"><span class="token key property">id</span> <span class="token punctuation">=</span> <span class="token string">&quot;your_kv_namespace_id&quot;</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token table class-name">d1_databases</span><span class="token punctuation">]</span><span class="token punctuation">]</span></span>
<span class="line"><span class="token key property">binding</span> <span class="token punctuation">=</span> <span class="token string">&quot;DB&quot;</span></span>
<span class="line"><span class="token key property">database_name</span> <span class="token punctuation">=</span> <span class="token string">&quot;melody-auth&quot;</span></span>
<span class="line"><span class="token key property">database_id</span> <span class="token punctuation">=</span> <span class="token string">&quot;your_d1_database_id&quot;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-deploy" tabindex="-1"><a class="header-anchor" href="#_4-deploy"><span>4. Deploy</span></a></h3><p>Run the following commands to set up your remote D1, KV, and deploy the code to your Worker:</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">cd server</span>
<span class="line">npm run prod:secret:generate</span>
<span class="line">npm run prod:migration:apply</span>
<span class="line">npm run prod:deploy</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Now you are all set, you can verify your server by accessing: <code>[your_worker_url]/.well-known/openid-configuration</code></p><h3 id="cloudflare-local-development" tabindex="-1"><a class="header-anchor" href="#cloudflare-local-development"><span>Cloudflare Local development</span></a></h3><p>To set up your local development environment, follow these steps:</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">git clone git@github.com:ValueMelody/melody-auth.git</span>
<span class="line">cd melody-auth</span>
<span class="line">npm install</span>
<span class="line">npm run build</span>
<span class="line"></span>
<span class="line">cd server</span>
<span class="line"># Configure your email-related environment variables in dev.vars</span>
<span class="line">cp dev.vars.example dev.vars</span>
<span class="line">npm run dev:secret:generate</span>
<span class="line">npm run dev:migration:apply</span>
<span class="line">npm run dev:start</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="environment-setup-node" tabindex="-1"><a class="header-anchor" href="#environment-setup-node"><span>Environment Setup (Node)</span></a></h2><h3 id="_1-node-postgres-and-redis-setup" tabindex="-1"><a class="header-anchor" href="#_1-node-postgres-and-redis-setup"><span>1. Node, Postgres and Redis setup</span></a></h3><p>Begin by setting up your PostgreSQL and Redis servers, and ensure you have the connection strings ready for integration. Please also ensure you are using <b>Node.js version 20.05 or higher</b> for compatibility.</p><h3 id="_2-project-setup" tabindex="-1"><a class="header-anchor" href="#_2-project-setup"><span>2. Project setup</span></a></h3><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">git clone git@github.com:ValueMelody/melody-auth.git</span>
<span class="line">cd melody-auth</span>
<span class="line">npm install</span>
<span class="line">npm run build</span>
<span class="line"></span>
<span class="line">cd server</span>
<span class="line"># Add your PostgreSQL and Redis connection strings to dev.vars</span>
<span class="line"># Configure your email-related environment variables in dev.vars</span>
<span class="line">cp dev.vars.example dev.vars</span>
<span class="line">npm run node:secret:generate</span>
<span class="line">npm run node:migration:apply</span>
<span class="line">npm run node:dev</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-production-build" tabindex="-1"><a class="header-anchor" href="#_3-production-build"><span>3. Production Build</span></a></h3><p>To prepare for production, follow these steps:</p><ol><li>Update server/src/routes/other.tsx file</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line"># Comment out the current swagger.json import statement:</span>
<span class="line">// import swaggerSpec from &#39;../scripts/swagger.json&#39;;</span>
<span class="line"></span>
<span class="line"># Uncomment the other swagger.json import statement which contains with { type: &quot;json&quot; }:</span>
<span class="line">import swaggerSpec from &#39;../scripts/swagger.json&#39; with { type: &quot;json&quot; }</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>Run the following commands to build and start the server:</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">cd server</span>
<span class="line">npm run node:build</span>
<span class="line">npm run node:start</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="mailer-setup" tabindex="-1"><a class="header-anchor" href="#mailer-setup"><span>Mailer Setup</span></a></h2><p>Melody Auth supports email-based features such as password reset, email verification and email MFA. To make sure these features works as expected, you need to set up SendGrid or Brevo integration and configure the necessary environment variables in your Cloudflare Worker.</p><h3 id="prerequisites" tabindex="-1"><a class="header-anchor" href="#prerequisites"><span>Prerequisites</span></a></h3><ul><li>A SendGrid/Brevo account</li><li>SendGrid/Brevo API key</li><li>Verified sender email address in SendGrid/Brevo</li></ul><h3 id="configuration-steps" tabindex="-1"><a class="header-anchor" href="#configuration-steps"><span>Configuration Steps</span></a></h3><ol><li><p>Navigate to the Cloudflare dashboard:</p><ul><li>Go to Workers &amp; Pages</li><li>Select your Melody Auth worker</li><li>Click on &quot;Settings&quot; -&gt; &quot;Variables&quot;</li></ul></li><li><p>Add the following environment variables:</p><table><thead><tr><th>Variable Name</th><th>Description</th><th>Example Value</th></tr></thead><tbody><tr><td>ENVIRONMENT</td><td>Determines the email sending behavior</td><td>&quot;prod&quot; or &quot;dev&quot;</td></tr><tr><td>DEV_EMAIL_RECEIVER</td><td>Email address for testing (used when ENVIRONMENT is not &#39;prod&#39;)</td><td>&quot;test@example.com&quot;</td></tr><tr><td>SENDGRID_API_KEY</td><td>Your SendGrid API key (not needed if you intend to use Brevo)</td><td>&quot;SG.xxxxxxxxxxxxxxxxxxxxxxxx&quot;</td></tr><tr><td>SENDGRID_SENDER_ADDRESS</td><td>Your verified sender email address in SendGrid (not needed if you intend to use Brevo)</td><td>&quot;noreply@yourdomain.com&quot;</td></tr><tr><td>BREVO_API_KEY</td><td>Your Brevo API key (not needed if you intend to use SendGrid)</td><td>&quot;xkeysib-.xxxxxxxxxxxxxxxxxxxxxxxx&quot;</td></tr><tr><td>BREVO_SENDER_ADDRESS</td><td>Your verified sender email address in Brevo (not needed if you intend to use SendGrid)</td><td>&quot;noreply@yourdomain.com&quot;</td></tr></tbody></table></li><li><p>Click &quot;Save and deploy&quot; to apply the changes.</p></li></ol><h3 id="environment-behavior" tabindex="-1"><a class="header-anchor" href="#environment-behavior"><span>Environment Behavior</span></a></h3><ul><li><p>When <code>ENVIRONMENT</code> is set to &quot;prod&quot;:</p><ul><li>Emails will be sent to the actual user email addresses.</li><li>Use this setting for production deployments.</li></ul></li><li><p>When <code>ENVIRONMENT</code> is not set to &quot;prod&quot; (e.g., set to &quot;dev&quot;):</p><ul><li>All emails will be redirected to the address specified in <code>DEV_EMAIL_RECEIVER</code>.</li><li>This is useful for testing and development to avoid sending emails to real users.</li></ul></li><li><p>Priority Between SendGrid and Brevo:</p><ul><li>If both SendGrid and Brevo keys and sender addresses are provided, SendGrid will take precedence.</li></ul></li></ul><h2 id="additional-configs" tabindex="-1"><a class="header-anchor" href="#additional-configs"><span>Additional Configs</span></a></h2><p>Melody Auth offers a range of customizable options to tailor the server to your specific needs. You can modify these settings by adjusting the values in the <code>[vars]</code> section of the <code>server/wrangler.toml</code> file.</p><p>To apply your changes:</p><ol><li>Open <code>server/wrangler.toml</code> in your preferred text editor.</li><li>Locate the <code>[vars]</code> section.</li><li>Modify the values as needed.</li><li>Save the file.</li><li>Redeploy your server using the command:</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">cd server</span>
<span class="line">npm run prod:deploy</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="authorization-code-expires-in" tabindex="-1"><a class="header-anchor" href="#authorization-code-expires-in"><span>AUTHORIZATION_CODE_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 300 (5 minutes)</li><li><strong>Description:</strong> Determines how long the authorization code is valid before it expires.</li></ul><h3 id="spa-access-token-expires-in" tabindex="-1"><a class="header-anchor" href="#spa-access-token-expires-in"><span>SPA_ACCESS_TOKEN_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 1800 (30 minutes)</li><li><strong>Description:</strong> Determines how long the access token granted for single page applications is valid before it expires.</li></ul><h3 id="spa-refresh-token-expires-in" tabindex="-1"><a class="header-anchor" href="#spa-refresh-token-expires-in"><span>SPA_REFRESH_TOKEN_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 604800 (7 days)</li><li><strong>Description:</strong> Determines how long the refresh token granted for single page applications is valid before it expires.</li></ul><h3 id="s2s-access-token-expires-in" tabindex="-1"><a class="header-anchor" href="#s2s-access-token-expires-in"><span>S2S_ACCESS_TOKEN_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 3600 (1 hour)</li><li><strong>Description:</strong> Determines how long the access token granted for server-to-server applications is valid before it expires.</li></ul><h3 id="id-token-expires-in" tabindex="-1"><a class="header-anchor" href="#id-token-expires-in"><span>ID_TOKEN_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 1800 (30 minutes)</li><li><strong>Description:</strong> Determines how long the ID token is valid before it expires.</li></ul><h3 id="server-session-expires-in" tabindex="-1"><a class="header-anchor" href="#server-session-expires-in"><span>SERVER_SESSION_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 1800 (30 minutes)</li><li><strong>Description:</strong> Determines how long the server session is valid before it expires. If set to 0, the server session will be disabled.</li></ul><h3 id="company-logo-url" tabindex="-1"><a class="header-anchor" href="#company-logo-url"><span>COMPANY_LOGO_URL</span></a></h3><ul><li><strong>Default:</strong> https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg</li><li><strong>Description:</strong> The logo used for branding.</li></ul><h3 id="google-auth-client-id" tabindex="-1"><a class="header-anchor" href="#google-auth-client-id"><span>GOOGLE_AUTH_CLIENT_ID</span></a></h3><ul><li><strong>Default:</strong> &quot;&quot;</li><li><strong>Description:</strong> The Google Authentication Client ID is required to enable the Google Sign-In function. This ID is obtained from the Google Developer Console and uniquely identifies your application to Google. If this value is left empty, the Google Sign-In button will be suppressed and the sign-in functionality will not be available.</li></ul><h3 id="enable-sign-up" tabindex="-1"><a class="header-anchor" href="#enable-sign-up"><span>ENABLE_SIGN_UP</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> Determines if user sign-up is allowed. If set to false, the sign-up button will be suppressed on the sign-in page.</li></ul><h3 id="enable-password-sign-in" tabindex="-1"><a class="header-anchor" href="#enable-password-sign-in"><span>ENABLE_PASSWORD_SIGN_IN</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> Determines if password sign-in is allowed. If you only want to support social sign-in, you can set ENABLE_SIGN_UP, ENABLE_PASSWORD_SIGN_IN and ENABLE_PASSWORD_RESET to false.</li></ul><h3 id="enable-password-reset" tabindex="-1"><a class="header-anchor" href="#enable-password-reset"><span>ENABLE_PASSWORD_RESET</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> Determines if user password reset is allowed. If set to false, the reset password button will be suppressed on the sign-in page. <a href="#email-functionality-setup">Email functionality setup required</a></li></ul><h3 id="password-reset-email-threshold" tabindex="-1"><a class="header-anchor" href="#password-reset-email-threshold"><span>PASSWORD_RESET_EMAIL_THRESHOLD</span></a></h3><ul><li><strong>Default:</strong> 5</li><li><strong>Description:</strong> Limits the number of password reset email requests allowed per email and IP address per day to protect against abuse.</li></ul><h3 id="enable-names" tabindex="-1"><a class="header-anchor" href="#enable-names"><span>ENABLE_NAMES</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> Provides fields for users to enter their first and last names during sign-up. If set to false, the first and last name fields will not show up on the sign-up page.</li></ul><h3 id="names-is-required" tabindex="-1"><a class="header-anchor" href="#names-is-required"><span>NAMES_IS_REQUIRED</span></a></h3><ul><li><strong>Default:</strong> false</li><li><strong>Description:</strong> Determines if users are required to provide their first and last names during sign-up.</li></ul><h3 id="enable-user-app-consent" tabindex="-1"><a class="header-anchor" href="#enable-user-app-consent"><span>ENABLE_USER_APP_CONSENT</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> Requires users to consent to grant access to each app after authentication.</li></ul><h3 id="enable-email-verification" tabindex="-1"><a class="header-anchor" href="#enable-email-verification"><span>ENABLE_EMAIL_VERIFICATION</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> If set to true, users will receive an email to verify their email address after signing up. <a href="#email-functionality-setup">Email functionality setup required</a></li></ul><h3 id="otp-mfa-is-required" tabindex="-1"><a class="header-anchor" href="#otp-mfa-is-required"><span>OTP_MFA_IS_REQUIRED</span></a></h3><ul><li><strong>Default:</strong> false</li><li><strong>Description:</strong> Enables OTP-based multi-factor authentication (MFA) for user sign-in. When set to true, users are required to configure OTP using an app like Google Authenticator during the sign-in process.</li></ul><h3 id="email-mfa-is-required" tabindex="-1"><a class="header-anchor" href="#email-mfa-is-required"><span>EMAIL_MFA_IS_REQUIRED</span></a></h3><ul><li><strong>Default:</strong> false</li><li><strong>Description:</strong> Controls email-based multi-factor authentication (MFA) for user sign-in. If set to true, users receive an MFA code via email to confirm their login. <a href="#email-functionality-setup">Email functionality setup required</a></li></ul><h3 id="enforce-one-mfa-enrollment" tabindex="-1"><a class="header-anchor" href="#enforce-one-mfa-enrollment"><span>ENFORCE_ONE_MFA_ENROLLMENT</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> This setting requires that users enroll in at least one form of Multi-Factor Authentication (MFA). This setting is only effective if both OTP_MFA_IS_REQUIRED and EMAIL_MFA_IS_REQUIRED are set to false. <a href="#email-functionality-setup">Email functionality setup required</a></li></ul><h3 id="allow-email-mfa-as-backup" tabindex="-1"><a class="header-anchor" href="#allow-email-mfa-as-backup"><span>ALLOW_EMAIL_MFA_AS_BACKUP</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> This setting allows users to use email-based MFA as an alternative method for signing in if they are enrolled in OTP MFA and not enrolled in email MFA. <a href="#email-functionality-setup">Email functionality setup required</a></li></ul><h3 id="account-lockout-threshold" tabindex="-1"><a class="header-anchor" href="#account-lockout-threshold"><span>ACCOUNT_LOCKOUT_THRESHOLD</span></a></h3><ul><li><strong>Default:</strong> 5</li><li><strong>Description:</strong> Number of failed login attempts before the user account is locked. Set to 0 to disable the account lockout feature.</li></ul><h3 id="account-lockout-expires-in" tabindex="-1"><a class="header-anchor" href="#account-lockout-expires-in"><span>ACCOUNT_LOCKOUT_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 86400 (1 day)</li><li><strong>Description:</strong> Duration (in seconds) for which the account remains locked after reaching the lockout threshold. Set to 0 for indefinite lockout until manual intervention.</li></ul><h3 id="unlock-account-via-password-reset" tabindex="-1"><a class="header-anchor" href="#unlock-account-via-password-reset"><span>UNLOCK_ACCOUNT_VIA_PASSWORD_RESET</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> User can unlock their account by reset password. <a href="#email-functionality-setup">Email functionality setup required</a></li></ul><h3 id="supported-locales" tabindex="-1"><a class="header-anchor" href="#supported-locales"><span>SUPPORTED_LOCALES</span></a></h3><ul><li><strong>Default:</strong> [&#39;en&#39;, &#39;fr&#39;]</li><li><strong>Description:</strong> Specifies the locales supported for identity pages and emails.</li></ul><h3 id="enable-locale-selector" tabindex="-1"><a class="header-anchor" href="#enable-locale-selector"><span>ENABLE_LOCALE_SELECTOR</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> Determines whether users can switch to a different locale on identity pages. If only one locale is supported (<code>SUPPORTED_LOCALE</code>), the locale selector will be suppressed, regardless of this setting.</li></ul>`,99),t=[l];function r(o,d){return s(),n("div",null,t)}const c=e(i,[["render",r],["__file","auth-server.html.vue"]]),p=JSON.parse('{"path":"/auth-server.html","title":"Server Setup","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Environment Setup (Cloudflare)","slug":"environment-setup-cloudflare","link":"#environment-setup-cloudflare","children":[{"level":3,"title":"1. Cloudflare Account Setup","slug":"_1-cloudflare-account-setup","link":"#_1-cloudflare-account-setup","children":[]},{"level":3,"title":"2. Cloudflare Resource Creation","slug":"_2-cloudflare-resource-creation","link":"#_2-cloudflare-resource-creation","children":[]},{"level":3,"title":"3. Project Setup","slug":"_3-project-setup","link":"#_3-project-setup","children":[]},{"level":3,"title":"4. Deploy","slug":"_4-deploy","link":"#_4-deploy","children":[]},{"level":3,"title":"Cloudflare Local development","slug":"cloudflare-local-development","link":"#cloudflare-local-development","children":[]}]},{"level":2,"title":"Environment Setup (Node)","slug":"environment-setup-node","link":"#environment-setup-node","children":[{"level":3,"title":"1. Node, Postgres and Redis setup","slug":"_1-node-postgres-and-redis-setup","link":"#_1-node-postgres-and-redis-setup","children":[]},{"level":3,"title":"2. Project setup","slug":"_2-project-setup","link":"#_2-project-setup","children":[]},{"level":3,"title":"3. Production Build","slug":"_3-production-build","link":"#_3-production-build","children":[]}]},{"level":2,"title":"Mailer Setup","slug":"mailer-setup","link":"#mailer-setup","children":[{"level":3,"title":"Prerequisites","slug":"prerequisites","link":"#prerequisites","children":[]},{"level":3,"title":"Configuration Steps","slug":"configuration-steps","link":"#configuration-steps","children":[]},{"level":3,"title":"Environment Behavior","slug":"environment-behavior","link":"#environment-behavior","children":[]}]},{"level":2,"title":"Additional Configs","slug":"additional-configs","link":"#additional-configs","children":[{"level":3,"title":"AUTHORIZATION_CODE_EXPIRES_IN","slug":"authorization-code-expires-in","link":"#authorization-code-expires-in","children":[]},{"level":3,"title":"SPA_ACCESS_TOKEN_EXPIRES_IN","slug":"spa-access-token-expires-in","link":"#spa-access-token-expires-in","children":[]},{"level":3,"title":"SPA_REFRESH_TOKEN_EXPIRES_IN","slug":"spa-refresh-token-expires-in","link":"#spa-refresh-token-expires-in","children":[]},{"level":3,"title":"S2S_ACCESS_TOKEN_EXPIRES_IN","slug":"s2s-access-token-expires-in","link":"#s2s-access-token-expires-in","children":[]},{"level":3,"title":"ID_TOKEN_EXPIRES_IN","slug":"id-token-expires-in","link":"#id-token-expires-in","children":[]},{"level":3,"title":"SERVER_SESSION_EXPIRES_IN","slug":"server-session-expires-in","link":"#server-session-expires-in","children":[]},{"level":3,"title":"COMPANY_LOGO_URL","slug":"company-logo-url","link":"#company-logo-url","children":[]},{"level":3,"title":"GOOGLE_AUTH_CLIENT_ID","slug":"google-auth-client-id","link":"#google-auth-client-id","children":[]},{"level":3,"title":"ENABLE_SIGN_UP","slug":"enable-sign-up","link":"#enable-sign-up","children":[]},{"level":3,"title":"ENABLE_PASSWORD_SIGN_IN","slug":"enable-password-sign-in","link":"#enable-password-sign-in","children":[]},{"level":3,"title":"ENABLE_PASSWORD_RESET","slug":"enable-password-reset","link":"#enable-password-reset","children":[]},{"level":3,"title":"PASSWORD_RESET_EMAIL_THRESHOLD","slug":"password-reset-email-threshold","link":"#password-reset-email-threshold","children":[]},{"level":3,"title":"ENABLE_NAMES","slug":"enable-names","link":"#enable-names","children":[]},{"level":3,"title":"NAMES_IS_REQUIRED","slug":"names-is-required","link":"#names-is-required","children":[]},{"level":3,"title":"ENABLE_USER_APP_CONSENT","slug":"enable-user-app-consent","link":"#enable-user-app-consent","children":[]},{"level":3,"title":"ENABLE_EMAIL_VERIFICATION","slug":"enable-email-verification","link":"#enable-email-verification","children":[]},{"level":3,"title":"OTP_MFA_IS_REQUIRED","slug":"otp-mfa-is-required","link":"#otp-mfa-is-required","children":[]},{"level":3,"title":"EMAIL_MFA_IS_REQUIRED","slug":"email-mfa-is-required","link":"#email-mfa-is-required","children":[]},{"level":3,"title":"ENFORCE_ONE_MFA_ENROLLMENT","slug":"enforce-one-mfa-enrollment","link":"#enforce-one-mfa-enrollment","children":[]},{"level":3,"title":"ALLOW_EMAIL_MFA_AS_BACKUP","slug":"allow-email-mfa-as-backup","link":"#allow-email-mfa-as-backup","children":[]},{"level":3,"title":"ACCOUNT_LOCKOUT_THRESHOLD","slug":"account-lockout-threshold","link":"#account-lockout-threshold","children":[]},{"level":3,"title":"ACCOUNT_LOCKOUT_EXPIRES_IN","slug":"account-lockout-expires-in","link":"#account-lockout-expires-in","children":[]},{"level":3,"title":"UNLOCK_ACCOUNT_VIA_PASSWORD_RESET","slug":"unlock-account-via-password-reset","link":"#unlock-account-via-password-reset","children":[]},{"level":3,"title":"SUPPORTED_LOCALES","slug":"supported-locales","link":"#supported-locales","children":[]},{"level":3,"title":"ENABLE_LOCALE_SELECTOR","slug":"enable-locale-selector","link":"#enable-locale-selector","children":[]}]}],"git":{"updatedTime":1725581813000,"contributors":[{"name":"Baozier","email":"byn9826@gmail.com","commits":20}]},"filePathRelative":"auth-server.md"}');export{c as comp,p as data};