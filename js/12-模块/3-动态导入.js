// 我们在前面章节中介绍的导出和导入语句称为“静态”导入。语法非常简单且严格。
/*
1 首先，我们不能动态生成 import 的任何参数。

    模块路径必须是原始类型字符串，不能是函数调用，下面这样的 import 行不通：
    import ... from getModuleName(); // Error, only from "string" is allowed

2 其次，我们无法根据条件或者在运行时导入：

    if(...) {
    import ...; // Error, not allowed!
    }

    {
    import ...; // Error, we can't put import in any block
    }

这是因为 import/export 旨在提供代码结构的主干。
这是非常好的事儿，因为这样便于分析代码结构，可以收集模块，可以使用特殊工具将收集的模块打包到一个文件中，可以删除未使用的导出（“tree-shaken”）。
这些只有在 import/export 结构简单且固定的情况下才能够实现。

*/

// ? 如何实现动态导入呢

// ! import() 我们不能将 import 复制到一个变量中，或者对其使用 call/apply。因为它不是一个函数。
// import(module) 表达式加载模块并返回一个 promise，该 promise resolve 为一个包含其所有导出的模块对象。我们可以在代码中的任意位置调用这个表达式。
// ! 动态导入在常规脚本中工作时，它们不需要 script type="module".

let modulePath = prompt("Which module to load?");
/*
import(modulePath)
  .then(obj => <module object>)
  .catch(err => <loading error, e.g. if no such module>)
*/

// 或者，如果在异步函数中，我们可以使用 let module = await import(modulePath)。
// 📁 say.js
export function hi() {
  alert(`Hello`);
}

export function bye() {
  alert(`Bye`);
}

// 那么，可以像下面这样进行动态导入：

let { hi, bye } = await import("./say.js");

hi();
bye();

// 如果 say.js 有默认的导出：
// 📁 say.js
export default function () {
  alert("Module loaded (export default)!");
}

// ~ 为了访问它，我们可以使用模块对象的 default 属性：

let obj = await import("./say.js");
let say = obj.default;
// or, in one line: let {default: say} = await import('./say.js');

say();
