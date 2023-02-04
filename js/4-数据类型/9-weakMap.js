//  ——————————————————————————————————————————————   预备知识   ——————————————————————————————————————————————————————————————————————————————————————————
//  垃圾回收 章节中知道，JavaScript 引擎在值“可达”和可能被使用时会将其保持在内存中。
let john = { name: "John" };

// 该对象能被访问，john 是它的引用
// 覆盖引用
john = null;
// 该对象将会被从内存中清除

// ~ 如果把一个对象放入到数组中，那么只要这个数组存在，那么这个对象也就存在，即使没有其他对该对象的引用。
let ann = { name: "Ann" };
let arr = [ann];
ann = null;

// 前面由 ann 所引用的那个对象被存储在了 array 中
// 所以它不会被垃圾回收机制回收
// 我们可以通过 array[0] 获取到它
console.log(arr[0]); // ? { name: 'Ann' }

// ! 类似的，如果我们使用对象作为常规 Map 的键，那么当 Map 存在时，该对象也将存在。它会占用内存，并且不会被（垃圾回收机制）回收。
let szs = { name: "szs" };
let map = new Map();
map.set(szs, "27");
szs = null; // 覆盖引用
// szs 被存储在了 map 中，
// 我们可以使用 map.keys() 来获取它
console.log(map.keys()); // ? [Map Iterator] { { name: 'szs' } }

// ——————————————————————————————————————————————   WeakMap  ——————————————————————————————————————————————————————————————————————————————————————————
// ! WeakMap 在这方面有着根本上的不同。它不会阻止垃圾回收机制对作为键的对象（key object）的回收。

// ! WeakMap（避免内存泄露）与 Map区别

// ~ 1) WeakMap 和 Map 的第一个不同点就是，WeakMap 的键必须是对象，不能是原始值：
let weakMap = new WeakMap();
let obj = {};
weakMap.set(obj, "ok");
// 不能使用字符串作为键
// weakMap.set("hh", "hehe"); // Error，因为 "test" 不是一个对象

// ~ 2）如果我们在 weakMap 中使用一个对象作为键，并且没有其他对这个对象的引用 —— 该对象将会被从内存（和map）中自动清除。
let Nancy = { name: "Nancy" };
let wm = new WeakMap();
wm.set(Nancy, "person");
Nancy = null;
// ~ Nancy 被从内存中删除了！

/*
~ 3）WeakMap 不支持迭代以及 keys()，values() 和 entries() 方法。所以没有办法获取 WeakMap 的所有键或值。

WeakMap 只有以下的方法：

    weakMap.get(key)
    weakMap.set(key, value)
    weakMap.delete(key)
    weakMap.has(key)


 * 为什么会有这种限制呢？这是技术的原因。如果一个对象丢失了其它所有引用（就像上面示例中的 Nancy），那么它就会被垃圾回收机制自动回收。但是在从技术的角度并不能准确知道 何时会被回收。

这些都是由 JavaScript 引擎决定的。JavaScript 引擎可能会选择立即执行内存清理，如果现在正在发生很多删除操作，那么 JavaScript 引擎可能就会选择等一等，稍后再进行内存清理。
* 因此，从技术上讲，WeakMap 的当前元素的数量是未知的。JavaScript 引擎可能清理了其中的垃圾，可能没清理，也可能清理了一部分。因此，暂不支持访问 WeakMap 的所有键/值的方法。
*/

// ! 使用场景1： WeakMap 的主要应用场景是 额外数据的存储。
// ~ 假如我们正在处理一个“属于”另一个代码的一个对象，也可能是第三方库，并想存储一些与之相关的数据，那么这些数据就应该与这个对象共存亡 —— 这时候 WeakMap 正是我们所需要的利器。

// ~ 我们将这些数据放到 WeakMap 中，并使用该对象作为这些数据的键，那么当该对象被垃圾回收机制回收后，这些数据也会被自动清除。
let someone = { name: "sth" };
weakMap.set(someone, "secret documents"); // 如果 someone 消失，secret documents 将会被自动清除

