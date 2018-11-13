
## 合约编辑器服务端管理及部署

### 根据实际情况修改配置文件（config.js）

```
1. 修改当前域名, 需要将 config.js 文件中的domain 修改为当前域名，如： 'cme.bumo.io'
2. 如果需要https支持，需要将 config.js 文件中的protocol 修改为 'https://'
```

### 合约编辑器服务端启动及管理
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

### Nginx代理配置

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
