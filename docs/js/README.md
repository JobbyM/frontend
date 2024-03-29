# JS
## 内置类型
JS 中分为八 种内置类型，八 种内置类型又分为两大类型：基本类型和对象（Object）。

基本类型有七 种：`null`，`undefined`，`boolean`，`number`, `bigint`, `string`,`symbol`。

其中JS 的数字类型是浮点类型的，没有整型。并且浮点类型基于IEEE 754标准实现，在使用中会遇到某些Bug。`NaN` 也属于 `number` 类型，并且 `NaN` 不等于自身。

对象（Object）是引用类型，在使用过程中会遇到浅拷贝和深拷贝的问题。
```js
let obj = { name: 'Foo' }
let copy = obj
copy.name = 'Bar'
console.log(copy.name) // => Bar
```

## typeof
`typeof` 对于基本类型，除了 `null` 都可以显示正确的类型
```js
typeof 1 // => 'number'
typeof 1n // => 'binint'
typeof '1' // => 'string'
typeof undefined // => 'undefined'
typeof true // => 'boolean'
typeof Symbol() // => 'symbol'
typeof b // => b 没有声明，但是还会显示 undefined
```

对于 `null` 来说，虽然它是基本类型，但是会显示 `object`，这是一个存在很久了的 Bug。
```js
typeof null // => 'object'
```
PS：为什么会出现这种情况呢？因为在JS 的最初版本中，使用的是32 位系统，为了性能考虑使用低位存储了变量的类型信息，`000` 开头代表是对象，然而 `null` 表示为全零，所以将它错误的判断为 `object` 。虽然现在的内部类型判断代码已经改变了，但是对于这个 Bug 却是一直流传下来。

PS2：另一种说法是 `typeof null` 返回了 `object` , 并不是 `null` ,尽管Null 它自己就是一种类型。`null` 意味着“不存在的对象”的值，而 `undefined` 代表着“不存在”的值。

![typeofnull](./images/4.jpg)

跟着这条思路，Brendan Eich 按照 Java 的精神将 JavaScript 中的 `typeof` 运算设计为任何值都返回 `object` ，比如所有的对象和 `null`。这就是规范中有个单独的Null 类型，但是`typeof null === 'object'` 依然成立。

![typeofnull===object](./images/5.jpg)

`typeof` 对于对象，除了函数都会显示 `object`
```js
typeof [] // => 'object'
typeof {} // => 'object'
typeof console.log // => 'function'
```

如果我们想获得一个变量的正确类型，可以通过 `Object.prototype.toString.call()` 。这样我们就可以获得类似 `[object Type]` 的字符串。

```js
let a
// 我们也可以这样判断 undefined
a === undefined
// 但是 undefined 不是保留字，能够在低版本浏览器被赋值
let undefined = 1
// 这样判断就会出错
// 所以可以用下面的方式来判断，并且代码量更少
// 因为 void 后面随便跟上一个组成表达式
// 返回就是 undefined
a === void 0
```

## 类型转换
### 转Boolean
在条件判断时，除了 `undefined`， `null`， `false`， `NaN`， `''`， `0`， `-0`，其他所有值都转为 `true`，包括所有对象。

### 对象转基本类型
对象在转换基本类型时，首先会调用 `valueOf` 然后调用 `toString`。并且这两个方法你是可以重写的。
```js
let a = {
  valueOf() {
    return 0
  }
}
```

当然你也可以重写 `Symbol.toPrimitive`, 该方法在转基本类型时调用优先级最高。
```js
let a = {
  valueOf() {
    return 0;
  },
  toString() {
    return '1';
  },
  [Symbol.toPrimitive]() {
    return 2;
  }
}
1 + a // => 3
'1' + a // => '12'
```

### 四则运算符
只有当加法运算时，其中一方是字符串类型，就会把另一个也转为字符串类型。其他运算只要其中一方是数字，那么另一方就转为数字。并且加法运算会触发三种类型转换：将值转换为原始值，转换为数字，转换为字符串。
```js
1 + '1' // => '11'
2 * '2' // => 4
[1, 2] + [2, 1] // => '1,22,1'
// [1, 2].toString()   => '1,2'
// [2, 1].toString()   => '2,1'
// '1,2' + '2,1' = '1,22,1'
```

对于加号需要注意这个表达式 `'a' + + 'b'`
```js
'a' + + 'b'  // => 'aNaN'
// 因为 + 'b' => NaN
// 你也许在一些代码中看到过 + '1' => 1
```

### == 操作符
![== operator](./images/0.png)

上图中的 `toPrimitive` 就是对象转基本类型。

这里来解析一道题目 `[] == ![] // => true`，下面就是这个表达式为何为 `true` 的步骤
```js
// [] 转成 true， 然后取反变成 false
[] == false
// 根据第 8 条得出
[] == ToNumber(false)
[] == 0
// 根据第 10 条得出
ToPrimitive([]) == 0
// [].toString() // => ''
'' == 0
// 根据第 6 条得出
0 == 0 // => true
```

### 比较运算符
1. 如果是对象，就通过 `toPrimitive` 转换对象
2. 如果是字符串，就通过 `unicode`  字符索引来比较

## 原型
![prototype](./images/1.jpg)
图片来自：http://www.mollypages.org/tutorials/js.mp


每个函数都有 `prototype` 属性，除了 `Function.prototype.bind()`, 该属性指向原型。

每个对象都有 `__proto__` 属性，指向了创建该对象的构造函数的原型。其实这个属性指向了 `[[prototype]]` ，但是 `[[prototype]]` 是内部属性，我们并不能访问，所以使用 `__proto__` 来访问。

对象可以通过 `__proto__` 来寻找不属于该对象的属性， `__proto__` 将对象链接起来组成了原型链。