// ? ① 例如，我们有用于处理用户访问计数的代码。收集到的信息被存储在 map 中：一个用户对象作为键，其访问次数为值。
// ? 当一个用户离开时（该用户对象将被垃圾回收机制回收），这时我们就不再需要他的访问次数了。

// 1) 假如使用map
// 📁 visitsCount.js
let visitsCountMap = new Map(); // map: user => visits count
// 递增用户来访次数
function countUser(user) {
  let count = visitsCountMap.get(user) || 0;
  visitsCountMap.set(user, count + 1);
}
// 主程序中
// 📁 main.js
let Bob = { name: "Bob" };
countUser(Bob); // 计算Bob的来访次数
// ~ 不久后 Bob离开了
Bob = null;
// ~ 现在，john 这个对象应该被垃圾回收，但它仍在内存中，因为它是 visitsCountMap 中的一个键。
console.log(visitsCountMap.keys()); // [Map Iterator] { { name: 'Bob' } }
// * 当我们移除用户时，我们需要清理 visitsCountMap，否则它将在内存中无限增大。在复杂的架构中，这种清理会成为一项繁重的任务。

// 我们可以通过使用 WeakMap 来避免这样的问题：
// ! 2) 使用weakMap(正确姿势！)
// 📁 visitsCount.js
const visitsCountMap1 = new WeakMap(); // weakmap: user => visits count

// 递增用户来访次数
function countUserWeakMap(user) {
  let count = visitsCountMap1.get(user) || 0;
  visitsCountMap1.set(user, count + 1);
}
// ! 现在我们不需要去清理 visitsCountMap 了。当 user 对象变成不可达时，即便它是 WeakMap 里的一个键，它也会连同它作为 WeakMap 里的键所对应的信息一同被从内存中删除。

// ! ② 还有类似的： 给dom元素添加数据或者事件（与DOM元素共生死）
// 例1 dom元素被清除 对应的信息也相应应该被删除
const weakm = new WeakMap();
const ele = document.getElementById("app");
weakm.set(ele, "some information");
weakm.get(ele);
// 例2 绑定事件
weakm.set(ele, { timeClicked: 0 });
// 计数 对ele节点的点击次数
// 一旦ele节点删除，则timeClicked这个状态就会自动消失，不会内存泄露
ele.addEventListener("click", function () {
  let data = weakm.get(ele);
  data.timeClicked++;
});
// ? 总结就是weakMap很适合注册监听事件
const listener = new WeakMap();
listener.set(ele, handler);
ele.addEventListener("click", listener.get(ele));
function handler() {
  console.log(111);
}
// ! 使用场景2：缓存
// 我们可以存储（“缓存”）函数的结果，以便将来对同一个对象的调用可以重用这个结果。
// 1）假如使用map（不是最佳方案）
// 📁 cache.js
let cache = new Map();
// 某个复杂计算
function sum(o) {
  return o.a + o.b;
}
// 计算并缓存结果
function process(obj) {
  if (!cache.has(obj)) {
    // 初次调用计算结果
    let result = sum(obj);
    cache.set(obj, result);
  }
  return cache.get(obj);
}

// 现在在其他文件中多次需要使用这个结果
// 📁 main.js
let obj4 = { a: 2, b: 333 };
let result1 = process(obj4); // 计算完成

// 其他地方又用到了
let result2 = process(obj4); // 取自缓存
console.log(result1 === result2, result1); // true
// 不再需要这个对象了
obj4 = null;
console.log(cache.size); // ? 1! （啊！该对象依然在 cache 中，并占据着内存！）

// ~ 对于多次调用同一个对象，它只需在第一次调用时计算出结果，之后的调用可以直接从 cache 中获取。这样做的缺点是，当我们不再需要这个对象的时候需要清理 cache。

// ! 如果我们用 WeakMap 替代 Map，便不会存在这个问题。当对象被垃圾回收时，对应缓存的结果也会被自动从内存中清除。
// 📁 cache.js
let weakCache = new WeakMap();

// ...
/*
  无法获取 cache.size，因为它是一个 WeakMap，
     要么是 0，或即将变为 0
     当 obj 被垃圾回收，缓存的数据也会被清除
 */
