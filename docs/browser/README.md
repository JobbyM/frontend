# 浏览器
## 事件机制
### 事件触发有三个阶段
* `window` 往事件触发处传播，遇到注册的捕获事件会触发
* 传播到事件触发处时触发注册的事件
* 从事件触发处往 `window` 传播，遇到注册的冒泡事件会触发

事件触发一般来说会按照上面的顺序进行，但是也有特例，如果给一个目标节点同时注册冒泡和捕获事件，事件触发会按照注册的顺序执行。
```js
// 以下会先打印冒泡然后是捕获
node.addEventListener(
  'click',
  event => {
    console.log('冒泡')
  },
  false
)
node.addEventListener(
  'click',
  event => {
    console.log('捕获 ')
  },
  true
)
```

### 注册事件
通常我们使用 `addEventListener` 注册事件，该函数的第三个参数可以是布尔值，也可以是对象。对于布尔值 `useCapture` 参数来说，该参数默认值为 `false` 。`useCapture` 决定了注册的事件是捕获事件还是冒泡事件。对于对象参数来说，可以使用以下几个属性

* `capture`，布尔值，和 `useCapture` 作用一样
* `once`，布尔值，值为 `true` 表示该回调只会调用一次，调用后会移除监听
* `passive`，布尔值，表示永远不会调用 `preventDefault`

一般来说，我们只希望事件只触发在目标上，这时候可以使用 `stopPropagation` 来阻止事件的进一步传播。通常我们认为 `stopPropagation` 是用来阻止事件冒泡的，其实该函数也可以阻止捕获事件。`stopImmediatePropagation` 同样也能实现阻止事件，但是还能阻止该事件目标执行别的注册事件。
```js
node.addEventListener(
  'click',
  event => {
    event.stopImmediatePropagation()
    console.log('冒泡')
  },
  false
)
// 点击 node 只会执行上面的函数，该函数不会执行
node.addEventListener(
  'click',
  event => {
    console.log('捕获 ')
  },
  true
)
```

### 事件代理
如果一个节点中的子节点是动态生成的，那么子节点需要注册事件的话应该注册在父节点上
```html
<ul id="ul">
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
  <li>5</li>
</ul>
<script>
  let ul = document.querySelector('#ul')
  ul.addEventListener('click', event => {
    console.log(event.target)
  })
</script>
```

事件代理的方式相对于直接给目标注册事件来说，有以下优点

* 节省内存
* 不需要给子节点注销事件

## 跨域
因为浏览器出于安全考虑，有同源策略。也就是说，如果协议、域名或者端口有一个不同就是跨域，Ajax 请求会失败。