如果你想更进一步的了解原型，可以仔细阅读[深度解析原型中的各个难点](https://github.com/KieSun/Dream/issues/2)。

## new
1. 新生成了一个对象
2. 链接到原型
3. 绑定this，执行构造函数
4. 返回新对象

在调用 `new` 的过程中会发生以上四件事情，我们也可以试着来自己实现一个 `new`
```js
function create() {
  // 创建一个空对象
  let obj = new Object()
  // 获得构造函数
  let Con = [].shift.call(arguments)
  // 链接到原型
  obj.__proto__ = Con.prototype
  // 绑定 this， 执行构造函数
  let result = Con.apply(obj, arguments)
  // 确保 new 出来的是个对象
  return typeof result === 'object' ? result : obj
}
```

对于实例对象来说，都是通过 `new` 产生的，无论是 `function Foo()` 还是 `let a = { b : 1 }` 。

对于创建一个对象来说，更推荐使用字面量的方式创建对象。因为你使用 `new Object()` 的方式创建对象需要通过作用域链一层层找到 `Object`，但是你使用字面量的方式就没这个问题。
```js
function Foo() {}
// function 就是个语法糖
// 内部等同于 new Function()
let a = { b: 1 }
// 这个字面量内部也是使用了 new Object()
```

对于 `new` 来说，还需要注意下运算符优先级。
```js
function Foo() {
  return this
}

Foo.getName = function () {
  console.log('1')
}

Foo.prototype.getName = function () {
  console.log('2')
}

new Foo.getName()    // => 1
new Foo().getName()    // => 2
```

![precedence operator](./images/2.png)

从上图可以看出， `new Foo()` 的优先级大于 `new Foo` ，所以对于上述代码来说可以这样划分执行顺序
```js
new (Foo.getName())
(new Foo()).getName()
```

对于第一个函数来说，先执行了 `Foo.getName()` ， 所以结果为 1；对于后者来说，先执行 `new Foo()` 产生了一个实例，然后通过原型链找到了 `Foo` 上的 `getName` 函数，所以结果为 2。

## instanceof
 `instanceof` 可以正确地判断对象的类型，因为内部机制是通过判断对象的原型链中是不是能找到类型的 `prototype`。

我们也可以试着实现一个 `instanceof`
```js
function instanceof(left, right) {
  // 获得类型的原型
  let prototype = right.prototype
  // 获得对象的原型
  left = left.__proto__
  // 判断对象的类型是否等于类型的原型
  while (true) {
    if (left === null) return false
    if (prototype === left) return true
    left = left.__proto__
  }
}
```

## this
`this` 是很多人会混淆的概念，但是其实他一点都不难，你只需要记住几个规则就可以了。
```js
function foo() {
  console.log(this.a)
}
var a = 1
foo()

var obj = {
  a: 2,
  foo: foo
}
obj.foo()
// 以上两者情况 `this` 只依赖于调用函数前的对象，优先级是第二个大于第一个情况


// 以下情况是优先级最高的，`this` 只会绑定在 `c` 上，不会被任何方式修改 `this` 指向
var c = new foo()
c.a = 3
console.log(c.a)

// 还有种就是利用 call，apply，bind 改变 this，这个优先级仅次于 new
```

以上几种情况明白了，很多代码中的 `this` 应该就没什么问题了，下面让我们看看箭头函数中的 `this`
```js
function a() {
  return () => {
    return () => {
      console.log(this)
    }
  }
}
console.log(a()()())
```

箭头函数其实是没有 `this` 的，这个函数中的 `this` 只取决于他外面的第一个不是箭头函数的函数的 `this` 。在这个例子中，因为调用 `a` 符合前面代码中的第一个情况，所以 `this` 是 `window`。并且 `this` 一旦绑定了上下文，就不会被任何代码改变。

## 箭头函数
箭头函数同普通函数的区别
### 箭头函数是匿名函数，不能作为构造函数，不能使用 new
```js
let a = () => { console.log(111)} 
a()

let fn = new a()
```

输出
![Uncaught TypeError](./images/6.png)

### 箭头函数不绑定 arguments，取而代之用 rest 参数...解决
```js
function A(a){ console.log(arguments)}
A(2,'sdas','asda')

let B = (b)=>{
  console.log(arguments);
}
B(2,92,32,32); 

let C = (...c) => {
  console.log(c);
}
C(3,82,32,11323);
```

输出
![Uncaught ReferenceError](./images/7.png)

### this 的作用域不同，箭头函数不绑定 this，会捕获其所在的上下文的 this 值，作为自己的 this 值。
```js
var obj = {
  a: 10,
  b: () => {
    console.log(this.a); // undefined
    console.log(this); // Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
  },
  c: function() {
    console.log(this.a); // 10
    console.log(this); // {a: 10, b: ƒ, c: ƒ}
  }
}
obj.b(); 
obj.c();
```

输出
![Window ](./images/8.png)

普通函数的 this 指向调用他的对象
箭头函数的 this 指向调用父级的对象，如果父级作用于还是箭头函数，就继续向上找，直到 window

### 箭头函数没有原型属性
```js
var a = ()=>{
  return 1;
}

function b(){
  return 2;
}

console.log(a.prototype);  // undefined
console.log(b.prototype);   // {constructor: ƒ}
```

输出
![undefined {constructor: f}](./images/9.png)

### 箭头函数通过 call()  或   apply() 方法调用一个函数时，只传入了一个参数，对 this 并没有影响。
```js
let obj2 = {
    a: 10,
    b: function(n) {
        let f = (n) => n + this.a;
        return f(n);
    },
    c: function(n) {
        let f = (n) => n + this.a;
        let m = {
            a: 20
        };
        return f.call(m,n);
    }
};
console.log(obj2.b(1));  // 11
console.log(obj2.c(1)); // 11
```

输出
![arrow call apply](./images/10.png)

### 箭头函数不能当做 Generator 函数,不能使用 yield 关键字

## 函数尾调用
尾调用（Tail Call）是函数式编程的一个重要概念，本身非常简单，一句话就能说清楚，就是指某个函数的最后一步是调用另一个函数。
```js
function f(x){
  return g(x);
}
```
上面代码中，函数 f 的最后一步是调用函数 g，这就叫尾调用。

## 函数的合成
如果一个值要经过多个函数，才能变成另外一个值，就可以把所有中间步骤合并成一个函数，这叫做"函数的合成"（compose）。

合成两个函数的简单代码如下。
```js
const compose = function (f, g) {
  return function (x) {
    return f(g(x));
  };
}
```

函数的合成还必须满足结合律。
```js
compose(f, compose(g, h))
// 等同于
compose(compose(f, g), h)
// 等同于
compose(f, g, h)
```
## 函数柯里化（currying）
`f(x)` 和 `g(x)` 合成为 `f(g(x))`，有一个隐藏的前提，就是 f 和 g 都只能接受一个参数。如果可以接受多个参数，比如 `f(x, y)` 和 `g(a, b, c)`，函数合成就非常麻烦。

这时就需要函数柯里化了。所谓"柯里化"，就是把一个多参数的函数，转化为单参数函数。
```js

// 柯里化之前
function add(x, y) {
  return x + y;
}

add(1, 2) // 3

// 柯里化之后
function addX(y) {
  return function (x) {
    return x + y;
  };
}

addX(2)(1) // 3
```

有了柯里化以后，我们就能做到，所有函数只接受一个参数。后文的内容除非另有说明，都默认函数只有一个参数，就是所要处理的那个值。

## 执行上下文
当执行 JS 代码时，会产生三种执行上下文
* 全局执行上下文
* 函数执行上下文
* eval 执行上下文

每个执行上下文中都有三个属性
* 变量对象（ VO ），包含变量、函数声明和函数的形参，该属性只能在全局上下文中访问
* 作用域链（ JS 采用词法作用域，也就是说变量的作用域是在定义时就决定了）
* this
```js
var a = 10
function foo (i) {
  var b = 20
} 
foo()
```

对于上述代码，执行栈中有两个上下文：全局上下文和函数 `foo` 上下文。
```js
stack = [
  globalContext,
  fooContext
]
```

对于全局上下文来说，VO 大概是这样的
```js
globalContext.VO === global
globalContext.VO = {
  a: undefined,
  foo: <Function>
}
```

对于函数 `foo` 来说，VO 不能访问，只能访问到活动对象（ AO ）
```js
fooContext.VO === foo.AO
fooContext.AO = {
  i: undefined,
  b: undefined,
  arguments: <>
}
// arguments 是函数独有的对象（箭头函数没有）
// 该对象是一个伪数组，有 `length` 属性且可以通过下标访问元素
// 该对象中的 `callee` 代表函数本身
// `caller` 属性代表函数的调用者
```

对于作用域链，可以把它理解成包含自身变量对象和上级变量对象的列表，通过 `[[Scope]]` 属性查找上级变量
```js
fooContext.[[Scope]] = [
  globalContext.VO
]
fooContext.Scope = fooContext.[[Scope]] + fooContext.VO
fooContext.Scope = [
  fooContext.VO,
  globalContext.VO
]
```

接下来让我们看一个老生常谈的例子，
```js
b() // => call b
console.log(a) //=> undefined

var a = 'Hello world'

function b () {
  console.log('call b')
}
```

以上的输出大家都已经明白了，这是因为函数和变量提升的问题。通常提升的解释是说将声明的代码移动到了顶部，这其实没有什么错误，便于大家理解。但是更准确的解释应该是：在生成执行上下文时，会有两个阶段。第一个阶段是创建的阶段（具体步骤是创建 VO ），JS 解释器会找出需要提升的变量和函数，并且给他们提前在内存中开辟好空间，函数的话会将整个函数存入内存中，变量只声明并且赋值为 undefined，所以在第二个阶段，也就是代码执行阶段，我们可以直接提前使用。

在提升的过程中，相同的函数会覆盖上一个函数，并且函数优先于变量提升
```js
b()  // => call b second

function b () {
  console.log('call b first')
}

function b () {
  console.log('call b second')
}

var b = 'Hello world'
```

`var` 会产生很多错误，所以在 ES6 中引入了 `let` 。 `let` 不能在声明前使用，但是这并不是常说的 `let` 不会提升， `let` 提升了声明但没有赋值，因为临时死区导致了并不能在声明前使用。

对于非匿名的立即执行函数需要注意一下一点
```js
var foo = 1
(function foo () {
  foo = 10
  console.log(foo)
}()) // => f foo() { foo = 10 ; console.log(foo)}
```

因为当 JS 解释器在遇到非匿名的立即执行函数时，会创建一个辅助的特定对象，然后将函数名称作为这个对象的属性，因此函数内部才可以访问到 `foo` , 但是这个值又是只读的，所以对它的赋值并不生效，所以打印的结果还是这个函数，并且外部的值也没有发生更改。
```js
specialObject = {}

Scope = specialObject + Scope

foo = new FunctionExpression
foo.[[Scope]] = Scope
specialObject.foo = foo // {DontDelete}, {ReadOnly}

delete Scope[0]  // remove specialObject from the front of scope chain
```

## 闭包
闭包的定义很简单：函数 A 返回了一个函数 B , 并且函数 B 中使用了函数 A 的变量，函数 B 就被称为闭包。
```js
function A () {
  let a = 1
  function B () {
    console.log(a)
  }
  return B
}
```

你是否会疑惑，为什么函数 A 已经弹出调用栈了， 为什么函数 B 还能引用到函数 A 中的变量。因为函数 A 中的变量这时候是存储在堆上的。现在的 JS 引擎可以通过逃逸分析辨别出哪些变量需要存储在堆上，哪些需要存储在栈上。

经典面试题，循环中使用闭包解决 `var` 定义函数的问题
```js
for ( var i = 1; i <= 5; i++ ) {
  setTimeout( function timer() {
    console.log(i)
  }, i* 1000)
} 
```

首先因为 `setTimeout` 是个异步函数，所以会先把循环全部执行完，这时候 `i` 就是 6 了，所以会输出一堆 6。

解决办法，第一种使用闭包
```js
for ( var i = 1; i <= 5; i++ ) {
  (function (j) {
    setTimeout( function timer() {
      console.log(j)
    }, j* 1000)
  })(i)
} 
```

第二种就是使用 `setTimeout` 的第三个参数（定时器启动时候，第三个以后的参数是作为第一个 func() 的参数传进去）
```js
for ( var i = 1; i <= 5; i++ ) {
  setTimeout( function timer(i) {
    console.log(i)
  }, i* 1000, i)
} 
```

第三种就是使用 `let` 定义 `i` 了
```js
for ( let i = 1; i <= 5; i++ ) {
  setTimeout( function timer() {
    console.log(i)
  }, i* 1000)
} 
```

因为对于 `let` 来说，他会创建一个块级作用域，相当于
```js
{
  // 形成块级作用域
  let i = 0
  {
    let ii = i
    setTimeout( function timer() {
      consoe.log(ii)
    }, ii*1000 )
  }
  i ++
  {
    let ii = i
  }
  i ++
  {
    let ii = i
  }
}
```

## 深浅拷贝
```js
let a = {
  age: 1
}
let b = a
a.age = 2
console.log(b.age) // => 2
```

从上述例子中我们可以发现，如果给一个变量赋值一个对象，那么两者的值会是同一个引用，其中一方改变，另一方也会相应改变

通常在开发中我们不希望出现这样的问题，我们可以使用浅拷贝来解决这个问题。

### 浅拷贝
首先可以通过 `Object.assign` 来解决这个问题
```js
let a = {
  age: 1
}
let b = Object.assign({}, a)
a.age = 2
console.log(b.age) // => 1
```

当然我们也可以通过展开运算符（`...`） 来解决
```js
let a = {
  age: 1
}
let b = {...a}
a.age = 2
console.log(b.age) // => 1
```

通常浅拷贝就能解决大部分问题了，但是当我们遇到如下情况就需要使用到深拷贝了
```js
let a = {
  age: 1,
  jobs: {
    first: 'FE'
  }
}
let b = {...a}
a.jobs.first = 'native'
console.log(b.jobs.first) // => native
```

浅拷贝只解决了第一层的问题，如果接下去的值中还有对象的话，那么就又回到刚开始的话题了，两者享有相同的引用。要解决这个问题，我们需要引入深拷贝。

### 深拷贝
这个问题通常可以通过 `JSON.parse(JSON.stringify(object))` 来解决
```js
let a = {
  age: 1,
  jobs: {
    first: 'FE'
  }
}
let b = JSON.parse(JSON.stringify(a))
a.jobs.first = 'native'
console.log(b.jobs.first) // => FE
```

但是该方法也是有局限性的：
* 会忽略 `undefined`
* 会忽略 `symbol`
* 不能序列化函数
* 不能解决循环引用的问题
```js
let obj = {
  a: 1,
  b: {
    c: 2,
    d: 3,
  },
}
obj.c = obj.b
obj.e = obj.a
obj.b.c = obj.c
obj.b.d = obj.b
obj.b.e = obj.b.c
let newObj = JSON.parse(JSON.stringify(obj))
console.log(newObj)
```

如果你有这么一个循环引用对象，你会发现你不能通过该方法深拷贝
![Uncaught TypeError](./images/3.png)

在遇到函数、`undefined` 或者 `symbol` 的时候，该对象也不能正常的序列化
```js
let a = {
  age: undefined,
  sex: Symbol('male'),
  jobs: function() {},
  name: 'foo'
}
let b = JSON.parse(JSON.stringify(a))
console.log(b) // => {name: 'foo'}
```

你会发现在上述情况中，该方法会忽略掉函数、 `undefined` 和 `symbol` 。

但是在通常情况下，复杂数据都是可以序列化的，所以这个函数可以解决大部分问题，并且该函数是内置函数中处理深拷贝性能最快的。当然如果你的数据中含有以上三种情况下，可以使用 [lodash 的深拷贝函数](https://lodash.com/docs##cloneDeep)。

如果你所需拷贝的对象含有内置类型并且不包含函数，可以使用 `MessageChannel`
```js
function structuralClone(obj) {
  return new Promise(resolve => {
    const {port1, port2} = new MessageChannel();
    port2.onmessage = ev => resolve(ev.data);
    port1.postMessage(obj);
  });
}

var obj = {a: 1, b: {
    c: b
}}
// 注意该方法是异步的
// 可以处理 undefined 和循环引用对象
(async () => {
  const clone = await structuralClone(obj)
})()
```

通过递归来实现深拷贝

为了解决循环引用问题，我们可以额外开辟一个存储空间，来存储当前对象和拷贝对象的对应关系，当需要拷贝当前对象时，先去存储空间中找，有没有拷贝过这个对象，如果有的话直接返回，如果没有的话继续拷贝，这样就巧妙化解的循环引用的问题。

这个存储空间，需要可以存储 `key-value` 形式的数据，且 `key` 可以是一个引用类型，我们可以选择 Map 这种数据结构：

* 检查 map 中有无克隆过的对象
* 有 – 直接返回
* 没有 – 将当前对象作为 key, 克隆对象作为 value 进行存储
* 继续克隆

```js
function deepClone(target, map = new Map()) {
	if (typeof target === 'object') {
		let cloneTarget = Array.isArray(target) ? [] : {}
		if (map.get(target)) {
			return map.get(target)
		}
		map.set(target, cloneTarget)
		for (const key in target) {
			cloneTarget[key] = deepClone(target[key], map)
		}
		return cloneTarget
	} else {
		return target
	}
}
var target = {
    field1: 1,
    field3: {
        child: 'child'
    },
    field4: [2, 4, 8]
};
target.target = target;

var cloneTarget = deepClone(target)
cloneTarget.field4[1] = 333
console.log(target, cloneTarget)
```

## 模块化
在有 Babel 的情况下，我们可以直接使用 ES6 的模块化
```js
// file a.js
export function a () {}
export function b () {}
// file b.js
export default function () {}

import {a, b} from './a.js'
import XX from './b.js'
```

### CommonJS
`CommonJs` 是 Node 独有的规范，浏览器中使用就需要用到 `Browserify` 解析了。
```js
// a.js
module.exports = {
  a: 1
}
// or
exports.a = 1

// b.js
var module = require('./a.js')
module.a  // => 1
```

在上述代码中， `module.exports` 和 `exports` 很容易混淆，让我们来看看大致内部实现
```js
var module = require('./a.js')
module.a
// 这里其实就是包装了一层立即执行函数，这样就不会污染全局变量了，
// 重要的是 module 这里，module 是 Node 独有的一个变量
module.exports = {
    a: 1
}
// 基本实现
var module = {
  exports: {} // exports 就是个空对象
}
// 这个是为什么 exports 和 module.exports 用法相似的原因
var exports = module.exports
var load = function (module) {
    // 导出的东西
    var a = 1
    module.exports = a
    return module.exports
};
```

再来说说 `module.exports` 和 `exports`，用法其实是相似的，但是不能对 `exports` 直接赋值，不会有任何效果。

对于 `CommonJS` 和 ES6 中的模块化的两者区别是：
* 前者支持动态导入，也就是 `require(${path}/xx.js)` ，后者目前不支持，但是已有提案
* 前者是同步导入，因为用于服务端，文件都在本地，同步导入即使卡住主线程响应也不大。而后者是异步导入，因为用于浏览器，需要下载文件，如果也采用同步导入会对渲染有很大影响
* 前者在导出是都是值拷贝，就算导出的值变了，导入的值也不会改变，所以如果想更新值，必须重新导入因此。但是后者采用实时绑定的方式，导入导出的值都指向同一个内存地址，所以导入值会跟随导出值变化
* 后者会编译成 `require/exports` 来执行的

### AMD
AMD 是由 `RequireJS` 提出的
```js
// AMD
define(['./a', './b'], function (a, b) {
  a.do()
  b.do()
})
define(function (require, exports, module) {
  var a = require('./a')
  a.doSomething()
  var b = require('./b')
  b.doSomething()
})
```

## 防抖
你是否在日常开发中遇到一个问题，在滚动事件中需要做个复杂计算或者实现一个按钮的防二次点击操作。

这些需求都可以通过函数防抖动来实现。尤其是第一个需求，如果在频繁的事件回调中做复杂计算，很有可能导致页面卡顿，不如将多次计算合并为一次计算，只在一个精确点做操作。

PS：防抖和节流的作用都是防止函数多次调用。区别在于，假设一个用户一直触发这个函数，且每次触发函数间隔小于 wait , 防抖的情况下只会调用一次，而节流的情况会每隔一定事件（参数 wait ） 调用函数。

我们先来看一个袖珍版的防抖理解一下防抖的实现：
```js
// func 是用户传入需要防抖的函数
// wait 是等待时间
const debounce = (func, wait = 50) => {
  // 缓存一个定时器
  let timer = 0
  // 这里返回的函数是每次用户实际调用的防抖函数
  // 如果已经设置过定时器就清空上一次的定时器
  // 开始一个新的定时器，延迟执行用户传入的方法
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
// 不难看出如果用户调用该函数的间隔小于wait 的情况下，上一次的时间还未到就被清除了，并不会执行函数
```

这是一个简单版的防抖，但是有缺陷，这个防抖只能在最后调用。一般的防抖会有 immediate 选项，表示是否立即调用。这两者的区别，举个例子来说：
* 例如在搜索引擎搜索问题的时候，我们当然希望用户输入完最后一个字才调用查询接口，这个时候适用 `延迟执行` 的防抖函数，它总是在一连串（间隔小于 wait 的）函数触发之后调用。
* 例如用户给 frontend 点 star 的时候，我们希望用户点第一下的时候就去调用接口，并且成功之后改变 star 的样式，用户就可以立即得到反馈是否 star 成功了，这个情况适用 `立即执行` 的防抖函数，它总是在第一次调用，并且下一次调用必须与前一次调用的事件间隔大于 wait 才会触发。

下面我们来实现一个带有 `立即执行` 选项的防抖函数
```js
// 这个是用来获取当前时间戳的
function now() {
  return +new Date()
}
/**
 * 防抖函数，返回函数连续调用时，空闲时间必须大于等于 wait，func 才会执行
 * 
 * @param {function} func 回调函数 
 * @param {number} wait 表示时间窗口的时间
 * @param {boolean} immediate  设置会true 时，是否立即调用函数
 * @returns {function} 返回客户调用哈函数
 */
function debounce(func, wait = 50, immediate = true) {
  let timer, context, args

  // 延迟执行函数
  const later = () => setTimeout(() => {
    // 延迟函数执行完毕，清空缓存的定时器序号
    timer = null
    // 延迟执行的情况下，函数会在延迟函数中执行
    // 使用到之前缓存的参数和上下文
    if (!immediate) {
      func.apply(context, args)
      context = args = null
    }
  }, wait)

  // 这里返回的函数必须是每次实际调用的函数
  return function (...params) {
    // 如果没有创建延迟执行函数（later），就创建一个
    if (!timer) {
      timer = later()
      // 如果是立即执行，调用函数
      // 否则缓存参数和调用上下文
      if (immediate) {
        func.apply(this, params)
      } else {
        context = this
        args = params
      }

      // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设置一个
      // 这样做延迟函数会重新计时
    } else {
      clearTimeout(timer)
      timer = later()
    }
  }
}
```

整体函数实现的不难，总结一下。

* 对于按钮防点击来说的实现：如果函数是立即执行的，就立即调用，如果函数是延迟执行的，就缓存上下文和参数，放到延迟函数中去执行。一旦我们开始一个定时器，只要我的定时器还在，你每次点击我动重新计时。一旦你点击累了，定时器时间到，函数执行，定时器重置为 `null` ,就可以再次点击了。
* 对于延迟执行函数来说的实现：清除定时器 ID，如果是延迟调用就调用函数

## 节流
防抖和节流本质是不一样的。防抖是将多次执行变为最后因此执行，节流是将多次执行变成每隔一段时间执行。
```js
/**
 * underscore 节流函数，返回函数连续调用时，func 执行频率限定为 次 / wait
 * 
 * @param {function} func 回调函数
 * @param {number} wait 表示时间窗口的间隔
 * @param {object} options 如果想忽略开始函数的调用，传入{leading: false}
 *                         如果想忽略结尾函数的调用，传入{trailing: false}
 *                         两者不能共存，否则函数不能执行
 * @returns {function} 返回客户调用函数
 */
_.throttle = function (func, wait, options) {
  var context, args, result
  var timeout = null
  // 之前的时间戳
  var previous = 0
  // 如果 options 没传则设置为空对象
  if (!options) options = {}
  // 定时器回调函数
  var later = function () {
    // 如果设置了 leading， 就将 previous 设为 0
    // 用于下面函数的第一个 if 判断
    previous = options.leading === false ? 0 : _.now()
    // 置空，亦是为了防止内存泄漏，二是为了下面的定时器判断
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function () {
    // 获得当前时间戳
    var now = _.now()
    // 首次进入前者肯定为 true
    // 如果需要第一次不执行函数
    // 就将上次时间戳设为当前的
    // 这样在接下来计算 remaining 的值时会大于 0 
    if (!previous && options.leading === false) previous = now
    // 计算剩余时间
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    // 如果当前调用已经大于上次调用时间 + wait 
    // 或者用户手动调了时间
    // 如果设置了 trailing，只会进入这个条件
    // 如果没有设置 leading，那么第一次会进入这个条件
    // 还有一点，你可以会觉得开启了定时器那么应该不会进入这个 if 条件了
    // 其实还是会进入的，因为定时器的延时
    // 并不是准确的时间，很可能你设置了 2 秒
    // 但他需要 2.2 秒才触发，这时候就会进入这个条件
    if (remaining <= 0 || remaining > wait) {
      // 如果存在定时器就清理掉否则会调用二次回调
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      // 判断是否设置了定时器和 trailing
      // 没有的话就开启一个定时器
      // 并且不能同时设置 leading 和 trailing
      timeout = setTimeout(later, remaining)
    }
    return timeout
  }
}
```

### 1. 时间戳版
```js
function throttle(func, delay) {
    var last = 0
    return function(){
        var now = Date.now()
        if (now >= delay + last) {
            func.apply(this, arguments)
            last = now
        } else {
            console.log('距离上次调用的时间差不满足要求哦')
        }
    }
}
```

### 2. 定时器版
```js
function throttle(func, delay) {
    var timer = null
    return function(){
        if(!timer){
            func.apply(this, arguments)
            timer = setTimeout(()=>{
                timer = null
            }, delay)
        } else {
            console.log('上一个定时器尚未完成')
        }
    }
}
```

## 继承

在 ES5 中，我们可以使用如下方式解决继承的问题
```js
function Super() {}
Super.prototype.getNumber = function () {
  return 1
}


function Sub() {}
Sub.prototype = Object.create(Super.prototype)
Sub.prototype.constructor = Sub

let s = new Sub()
```

以上继承实现思路就是将子类的原型设置为父类的原型

在 ES6 中，我们可以通过 `class` 语法轻松解决这个问题
```js
class MyDate extends Date () {
  test () {
    reutrn this.getTime()
  }
}
let myDate = new MyDate()
myDate.test()
```

但是 ES6 不是所有浏览器都兼容，所以我们需要使用 Babel 来编译这段代码。

如果你使用编译过得代码调用 `myDate.test()` 你会惊奇地发现出现了报错



因为在 JS 底层有限制，如果不是由 `Date` 构造出来的实例的话，是不能调用 `Date` 里的函数的。所以这也侧面的说明了：**ES6 中的 `class` 继承与 ES5 中的一般继承写法是不同的**。

既然底层限制了实例必须由 `Date` 构造出来，那么我们可以改变下思路实现继承
```js
function MyDate() {}
MyDate.prototype.test = function () {
  return this.getTime()
}
let d = new Date()
Object.setPrototypeOf(d, MyDate.prototype)
Object.setPrototypeOf(MyDate.prototype, Date.prototype)
```

以上继承实现思路：**先创建父类实例** => 改变实例原先的 `__proto__` 转而连接到子类的 `prototype`  => 子类的 `prototype` 的 `__proto__` 改为父类的 `prototype`。

通过以上方法实现的继承就可以完美解决 JS 底层的这个限制。

## call，apply，bind 区别
首先说下前两者的区别。

`call` 和 `apply` 都是为了解决改变 `this` 的指向。作用都是相同的，只是传参的方式不同。

除了第一个参数外，`call` 可以接收一个参数列表，`apply` 只接受一个参数数组。
```js
let a = {
    value: 1
}
function getValue(name, age) {
    console.log(name)
    console.log(age)
    console.log(this.value)
}
getValue.call(a, 'Foo', '18')
getValue.apply(a, ['Foo', '18'])
```

### 模拟实现call 和apply
可以从以下几点来考虑如何实现
* 不传入第一个参数，那么默认为 `window`
* 改变了 this 指向，让新的对象可以执行该函数。那么思路是可以变成给新的对象添加一个函数，然后在执行完以后删除？
```js
Function.prototype.myCall = function (context) {
  var context = context || window
  // 给 context 添加一个属性
  // getValue.call(a, 'Foo', '18') => a.fn = getValue
  context.fn = this
  // 将 context 后面的参数取出来
  var args = [...arguments].slice(1)
  // getValue.call(a, 'Foo', '18') => a.fn('Foo', '18')
  var result = context.fn(...args)
  // 删除 fn
  delete context.fn
  return result
}
```

以上就是 `call` 的思路， `apply` 的实现也类似
```js
Function.prototype.myApply = function (context) {
  var context = context || window
  context.fn = this
  var result
  // 需要判断是否存在第二个参数
  // 如果存在，就将第二个参数展开
  if (arguments[1]) {
    result = context.fn(...arguments[1])
  } else {
    result = context.fn()
  }

  delete context.fn
  return result
}
```

`bind` 和其他两个方法作用也是一致的，只是该方法会返回一个函数。并且我们可以通过 `bind` 实现柯里化。

同样的，也来模拟实现下 `bind`
```js
Function.prototype.myBind = function (context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  var _this = this
  var args = [...arguments].slice(1)
  // 返回一个函数
  return function F() {
    // 因为返回了一个函数，我们可以 new F(), 所以需要判断
    if (this instanceof F) {
      return new _this(...args, ...arguments)
    }
    return _this.apply(context, args.concat(...arguments))
  }
}
```

## Promise 实现
`Promise` 是 ES6 新增的语法，解决了回调地狱的问题。

可以把 `Promise` 看成一个状态机。初始是 `pending` 状态，可以通过函数 `resolve` 和 `reject` ，将状态转变为 `resolved` 或者 `rejected` 状态，状态一旦改变就不能再次变化。

`then` 函数会返回一个 `Promise` 实例，并且该返回值是一个新的实例而不是之前的实例。因为 `Promise` 规范规定除了 `pending` 状态，其他状态是不可以改变的，如果返回的是一个相同实例的话，多个 `then` 调用就失去意义了。

对于 `then` 来说，本质上可以把它看成是 `flatMap`
```js
// 三种状态
const PENDING = 'pending'
const RESOLVED = 'ressolved'
const REJECTED = 'rejected'
// promise 接收一个函数参数，该函数立即执行
function MyPromise (fn) {
  let _this = this
  _this.currentState = PENDING
  _this.value = undefined
  // 用于保存 then 中的回调，只有当 promise
  // 状态为 pending 时才会缓存，并且每个实例至多缓存一个
  _this.resvoledCallbacks = []
  _this.rejectedCallbacks = []

  _this.resolve = function (value) {
    if (value instanceof MyPromise) {
      // 如果 value 是个 Promise，递归执行
      return value.then(_this.resolve, _this.reject)
    }
    setTimeout(() => { // 异步执行，保证执行顺序
      if (_this.currentState === PENDING) {
        _this.currentState = RESOLVED
        _this.value = value
        _this.resvoledCallbacks.forEach(cb => cb())
      }
    })
  }
  // 用于解决以下问题
  // new Promise(() => throw Error('error'))
  try {
    fn(_this.resolve, _this.reject)
  } catch (e) {
    _this.reject(e)
  }
}

MyPromise.prototype.then = function (onResolved, onRejected) {
  var self = this
  // 规范 2.2.7 必须返回一个新的 promise
  var promise2
  // 规范 2.2 onResolved 和 onRejected 都为可选参数
  // 如果类型不是函数需要忽略，同时也实现了透传
  // Promise.resolve(4).then().then((value) => console.log(value))
  onResolved = typeof onResolved === 'function' ? onResolved : v => v
  onRejected = typeof onRejected === 'function' ? onRejected : r => throw r

  if (self.currentState === RESOLVED) {
    return (promise2 = new MyPromise(function (resolve, reject) {
      // 规范 2.2.4，保证 onFullfiled, onRejected 异步执行
      // 所以用 setTimeout 包裹下
      setTimeout(function () {
        try {
          var x = onResolved(self.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (reason) {
          reject(reason)
        }
      })
    }))
  }

  if (self.currentState === REJECTED) {
    return (promise2 = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        // 异步执行 onRejected
        try {
          var x = onRejected(self.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (reason) {
          reject(reason)
        }
      })
    }))
  }

  if (self.currentState === PENDING) {
    return (promise2 = new MyPromise(function (resolve, reject) {
      self.resvoledCallbacks.push(function () {
        // 考虑到可能会报错，所以使用 try/catch 包裹
        try {
          var x = onResolved(self.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (reason) {
          reject(reason)
        }
      })

      self.rejectedCallbacks.push(function () {
        // 考虑到可能会报错，所以使用 try/catch 包裹
        try {
          var x = onRejected(self.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (reason) {
          reject(reason)
        }
      })
    }))
  }
}
// 规范 2.3
function resolutionProcedure(promise2, x, resolve, reject) {
  // 规范 2.3.1，x 不能和 promise2 相同，避免循环引用
  if (promise2 === x) {
    return reject(new TypeError('Error'))
  }
  // 规范 2.3.2
  // 如果 x 为 Promise， 状态为 pending 需要继续等待，否则执行
  if (x instanceof MyPromise) {
    if (x.currentState === PENDING) {
      x.then(function (value) {
        // 再次调用该函数是为了确认 x resolve 的
        // 参数是什么类型，如果是基本类型就再次 resolve
        // 把值传给下个 then
        resolutionProcedure(promise2, value, resolve, reject)      
      }, reject)
    } else {
      x.then(resolve, reject)
    }
    return
  }
  // 规范 2.3.3
  // reject 或者 resolve 其中一个执行过的话，忽略其他的
  let called = false
  // 规范 2.3.3，判断 x 是否为对象后者函数
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 规范 2.3.3.2，如果不能取出 then ，就 reject
    try {
      // 规范 2.3.3.1
      let then = x.then
      // 如果 then 是函数，调用 x.then
      if (typeof then === 'function') {
        // 规范 2.3.3.3
        then.call(
          x,
          y => {
            if (called) return
            called = true
            // 规范 2.3.3.3.1
            resolutionProcedure(promise2, y, resolve, reject)
          },
          e => {
            if (called) return
            called = true
            reject(e)
          }
        )
      } else {
        // 规范 2.3.3.4
        resolve(x)
      }
    } catch (reason) {
      if (called) return
      called = true
      reject(rease)
    }
  } else {
    // 规范 2.3.4，x 为基本类型
  }
}
```

以上就是根据 Promise / A+ 规范来实现的代码，可以通过 `promises-aplus-tests` 的完整测试


### Promise class 实现
[请手写代码实现一个promise](https://www.cnblogs.com/Joe-and-Joan/p/11206579.html)
```js
class Promise {
    // 构造器
    constructor(executor) {
        // 初始化state 为等待状态
        this.state = 'pending'
        // 成功的值
        this.value = undefined
        // 失败的值
        this.reason = undefined
        // 成功存放的数组
        this.onResolvedCallbacks = []
        // 失败存放的数组
        this.onRejectedCallbacks = []
        // 成功
        let resolve = value => {
            // state 改变状态，resolve 调用就会失败
            if (this.state === 'pending') {
                // resolve 调用后，state 转为成功态
                this.state = 'fulfilled'
                // 存储成功的值
                this.value = value
                // 一旦resolve 执行，调用成功数组的函数
                this.onResolvedCallbacks.forEach( fn => fn())
            }
        }
        // 失败
        let reject = reason => {
            // state 改变状态，reject 调用就会失败
            if (this.state === 'pending') {
                // reject 调用后，state 转为失败态
                this.state = 'rejected'
                // 存储失败的原因
                this.reason = reason
                // 一旦reject 执行，调用失败数组的函数
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }
        try {
            // 立即执行
            executor(resolve, reject)
        } catch (err) {
            // 如果executor
            reject(err)
        }
    }
    // then 方法 有两个参数onFulfilled， onRejected
    then(onFulfilled, onRejected) {
        // onFulfilled 如果不是函数，就忽略onFulfilled, 直接返回value
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value =>    value
        // onRejected 如果不是函数，就忽略onRejected，直接扔出错误
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }

        // 声明返回的promise2
        let promise2 = new Promise((resolve, reject) => {
            // 状态为fulfilled， 执行onFulFilled， 传入成功的值
            if (this.state === 'fulfilled') {
                // 异步
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value)
                        // resolvePromise 函数，处理自己 return 的promise 和默认的promise2 的关系
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                }, 0) 
            }
            // 状态为rejected, 执行onRejected，传入失败的原因
            if (this.state === 'rejected') {
                // 异步
                setTimeout(() => {
                    // 如果报错
                    try {
                        let x = onRejected(this.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                }, 0)
            }
            // 当状态state 为pending 时
            if (this.state === 'pending') {
                // onFulfilled 传入到成功数组
                this.onResolvedCallbacks.push(() => {
                    // 异步
                    setTimeout(() => {
                        try {
                            onFulfilled(this.value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    }, 0)
                })
                // onRejected 传入到失败数组
                this.onRejectedCallbacks.push(() => {
                    // 异步
                    setTimeout(() => {
                        try {
                            onRejected(this.reason)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    }, 0)
                })
            }
        })
        // 返回promise， 完成链式
        return promise2
        
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    // 循环引用报错
    if (x === promise2) {
        // reject 报错（检测到 promise 的链式循环）
        return reject(new TypeError('Chaining cycle detected for promise'))
    }
    // 防止多次调用
    let called
    // x 不是null 且x 是对象或者函数
    if (x != null && (typeof x === 'object' || typeof x === 'function')) {
        try {
            // A+ 规定，声明 then = x.then 方法
            let then = x.then
            // 如果then 是函数，就默认是promise
            if (typeof x === 'function') {
                // 就让then 执行，第一个参数是this  后面是成功的回调 和 失败的回调
                then.call(x, y=>{
                    // 成功和失败只能调用一个
                    if (called) return
                    called = true
                    // resolve 的结果依旧是promise 那就继续解析
                    resolvePromise(promise2, y, resolve, reject)
                }, err => {
                    // 成功和失败只能调用一个
                    if(called) return
                    called = true
                    // 失败了就失败了
                    reject(err)
                })
            } else {
                resolve(x) // 直接成功即可
            }
        } catch (e) {
            // 也属于失败
            if (called) return
            called = true
            // 取then 出错了那就不要再继续执行了
            reject(err)
        }
    } else {
        resolve(x)
    }
}
```
## Generator 实现
Generator 是 ES6 中新增语法，和 Promise 一样，都可以用来异步编程
```js
// 使用 * 表示这是一个 Generator 函数
// 内部可以通过 yield 暂停代码
// 通过调用 next 恢复执行
function* test() {
  let a = 1 + 2
  yield 2
  yield 3
}
let b = test()
console.log(b.next())   // => { value: 2, done: false}
console.log(b.next())   // => { value: 3, done: false}
console.log(b.next())   // => { value: undefined, done: true}
```

从以上代码可以发现，加上 `*` 的函数执行后有了 `next` 函数，也就说函数执行后返回了一个对象。每次调用 `next` 函数可以继续执行被暂停的代码。以下是Generator 函数的简单实现
```js
// cb 也就是编译过的 test 函数
function generator (cb) {
  return (function (){
    var object = {
      next: 0,
      stop: function () {}
    }

    return {
      next: function () {
        var ret = cb(object)
        if (ret === undefined) return { value: undefined, done: true}
        return {
          value: ret,
          done: false
        }
      }
    }
  })()
}

// 如果你使用 babel 编译后可以发现 test 函数变成了这样
function test () {
  var a
  return generator (function (_context) {
    while (1) {
      switch ((_context.prev = _context.next)) {
        // 可以发现通过 yield 将代码分割成几块
        // 每次执行 next 函数就执行一块代码
        // 并且表明下次需要执行哪块代码
        case 0:
          a = 1 + 2
          _context.next = 4
          return 2
        case 4:
          _content.next = 6
          return 3
        // 执行完毕  
        case 6:
        case 'end':
          return _context.stop()
      }
    }
  })
}
```

## Map、FlatMap 和Reduce
`Map` 作用是生成一个新数组，遍历原数组，将每个元素拿出来做一些变换然后 `append` 到新的数组中。
```js
[1, 2, 3].map((v) => v + 1)
// => [2, 3, 4]
```

`Map` 有三个参数，分别是当前索引元素，索引，原数组
```js
['1','2','3'].map(parseInt)
//  parseInt('1', 0) => 1
//  parseInt('2', 1) => NaN
//  parseInt('3', 2) => NaN
```

`FlatMap` 和 `map` 的作用几乎是相同的，但是对于多维数组来说，会将原数组降维。可以将 `FlatMap` 看成是 `map` + `flatten` ，[目前该函数在浏览器中的支持情况](https://caniuse.com/#search=FlatMap)。
```js
[1, [2], 3].flatMap((v) => v + 1)
// => [2, '21', 4]
```

如果想将一个多维数组彻底的降维，可以这样实现
```js
const flattenDeep = (arr) => Array.isArray(arr)
  ? arr.reduce( (a, b) => [...a, ...flattenDeep(b)], [])
  : [arr]

flattenDeep([1, [[2], [3, [4]], 5]])
```

`Reduce` 作用是数组中的值组合起来，最终得到一个值
```js
function a() {
    console.log(1);
}

function b() {
    console.log(2);
}

[a, b].reduce((a, b) => a(b()))
// => 2 1
```

## async 和await
一个函数加上 `async` ，内码该函数就会返回一个 `Promise`
```js
async function test () {
  return "1"
}
console.log(test()) // => Promise {<resolved>: "1"}
```

可以把 `async` 看成函数返回值使用 `Promise.resolve()` 包裹了下。

`await` 只能在 `async` 函数中使用
```js
function sleep () {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('finish')
      resolve('sleep')
    }, 2000)
  })
}
async function test () {
  let value = await sleep()
  console.log('object')
}
test()
```

上面代码会先打印 `finish` 然后再打印 `object` 。因为 `await` 会等待 `sleep` 函数 `resolve` ，所以即使后面是同步代码，也不会先去执行通过代码再来执行异步代码。

`async` 和 `await` 相比直接使用 `Promise` 来说，优势在于处理 `then` 的调用链，能够更清晰准确的写出代码。缺点在于滥用 `await` 可能会导致性能问题，因为 `await` 会阻塞代码，也许之后的异步代码并不依赖前者，但仍然需要等待前者完成，导致代码失去了并发性。

下面来看一个使用 `await` 的代码
```js
var a = 0
var b = async () => {
  a = a + await 10
  console.log('2', a)   // => '2' 10
  a = (await 10) + a
  console.log('3', a)   // => '3' 20
}
b()
a ++
console.log('1', a)  // => '1' 1
```

对于以上代码你可能会有疑惑，这里说明下原理

* 首先函数 `b` 先执行，在执行到 `await 10` 之前变量 `a` 还是 0， 因为在 `await` 内部实现了 `generators` , `generators` 会保留堆栈中东西，所以这时候 `a = 0` 被保存了下来
* 因为 `await` 是异步操作，遇到 `await` 就会立即返回一个 `pending` 状态的 `Promise` 对象，暂时返回执行代码的控制权，使得函数外的代码得以继续执行，所以会先执行 `console.log('1', a)`
* 这时候同步代码执行完毕，开始执行异步代码，将保存下来的值拿出来用，这时候 `a = 10`
* 然后后面就是常规执行代码了

## Proxy
Proxy 是 ES6 中新增的功能，可以用来自定义对象中的操作
```js
let p = new Proxy(target, handler)
// 'target' 代表需要添加代理的对象
// `handler` 用来自定义对象中的操作
```

可以很方便的使用 Proxy 来实现一个数据绑定和监听
```js
let onWatch = (obj, setBind, getLogger) => {
  let handler = {
    get(target, property, receiver) {
      getLogger(target, property)
      return Reflect.get(target, property, receiver)
    },
    set(target, property, value, receiver) {
      setBind(value)
      return Reflect.set(target, property, value)
    }
  } 
  return new Proxy(obj, handler)
}

let obj = { a: 1 }
let value 
let p = onWatch(obj, v=>value = v, (target, property) => {
  console.log(`Get '${property}' = ${target[property]}`)
})
p.a = 2  // bind `value` to `2`
p.a      // => Get 'a' = 2
```

## 为什么0.1 + 0.2 != 0.3
因为 JS 采用 IEEE 754 双精度版本（64位），并且只要采用 IEEE 754 的语言都有该问题。

我们都知道计算机表示十进制都是采用二进制表示的，所以 `0.1` 在二进制表示为
```js
// (0011) 表示循环
0.1 = 2^-4 * 1.1001(0011)
```

那么如何得到这个二进制的呢？我们可以来演算下
```js
0.1 * 2 = 0.2 // 0
0.2 * 2 = 0.4 // 0
0.4 * 2 = 0.8 // 0
0.8 * 2 = 1.6 // 1
0.6 * 2 = 1.2 // 1
0.2 * 2 = 0.4 // 0
0.4 * 2 = 0.8 // 0
0.8 * 2 = 1.6 // 1
0.6 * 2 = 1.2 // 1
0.2 * 2 = 0.4 // 0
0.4 * 2 = 0.8 // 0
```

将该数字乘以 2 ，取出整数部分作为二进制表示的第 1 位；然后再将小数部分乘以 2，将得到的整数部分作为二进制表示的第 2 位；以此类推，直到小数部分为 0。所以我们得到 `0.1 = 2^-4 * 1.1001(0011)` ，那么 `0.2` 的演算也基本如上所示，只需要去掉第一步乘法，所以得到 `0.2 = 2^-3 * 1.1001(0011)`。

所以 `2^-4 * 1.10011...001` 进位后就变成了 `2^-4 * 1.10011(0011 * 12次)010` 。那么把这两个二进制加起来会得出 `2^-2 * 1.0011(0011 * 11次)0100` , 这个值算成十进制就是 `0.30000000000000004`

下面说一下原生解决办法，如下代码所示
```js
parseFloat((0.1 + 0.2).toFixed(10))
```

## 正则表达式
### 元字符
|元字符|作用|
|:-:|:-:|
|.|匹配任意字符除了换行符和回车符|
|[]|匹配方括号内的任意字符。比如 [0-9] 就可以用来匹配任意数字|
|^|^9，这样使用代表匹配以 9 开头。[^9]，这样使用代表匹配方括号内除了 9 的字符|
|{1,2}|匹配 1 到 2 位字符|
|(abc)|只匹配和 abc 相同字符串|
| \| |匹配 \| 前后任意字符|
|\\|转义|
|*|只匹配出现 0 次及以上 * 前的字符|
|+|只匹配出现 1 次及以上 + 前的字符|
|?|?之前字符可选|

### 修饰语
|修饰语|作用|
|:-:|:-:|
|i|忽略大小写|
|g|全局搜索|
|m|多行|

### 字符简写
|字符|作用|
|:-:|:-:|
|\w|匹配字母数字或下划线|
|\W|和上面相反|
|\s|匹配任意的空白字符|
|\S|和上面相反|
|\d|匹配数字|
|\D|和上面相反|
|\b|匹配单词的开始或结束|
|\B|和上面相反|

## V8 下的垃圾回收机制
V8 实现了准确式 GC，GC 算法采用了分代式垃圾回收机制。因此，V8 将内存（堆）分为新生代和老生代两部分。[v8 trash talk](https://v8.dev/blog/trash-talk)

### 准确式GC
1. 正确的根，可以直接识别出是指针还是非指针，都需要语言处理程序加工，即为准确式GC(Exact GC)
2. 打标签，将不明确的根的所有非指针与指针区分开。32位系统的指针是4的倍数，低2位一定是0，因此可以让非指针左移一位，而后将最后一位置1，如果溢出则换一个大的数据类型。
3. 不把寄存器和栈等当作根，而由处理程序来创建根。
4. 优点在于不存在指针不明确，可以使用复制移动算法。
5. 缺点则是需要语言处理程序对GC做支持，而且打标签等方式需要消耗资源与性能。

### 新生代算法
新生代中的对象一般存活时间较短，采用空间换取时间的Scavenge GC 算法，尽可能快的回收内存。

简单来说，将内存空间分为两部分，分别为 From 空间和 To 空间。在这两个空间中，必定有一个空间是使用的，另一个空间是空闲的。新分配的对象会被放入 From 空间中，当 From 空间被占满时，新生代 GC 就会启动了。算法会检查 From 空间中存活的对象并复制到 To 空间中，如果有失活的对象就会销毁。当复制完成后将 From 空间和 To 空间互换，这样 GC 就结束了。

### 老生代算法
老生代中的对象一般存活时间较长且数量较多，使用了两个算法，分别是标记清除算法和标记压缩算法。

在讲算法之前，先来说下什么情况下对象会出现在老生代空间中：
* 新生代中的对象是否已经经历过一次Scavenge 算法，如果经历过的话，会将对象从新生代空间移到老生代空间中。
* To 空间的的对象占比大小超过 25%。在这种情况下，为了不影响到内存分配，会将对象从新生代空间移到老生代空间中。

老生代中的空间很复杂，有如下几个空间
```js
enum AllocationSpace {
  // TODO(v8:7464): Actually map this space's memory as read-only.
  RO_SPACE,    // 不变的对象空间
  NEW_SPACE,   // 新生代用于 GC 复制算法的空间
  OLD_SPACE,   // 老生代常驻对象空间
  CODE_SPACE,  // 老生代代码对象空间
  MAP_SPACE,   // 老生代 map 对象
  LO_SPACE,    // 老生代大空间对象
  NEW_LO_SPACE,  // 新生代大空间对象

  FIRST_SPACE = RO_SPACE,
  LAST_SPACE = NEW_LO_SPACE,
  FIRST_GROWABLE_PAGED_SPACE = OLD_SPACE,
  LAST_GROWABLE_PAGED_SPACE = MAP_SPACE
};
```

在老生代中，以下情况会先启动标记清除算法：

* 某一个空间没有分块的时候
* 空间中对象占比超过一定限制
* 空间不能保证新生代中的对象移动到老生代中

在这个阶段中，会遍历堆中所有的对象，然后标记活的对象，在标记完成后，销毁所有没有被标记的对象。在标记大型对内存时，可能需要几百毫秒才能完成一次标记。这就会导致一些性能上的问题。为了解决这个问题，2011 年，V8 从 stop-the-world 标记切换到增量标志。在增量标记期间，GC 将标记工作分解为更小的模块，可以让 JS 应用逻辑在模块间隙执行一会，从而不至于让应用出现停顿情况。但在 2018 年，GC 技术又有了一个重大突破，这项技术名为并发标记。该技术可以让 GC 扫描和标记对象时，同时允许 JS 运行，你可以点击 [该博客](https://v8project.blogspot.com/2018/06/concurrent-marking.html) 详细阅读。

清除对象后会造成堆内存出现碎片的情况，当碎片超过一定限制后会启动压缩算法。在压缩过程中，将活的对象向一端移动，直到所有对象都移动完成然后清理掉不需要的内存。


### 垃圾数据
  从“GC Roots”对象出发，遍历 GC Root 中的所有对象，如果通过 GC Roots 没有遍历到的对象，则这些对象便是垃圾数据。V8 会有专门的垃圾回收器来回收这些垃圾数据。

### 垃圾回收算法
垃圾回收大致可以分为以下几个步骤：

* 第一步，**通过 GC Root 标记空间中活动对象和非活动对象**。目前 V8 采用的**可访问性（reachability）算法**来判断堆中的对象是否是活动对象。具体地讲，这个算法是将一些 GC Root 作为初始存活的对象的集合，从 GC Roots 对象出发，遍历 GC Root 中的所有对象：

  * 通过 GC Root 遍历到的对象，我们就认为该对象是**可访问的（reachable）**，那么必须保证这些对象应该在内存中保留，我们也称可访问的对象为**活动对象**；
  * 通过 GC Roots 没有遍历到的对象，则是**不可访问的（unreachable）**，那么这些不可访问的对象就可能被回收，我们称不可访问的对象为**非活动对象**。
  * 在**浏览器环境中，GC Root 有很多**，通常包括了以下几种 (但是不止于这几种)：

    * 全局的 window 对象（位于每个 iframe 中）；
    * 文档 DOM 树，由可以通过遍历文档到达的所有原生 DOM 节点组成；
    * 存放栈上变量。

* 第二步，**回收非活动对象所占据的内存**。其实就是在所有的标记完成之后，统一清理内存中所有被标记为可回收的对象。

* 第三步，**做内存整理**。一般来说，频繁回收对象后，内存中就会存在大量不连续空间，我们把这些不连续的内存空间称为**内存碎片**。当内存中出现了大量的内存碎片之后，如果需要分配较大的连续内存时，就有可能出现内存不足的情况，所以最后一步需要整理这些内存碎片。但这步其实是可选的，因为**有的垃圾回收器不会产生内存碎片(比如副垃圾回收器)。**

### 垃圾回收
* V8 依据**代际假说**，将堆内存划分为**新生代和老生代**两个区域，新生代中存放的是生存时间短的对象，老生代中存放生存时间久的对象。代际假说有两个特点：

  * 第一个是大部分对象都是“**朝生夕死**”的，也就是说**大部分对象在内存中存活的时间很短**，比如函数内部声明的变量，或者块级作用域中的变量，当函数或者代码块执行结束时，作用域中定义的变量就会被销毁。因此这一类对象一经分配内存，很快就变得不可访问；
  * 第二个是**不死的对象，会活得更久**，比如全局的 window、DOM、Web API 等对象。

* 为了提升垃圾回收的效率，V8 设置了两个垃圾回收器，主垃圾回收器和副垃圾回收器。

  * **主垃圾回收器**负责收集老生代中的垃圾数据，**副垃圾回收器**负责收集新生代中的垃圾数据。
  * **副垃圾回收器采用了 Scavenge 算法**，是把新生代空间对半划分为两个区域（有些地方也称作 From 和 To 空间），一半是对象区域，一半是空闲区域。新的数据都分配在对象区域，等待对象区域快分配满的时候，垃圾回收器便执行垃圾回收操作，之后将存活的对象从对象区域拷贝到空闲区域，并将两个区域互换。

    * 这种角色翻转的操作还能让新生代中的这两块区域无限重复使用下去。
    * 副垃圾回收器每次执行清理操作时，都需要将存活的对象从对象区域复制到空闲区域，复制操作需要时间成本，如果新生区空间设置得太大了，那么每次清理的时间就会过久，所以为了执行效率，一般**新生区的空间会被设置得比较小**。
    * 副垃圾回收器还会采用**对象晋升策略**，也就是移动那些经过两次垃圾回收依然还存活的对象到老生代中。

  * 主垃圾回收器回收器主要负责**老生代中的垃圾数据的回收操作，会经历标记、清除和整理过程。**

    * 主垃圾回收器主要负责老生代中的垃圾回收。除了新生代中晋升的对象，一些大的对象会直接被分配到老生代里。
    * 老生代中的对象有两个特点：一个是对象占用空间大；另一个是对象存活时间长。


### Stop-The-World
  由于 JavaScript 是运行在主线程之上的，因此，一旦执行垃圾回收算法，都需要将正在执行的 JavaScript 脚本暂停下来，待垃圾回收完毕后再恢复脚本执行。我们把这种行为叫做**全停顿（Stop-The-World）**。

* V8 最开始的垃圾回收器有两个特点：

  * 第一个是垃圾回收在主线程上执行，
  * 第二个特点是一次执行一个完整的垃圾回收流程。

* 由于这两个原因，很容易造成主线程卡顿，所以 V8 采用了很多优化执行效率的方案。

  * 第一个方案是**并行回收**，在执行一个完整的垃圾回收过程中，垃圾回收器会使用多个辅助线程来并行执行垃圾回收。
  * 第二个方案是**增量式垃圾回收**，垃圾回收器将标记工作分解为更小的块，并且穿插在主线程不同的任务之间执行。采用增量垃圾回收时，垃圾回收器没有必要一次执行完整的垃圾回收过程，每次执行的只是整个垃圾回收过程中的一小部分工作。
  * 第三个方案是**并发回收**，回收线程在执行 JavaScript 的过程，辅助线程能够在后台完成的执行垃圾回收的操作。

    > 资料参考：[深入解读 V8 引擎的「并发标记」技术](https://www.oschina.net/translate/v8-javascript-engine)

* 主垃圾回收器就综合采用了所有的方案（并发标记，增量标记，辅助清理），副垃圾回收器也采用了部分方案。