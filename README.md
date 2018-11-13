
## 合约编辑器服务端管理及部署

#### 修改配置文件（config.js）

```js
{
  // 当前服务的监听端口
  port: '3000',
  // 协议: http:// 或者 https://
  protocol: 'http://',
  host: {
    // 生产环境主机地址(包含端口)
    production: 'seed1.bumo.io:16002',
    // 测试环境主机地址(包含端口)
    development: 'seed1.bumotest.io:26002',
    // 沙箱环境主机地址(包含端口)
    sandbox: '127.0.0.1:36002'
  },
  // Nginx代理之后的域名或主机地址(包含端口)
  domain: '127.0.0.1:3002',
  // 沙箱环境私钥
  privateKey: 'privC17CRRAjNvELrfbTFbLJstyGxk3unpPkRZCZoXRz13WEpN5SiHn8'
}

```

#### 合约编辑器服务端启动及管理
> 如果服务器上没有安装pm2, 请先安装pm2

```bash
$ npm install pm2 -g
```

> 进入项目目录

```bash
$ cd contract-editor-backend
```

> 安装依赖

```bash
$ npm install
```

> 服务管理

```bash
# 启动服务
$ npm start
# 重启服务
$ pm2 restart contract-editor-service
# 查看服务日志
$ pm2 log contract-editor-service
```

#### Nginx代理配置

``` nginx
# in the server {} configuration block

location / {
  rewrite  ^/service/(.*)$ /$1 break;
  proxy_pass   http://127.0.0.1:3000;
}

location /service {
  rewrite  ^/service/(.*)$ /$1 break;
  proxy_pass   http://127.0.0.1:3000;
}

location /production {
  rewrite  ^/production/(.*)$ /$1 break;
  proxy_pass   http://seed1.bumo.io:16002;
}

location /development {
  rewrite  ^/development/(.*)$ /$1 break;
  proxy_pass   http://seed1.bumotest.io:26002;
}

location /sandbox {
  rewrite  ^/sandbox/(.*)$ /$1 break;
  proxy_pass   http://127.0.0.1:36002;
}

```
