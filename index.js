/*
 * @Author: kael 
 * @Date: 2018-03-18 17:35:15 
 * @Last Modified by: kael
 * @Last Modified time: 2018-03-18 19:34:49
 */

const Koa = require('koa');
const app = new Koa();
const PORT = 3000;

const compress = require('koa-compress')({ flush: 2 });
const conditional = require('koa-conditional-get')();
const etag = require('koa-etag')();

function text(times = 100) {
  let data = [];
  while (times--) {
    data.push('1234567890');
  }
  return data.join('');
}

// 以下练习，有兴趣可以了解一下 nginx 怎么配置
app
  // 练习 etag 设置，了解其作用
  .use(conditional)
  .use(etag)
  // 练习 gzip 设置，了解其作用
  .use(compress)
  .use(async (ctx, next) => {
    // 练习 keep-live 设置，了解其作用
    // 由于测试环境连接的是本地服务，建立连接的时间很短，效果并不明显
    ctx.set('Connection', 'close');
    await new Promise(resolve => setTimeout(resolve, 500));

    // 练习 Expires 和 Cache-Control 设置
    let maxage = Math.max(parseInt(ctx.query.maxage, 10) || 0, 0);
    if (maxage) {
      ctx.set('Expires', new Date(+new Date + maxage * 1000).toUTCString());
      ctx.set('Cache-Control', 'max-age=' + maxage);
    }

    if (ctx.url.includes('.js')) {
      return ctx.body = `/** ${ctx.url} ${text()} */`;
    }

    let scripts = (counts = 1) => {
      let str = '';
      while (counts--) {
        str = `<script src="./${counts}.js?maxage=300"></script>` + str;
      }
      return str;
    };

    // 调整参数，观察浏览器可同时指出发出多少请求
    ctx.body = `${scripts(1)}`;
  });

app.listen(PORT);

console.log(`Server listening on http://localhost: ${PORT}`);
