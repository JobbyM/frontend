# CSS

## CSS 定位
### 固定定位 fixed
元素的位置相对于浏览器窗口是固定位置，即使窗口是滚动的它也不会移动。Fixed 定
位使元素的位置与文档流无关，因此不占据空间。 Fixed 定位的元素和其他元素重叠。

### 相对定位 relative
如果对一个元素进行相对定位，它将出现在它所在的位置上。然后，可以通过设置垂直
或水平位置，让这个元素“相对于”它的起点进行移动。 在使用相对定位时，无论是
否进行移动，元素仍然占据原来的空间。因此，移动元素会导致它覆盖其它框。

### 绝对定位 absolute
绝对定位的元素的位置相对于最近的已定位父元素，如果元素没有已定位的父元素，那
么它的位置相对于 `<html>`。absolute 定位使元素的位置与文档流无关，因此不占据空间。
absolute 定位的元素和其他元素重叠。

### 粘性定位 sticky
元素先按照普通文档流定位，然后相对于该元素在流中的 flow root（BFC）和 containing
block（最近的块级祖先元素）定位。而后，元素定位表现为在跨越特定阈值前为相对定
位，之后为固定定位。

### 默认定位 static
默认值。没有定位，元素出现在正常的流中（忽略 top, bottom, left, right 或者 z-index 声
明）。

### inherit
规定应该从父元素继承 position 属性的值。

## BFC
### 什么是 BFC
**块格式化上下文（Block Formatting Context，BFC）** 是 Web 页面的可视CSS 渲染的一部分，是块盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

### BFC 特性、功能
* 使用 BFC 包住浮动元素（清除浮动）
* 和浮动元素产生边界
* 同一个 BFC 下外边距会发生折叠

### 创建 BFC
1. float 的值**不是** none
2. position 的值是 absolute、fixed
3. display 的值是 inline-block、flow-root、table-cell、table-caption、flex 或者 inline-flex、grid 或者 inline-grid
4. overflow 的值**不是** visible

## 元素隐藏
1. `opacity：0`，该元素隐藏起来了，但不会改变页面布局，并且，如果该元素已经绑定
一些事件，如 click 事件，那么点击该区域，也能触发点击事件的
2. `visibility：hidden`，该元素隐藏起来了，但不会改变页面布局，但是不会触发该元素已
经绑定的事件
3. `display：none`，把元素隐藏起来，并且会改变页面布局，可以理解成在页面中把该元
素删除掉

## 水平垂直居中
### 固定宽高元素
在将其绝对定位在50％/ 50％后，使用等于该宽度和高度的一半的负边距，获得完美的跨浏览器支持水平垂直居中：
```css
.parent {
  position: relative;
}
.child {
  width: 300px;
  height: 100px;
  padding: 20px;

  position: absolute;
  top: 50%;
  left: 50%;

  margin: -70px 0 0 -170px;
}
```
### 未知宽高的元素
如果不知道宽度或高度，则可以使用`transform`属性，在两个方向上的50％负向平移（它基于元素的当前宽度/高度）居中：
```css
.parent {
  position: relative;
}
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```
### 使用flexbox
使用flexbox 实现水平垂直居中，需要使用两个居中属性：
```css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
```
### 使用grid
这只是一个小技巧（由Lance Janssen 提出），对于一个元素来说效果非常好：
```css
body, html {
  height: 100%;
  display: grid;
}
span { /* thing to center */
  margin: auto;
}
```