我们可以通过以下几种常用方法解决跨域的问题 [参考跨域实现](https://www.cnblogs.com/fundebug/p/10329202.html)

### JSONP
JSONP 的原理很简单，就是利用 `<script>` 标签没有跨域限制的漏洞。当需要通讯时，通过 `<script>` 标签指向一个需要访问的地址并提供一个回调函数来接收数据。

JSONP 使用简单且兼容性不错，但是只限于 `get` 请求。

在开发中可能会遇到多个 JSONP 请求的回调函数名是相同的，这时候就需要自己封装一个 JSONP，以下是简单实现
```js
function jsonp (url, jsonpCallback, success) {
  let script = document.createElement('script')
  script.src = url
  script.async = true
  script.type = 'text/javascript'
  window[jsonpCallback] = function (data) {
    success && success(data)
  }
}

jsonp('http://hostname:port/api/foo', 'callback', function (value) {
  console.log(value)
})
```

### CORS
CORS 需要浏览器和后端同时支持。IE 8 和 9 需要通过 `XDomainRequest` 来实现。

浏览器会自动进行 CORS 通信，实现 CORS 通信的关键是后端。只要后端实现了 CORS，就实现了跨域。

服务端设置 `Access-Control-Allow-Origin` 就可以开启 CORS。 该属性表示哪些域名可以访问资源，如果设置通配符（*）则表示所有网站都可以访问资源。

### document.domain + iframe
该方式只能用于二级域名相同的情况下，比如 `www.abc.com` 和 `api.abc.com` 适用于该方式。

只需要给页面添加 `document.domain = 'abc.com'` 表示二级域名都相同就可以实现跨域

实现原理：两个页面都通过 js 强制设置 document.domain 为基础主域，就实现了同域。

我们看个例子：页面 `www.abc.com:3000/a.html` 获取页面 `api.abc.com:3000/b.html` 中 a 的值

a.html
```html
<body>
 helloa
  <iframe src="api.abc.com:3000/b.html" frameborder="0" onload="load()" id="frame"></iframe>
  <script>
    document.domain = 'abc.com'
    function load() {
      console.log(frame.contentWindow.a);
    }
  </script>
</body>
```

b.html
```html
<body>
   hellob
   <script>
     document.domain = 'abc.com'
     var a = 100;
   </script>
</body>
```
### postMessage
这种方式通常用于获取嵌入页面中的第三方页面数据。一个页面发送消息，另一个页面判断来源并接收消息
```js
// 发送消息端
window.parent.postMessage('message', 'http://abc.com')
// 接收消息端
var mc = new MessageChannel()
mc.addEventListener('message', event => {
  var origin = event.origin || event.originalEvent.origin
  if (origin === 'http://abc.com') {
    console.log('验证通过')
  }
})
```

接下来我们看个例子： `http://localhost:3000/a.html` 页面向 `http://localhost:4000/b.html` 传递“我爱你”,然后后者传回"我不爱你"。

a.html
```html
  <iframe src="http://localhost:4000/b.html" frameborder="0" id="frame" onload="load()"></iframe> //等它加载完触发一个事件
  //内嵌在http://localhost:3000/a.html
    <script>
      function load() {
        let frame = document.getElementById(‘frame‘)
        frame.contentWindow.postMessage(‘我爱你‘, ‘http://localhost:4000‘) //发送数据
        window.onmessage = function(e) { //接受返回数据
          console.log(e.data) //我不爱你
        }
      }
    </script>
```

b.html
```html
  window.onmessage = function(e) {
    console.log(e.data) //我爱你
    e.source.postMessage(‘我不爱你‘, e.origin)
 }
```

### WebSocket
Webocket 是 HTML5 的一个持久化的协议，它实现了浏览器与服务器的全双工通信，同时也是跨域的一种解决方案。WebSocket 和 HTTP 都是应用层协议，都基于 TCP 协议。但是 WebSocket 是一种双向通信协议，在建立连接之后，WebSocket 的 server 与 client 都能主动向对方发送或接收数据。同时，WebSocket 在建立连接时需要借助 HTTP 协议，连接建立好了之后 client 与 server 之间的双向通信就与 HTTP 无关了。

### Node 中间件代理(两次跨域)
实现原理：同源策略是浏览器需要遵循的标准，而如果是服务器向服务器请求就无需遵循同源策略。
代理服务器，需要做以下几个步骤：

1. 接受客户端请求 。
2. 将请求 转发给服务器。
3. 拿到服务器 响应 数据。
4. 将 响应 转发给客户端。

![Node Middleware Agent](./images/7.png)

### nginx 反向代理
实现原理类似于 Node 中间件代理，需要你搭建一个中转 nginx 服务器，用于转发请求。

使用 nginx 反向代理实现跨域，是最简单的跨域方式。只需要修改 nginx 的配置即可解决跨域问题，支持所有浏览器，支持 session，不需要修改任何代码，并且不会影响服务器性能。

实现思路：通过 nginx 配置一个代理服务器（域名与 domain1 相同，端口不同）做跳板机，反向代理访问 domain2 接口，并且可以顺便修改 cookie 中 domain 信息，方便当前域 cookie 写入，实现跨域登录。

先下载 nginx，然后将nginx目录下的 nginx.conf 修改如下:
```bash
// proxy服务器
server {
    listen       81;
    server_name  www.domain1.com;
    location / {
        proxy_pass   http://www.domain2.com:8080;  #反向代理
        proxy_cookie_domain www.domain2.com www.domain1.com; #修改cookie里域名
        index  index.html index.htm;

        # 当用webpack-dev-server等中间件代理接口访问nignx时，此时无浏览器参与，故没有同源限制，下面的跨域配置可不启用
        add_header Access-Control-Allow-Origin http://www.domain1.com;  #当前端只跨域不带cookie时，可为*
        add_header Access-Control-Allow-Credentials true;
    }
}
```

### window.name + iframe
window.name 属性的独特之处：name 值在不同的页面（甚至不同域名）加载后依旧存在，并且可以支持非常长的 name 值（2MB）。

其中 a.html 和 b.html 是同域的，都是 `http://localhost:3000` ; 而 c.html 是 `http://localhost:4000`

a.html(`http://localhost:3000/b.html`)
```html
  <iframe src="http://localhost:4000/c.html" frameborder="0" onload="load()" id="iframe"></iframe>
  <script>
    let first = true
    // onload事件会触发2次，第1次加载跨域页，并留存数据于window.name
    function load() {
      if(first){
      // 第1次onload(跨域页)成功后，切换到同域代理页面
        let iframe = document.getElementById(‘iframe‘);
        iframe.src = ‘http://localhost:3000/b.html‘;
        first = false;
      }else{
      // 第2次onload(同域b.html页)成功后，读取同域window.name中数据
        console.log(iframe.contentWindow.name);
      }
    }
  </script>
```
b.html 为中间代理页，与 a.html 同域，内容为空。

c.html(`http://localhost:4000/c.html`)
```html
  <script>
    window.name = ‘我不爱你‘  
  </script>
```

总结：通过 iframe 的 src 属性由外域转向本地域，跨域数据即由 iframe 的 window.name 从外域传递到本地域。这个就巧妙地绕过了浏览器的跨域访问限制，但同时它又是安全操作


### location.hash + iframe
实现原理： a.html 欲与 c.html 跨域相互通信，通过中间页 b.html 来实现。 三个页面，不同域之间利用 iframe 的 location.hash 传值，相同域之间直接 js 访问来通信。

具体实现步骤：一开始 a.html 给 c.html 传一个 hash 值，然后 c.html 收到 hash 值后，再把 hash 值传递给 b.html，最后 b.html 将结果放到 a.html 的 hash 值中。
同样的，a.html 和 b.html 是同域的，都是 `http://localhost:3000;` 而 c.html 是 `http://localhost:4000`

a.html
```html
  <iframe src="http://localhost:4000/c.html#iloveyou"></iframe>
  <script>
    window.onhashchange = function () { //检测hash的变化
      console.log(location.hash);
    }
  </script>
```

b.html
```html
  <script>
    window.parent.parent.location.hash = location.hash 
    //b.html将结果放到a.html的hash值中，b.html可通过parent.parent访问a.html页面
  </script>
```

c.html
```js
  console.log(location.hash);
  let iframe = document.createElement(‘iframe‘);
  iframe.src = ‘http://localhost:3000/b.html#idontloveyou‘;
  document.body.appendChild(iframe);
```

## EventLoop
[tasks-microtasks-queues-and-schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
众所周知 JS 是门非阻塞单线程语言，因为在最初 JS 就是为了和浏览器交互而诞生的。如果 JS 是门多线程的语言话，我们在多个线程中处理 DOM 就可能会发生问题（一个线程中新加节点，另一个线程中删除节点），当然可以引入读写锁解决这个问题。

JS 在执行的过程中会产生执行环境，这些执行环境会被顺序的加入到执行栈中。如果遇到异步的代码，会被挂起并加入到 Task（有多种 task） 队列中。一旦执行栈为空，Event Loop 就会从 Task 队列中拿出需要执行的代码并放入执行栈中执行，所以本质上来说 JS 中的异步还是同步行为。
```js
console.log('script start')

setTimeout(function() {
  console.log('setTimeout')
}, 0)

console.log('script end')
```

以上代码虽然 `setTimeout` 延时为 0，其实还是异步。这是因为 HTML5 标准规定这个函数第二个参数不得小于 4 毫秒，不足会自动增加。所以 `setTimeout` 还是会在 `script end` 之后打印。

不同的任务源会被分配到不同的 Task 队列中，任务源可以分为 微任务（microtask） 和 宏任务（macrotask）。在 ES6 规范中，microtask 称为 `jobs`，macrotask 称为 `task`。
```js
console.log('script start')

setTimeout(function() {
  console.log('setTimeout')
}, 0)

new Promise(resolve => {
  console.log('Promise')
  resolve()
})
  .then(function() {
    console.log('promise1')
  })
  .then(function() {
    console.log('promise2')
  })

console.log('script end')
// script start => Promise => script end => promise1 => promise2 => setTimeout
```

以上代码虽然 `setTimeout` 写在 `Promise` 之前，但是因为 `Promise` 属于微任务而 `setTimout` 属于宏任务，所以会有以上打印。

微任务包括 `process.nextTick` ，`promise` ，`Object.observe` ，`MutationObserve`

宏任务包括 `script` ，`setTimeout` ，`setInterval` ， `setImmediate` ， `I/O` ，`UI rendering`

很多人有关误区，认为微任务快于宏任务，其实是错误的。因为宏任务中包括了 `script` ，浏览器会执行一个宏任务，接下来有异步代码的话就先执行微任务。

所以一次正确的 Event Loop 是这样的

1. 执行同步代码，这属于宏任务
2. 执行栈为空，查询是否有微任务需要执行
3. 执行所有微任务
4. 必要的话渲染 UI
5. 然后开始下一轮 Event Loop，执行宏任务中的异步代码

通过上述的Event Loop 顺序可知，如果宏任务中的异步代码有大量的计算并且需要操作 DOM 的话，为了更快的界面响应，我们可以把操作 DOM 放入微任务中。


这是另一个微任务、宏任务的相关的
```js
let first = () => (new Promise((resovle, reject) => {
    console.log(3);
    let p = new Promise((resovle, reject) => {
        console.log(7);
        setTimeout(() => {
            console.log(5);
            resovle(6);
        }, 0)
        resovle(1);
    });
    resovle(2);
    p.then((arg) => {
        console.log(arg);
    });

}));
first().then((arg) => {
    console.log(arg);
});
console.log(4);
```

输出
```js
3
7
4
1
2
5
```

### Node 中的Event Loop
Node 中的 Event Loop 和浏览器总中的不相同。

Node 的 Event Loop 分为 6 个阶段，它们会按照顺序反复运行

```
   ┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘                 ┌───────────────┐
│  ┌──────────┴────────────┐                 │   incoming:   │
│  │         poll          │<──connections───                │
│  └──────────┬────────────┘                 │   data, etc.  │
│  ┌──────────┴────────────┐                 └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
   └───────────────────────┘
```

### timer
timers 阶段会执行 `setTimeout` 和 `setInterval`

一个 `timer` 指定的时间并不是准确时间，而是在达到这个时间后尽快执行回调，可能会因为系统正在执行别的事务而延迟。

下限的时间有一个范围：`[1, 2147483647]` ，如果设定的时间不在这个范围，将被设置为 1。

### I/O
I/O 阶段会执行除了 close 事件，定时器和 `setImmediate` 的回调

### idle, prepare
idle, prepare 阶段内部实现

### poll
poll 阶段很重要，这一阶段中，系统会做两件事

1. 执行到点的定时器
2. 执行 poll 队列中的事件

并且当 poll 中没有定时器的情况下，会发现以下两件事情

* 如果 poll 队列不为空，会遍历回调队列并同步执行，直到队列为空或者系统限制
* 如果 poll 队列为空，会有两件事发生
  * 如果有 `setImmediate` 需要执行，poll 阶段会停止并且进入到 check 阶段执行 `setImmediate`
  * 如果没有 `setImmediate` 需要执行，会等待回调被加入到队列中并立即执行回调

如果有别的定时器需要执行，会回到 timer 阶段执行回调。

### check
check 阶段执行 `setImmediate`

### close callbacks
close callbacks 阶段执行 close 事件

并且在 Node 中，有些情况下的定时器执行顺序是随机的
```js
setTimeout(() => {
  console.log('setTimeout')
}, 0)
setImmediate(() => {
  console.log('setImmediate')
})
// 这里可能会输出 setTimeout，setImmediate
// 可能也会相反的输出，这取决于性能
// 因为可能进入 event loop 用了不到 1 毫秒，这时候会执行 setImmediate
// 否则会执行 setTimeout
```

当然在这种情况下，执行顺序是相同的
```js
var fs = require('fs')

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout')
  }, 0)
  setImmediate(() => {
    console.log('immediate')
  })
})
// 因为 readFile 的回调在 poll 中执行
// 发现有 setImmediate ，所以会立即跳到 check 阶段执行回调
// 再去 timer 阶段执行 setTimeout
// 所以以上输出一定是 setImmediate，setTimeout
```

上面介绍的都是 macrotask 的执行情况，microtask 会在以上每个阶段完成后立即执行。
```js
setTimeout(() => {
  console.log('timer1')

  Promise.resolve().then(function() {
    console.log('promise1')
  })
}, 0)

setTimeout(() => {
  console.log('timer2')

  Promise.resolve().then(function() {
    console.log('promise2')
  })
}, 0)

// 以上代码在浏览器和 node 中打印情况是不同的
// 浏览器中一定打印 timer1, promise1, timer2, promise2
// node 中可能打印 timer1, timer2, promise1, promise2
// 也可能打印 timer1, promise1, timer2, promise2
```

Node 中的 `process.nextTick` 会先于其他 microtask 执行。
```js
setTimeout(() => {
  console.log('timer1')

  Promise.resolve().then(function() {
    console.log('promise1')
  })
}, 0)

process.nextTick(() => {
  console.log('nextTick')
})
// nextTick, timer1, promise1
```

## 存储
### cookie, localStorage, sessionStorage, indexDB
|特性|cookie|localStorage|sessionStorage|indexDB|
|:-:|:-:|:-:|:-:|:-:|
|数据生命周期|一般由服务器生成，可以设置过期时间|除非被清除，否则一直存在|页面关闭就清理|除非被清理，否则一直存在|
|数据存储大小|4K|5M|5M|无限|
|与服务端通信|每次都会携带在 header 中，对于请求性能影响|不参与|不参与|不参与|

从上表可以看到，`cookie` 已经不建议用于存储。如果没有大量数据存储需求的话，可以使用 `localStorage` 和 `sessionStorage` 。对于不怎么改变的数据尽量使用 `localStorage` 存储，否则可以用 `sessionStorage` 存储。

对于 `cookie`，我们还需要注意安全性。
|属性|作用|
|:-:|:-:|
|value|如果用于保存用户登录状态，应该将值加密，不能使用明文的用户标识|
|http-only|不能通过 JS 访问 Cookie ， 减少 XSS 攻击|
|secure|只能在协议为 HTTPS 的请求中携带|
|same-site|规定浏览器不能在跨域请求中携带 Cookie，减少CSRF 攻击|

### Service Worker
> Service workers 本质上充当 Web 应用程序与浏览器之间的代理服务器，也可以在网络可用时作为浏览器和网络间的代理。它们旨在（除其他之外）使得能够创建有效的离线体验，拦截网络请求并基于网络是否可用以及更新的资源是否驻留在服务器上来采取适当的动作。他们还允许访问推送通知和后台同步 API。

目前该技术通常用来做缓存文件，提高首屏速度，可以试着来实现这个功能。
```js
// index.js
if (navigator.serviceWorker) {
  navigator.serviceWorker
    .register('sw.js')
    .then(function(registration) {
      console.log('service worker 注册成功')
    })
    .catch(function(err) {
      console.log('servcie worker 注册失败')
    })
}
// sw.js
// 监听 `install` 事件，回调中缓存所需文件
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('my-cache').then(function(cache) {
      return cache.addAll(['./index.html', './index.js'])
    })
  )
})

// 拦截所有请求事件
// 如果缓存中已经有请求的数据就直接用缓存，否则去请求数据
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response) {
        return response
      }
      console.log('fetch source')
    })
  )
})
```

打开页面，可以在开发者工具中的 `Application` 看到 Service Worker 已经启动了
![Application Service Worker start](./images/0.png)

在 Cache 中也可以发现我们所需的文件已被缓存
![Application Cache](./images/1.png)

当我们重新刷新页面可以发现我们缓存的数据是从 Service Worker 中读取的
![Application Network](./images/2.png)

## 渲染机制
浏览器的渲染机制一般分为以下几个步骤

1. 处理 HTML(HyperText Markup Language) 并构建 DOM(Document Object Model) 树
2. 处理 CSS(Cascading Style Sheets) 构建 CSSOM 树
3. 将 DOM 和 CSSOM 合并成一个渲染树
4. 根据渲染树来布局，计算每个节点的位置
5. 调用 GPU 绘制，合成图层，显示在屏幕上

![render](./images/3.png)

在构建 CSSOM 树时，会阻塞渲染，直至 CSSOM 树构建完成。并且构建 CSSOM 树是一个十分消耗性能的过程，所以应该尽量保证层级扁平，减少过度层叠，越是具体的 CSS 选择器，执行速度越慢。

当 HTML 解析到 script 标签时，会暂停构建 DOM 树，完成后才会从暂停的地方重新开始。也就说，如果你想首屏渲染的越快，就越不应该在首屏就加载 JS 文件。并且 CSS 也会影响到 JS 的执行，只有当解析完样式表才会执行 JS，所以也可以认为这种情况下，CSS 也会暂停构建 DOM。
![render html](./images/4.png)
![render application](./images/5.png)

### Load 和 DOMContentLoaded 区别
Load 事件触发代表页面中的 DOM，CSS，JS，图片已经全部加载完毕。

DOMContentLoaded 事件触发代表初始的 HTML 被完全加载和解析，不需要等待 CSS，JS，图片加载。

### 图层
一般来说，可以把普通文档流看成一个图层。特定的属性可以生成一个新的图层。**不同的图层渲染互不影响**，所以对于某些需要频繁渲染的建议单独生成一个新图层，提高性能。**但也不能生成过多的图层，会引起反作用**。

通过以下几个常用属性可以生成新图层

* 3D 变换：`translate3d` 、 `translateZ`
* `will-change`
* `video` 、`iframe` 标签
* 通过动画实现的 `opacity` 动画转换
* `position: fixed`

### 重绘（Repaint）和回流（Reflow）
重绘和回流是渲染步骤中的一小节，但是这两个步骤对于性能影响很大。

* 重绘是当节点需要更改外观而不会影响布局的，比如改变 `color` 就称为重绘
* 回流是布局或者几何属性需要改变就称为回流

回流必定会发生重绘，重绘不一定会引发回流。回流所需成本比重绘高的多，改变深层次节点很可能导致父节点的一系列回流。

所以以下几个动作可能会导致性能问题：

* 改变 window 大小
* 改变字体
* 添加或删除样式
* 文字改变
* 定位或者浮动
* 盒模型


现代的浏览器都是很聪明的，由于每次重排都会造成额外的计算消耗，因此大多数浏览器都会通过队列化修改并批量执行来优化重排过程。浏览器会将修改操作放入到队列里，直到过了一段时间或者操作达到了一个阈值，才清空队列。但是！**当你获取布局信息的操作的时候，会强制队列刷新**，比如当你访问以下属性或者使用以下方法：

* offsetTop、offsetLeft、offsetWidth、offsetHeight
* scrollTop、scrollLeft、scrollWidth、scrollHeight
* clientTop、clientLeft、clientWidth、clientHeight
* getComputedStyle()
* getBoundingClientRect()

以上属性和方法都需要返回最新的布局信息，因此浏览器不得不清空队列，触发`回流重绘`来返回正确的值。因此，我们在修改样式的时候，最好避免使用上面列出的属性，他们都会刷新渲染队列。如果要使用它们，最好将值缓存起来。

很多人不知道的是，重绘和回流其实和Event Loop 有关。

1. 当 Event Loop 执行完 Microtasks 后，会判断 document 是否需要更新。因为浏览器是 60Hz 的刷新率，每 16ms 才会更新一次。
2. 然后判断是否有 `resize` 或者 `scroll`，有的话会去触发事件，所以 `resize` 和 `scroll` 事件也是至少 16ms 才会触发一次，并且自带节流功能。
3. 判断是否触发了 media query。
4. 更新动画并且发送事件。
5. 判断是否有全屏操作事件。
6. 执行 `requestAnimationFrame` 回调。
7. 执行 `IntersectionObserver` 回调，该方法用于判断元素是否可见，可以用于懒加载上，但是兼容性不好。
8. 更新界面。
9. 以上就是一帧中可能会做的事情。如果在一帧中有空闲时间，就回去执行 `requestIdleCallback` 回调。

以上内容来自 [HTML 文档](https://html.spec.whatwg.org/multipage/webappapis.html##event-loop-processing-model)

### 减少重绘和回流
可以参考[你真的了解回流重绘](https://segmentfault.com/a/1190000017329980)

* 使用 `translate` 替代 `top`
```html
<div class="test"></div>
<style>
  .test {
    position: absolute;
    top: 10px;
    width: 100px;
    height: 100px;
    background: red;
  }
</style>
<script>
  setTimeout(() => {
    // 引起回流
    document.querySelector('.test').style.top = '100px'
  }, 1000)
</script>
```
* 使用 `visibility` 替代 `display:none` ，因为前者只会引起重绘，后者会引发回流（改变了布局）
* 把 DOM 离线后修改，比如：先把 DOM 给 `display:none` （有一次回流），然后你修改 100 次，最后再把它显示出来
* 不要把 DOM 节点的属性值放在一个循环里当成循环里的变量
```js
for (let i = 0; i < 1000; i ++) {
  // 获取 offsetTop 会导致回流，因为需要去获取正确的值
  console.log(document.querySelector('.test').style.offsetTop)
}
```
* 不要使用 table 布局，可能很小的一个小改动会造成整个 table 的重新布局
* 动画实现的速度的选择，动画速度越快，回流次数越多，也可以选择使用 `requiestAnimationFrame`
* CSS 选择符从右向左匹配查找，避免 DOM 深度过深
* 将频繁运行的动画变为图层，图层能够阻止该节点回流影响别的元素。比如对于 `video` 标签，浏览器会自动将该节点变为图层。
![reflow repait](./images/6.png)
* 使用文档片段(document fragment)在当前DOM之外构建一个子树，再把它拷贝回文档
* 将原始元素拷贝到一个脱离文档的节点中，修改节点后，再替换原始的元素


