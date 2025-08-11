# 如何轮换 JWT 密钥

轮换 JWT 密钥的步骤如下：

1. 生成新的 JWT 密钥：
根据你的环境运行密钥生成脚本。
运行完成后，新的一对 JWT 密钥将生效。旧密钥会被标记为已弃用，这意味着旧密钥将不再用于签发新的令牌，但使用旧密钥签发的现有令牌仍会被验证通过。

```
cd server
npm run node:secret:generate # 适用于 node 环境
npm run dev:secret:generate # 适用于 Cloudflare 本地环境
npm run prod:secret:generate # 适用于 Cloudflare 远程环境
```

2. 清理旧密钥：
当你希望停止验证使用旧密钥签发的令牌时，运行密钥清理脚本。执行后，旧密钥将被移除，使用旧密钥签发的令牌将不再有效。

```
cd server
npm run node:secret:clean # 适用于 node 环境
npm run dev:secret:clean # 适用于 Cloudflare 本地环境
npm run prod:secret:clean # 适用于 Cloudflare 远程环境
```
