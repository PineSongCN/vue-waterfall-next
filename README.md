# vue-waterfall-next

[![Version](https://img.shields.io/npm/v/vue-waterfall-next.svg?style=flat-square)](https://www.npmjs.com/package/vue-waterfall-next)

`vue-waterfall-next` 组件是一个用于实现瀑布流布局的 Vue 3 组件。它支持多列布局、间距设置、懒加载以及加载更多数据的功能。

## 安装

```bash
npm install vue-waterfall-next
# 或者
pnpm add vue-waterfall-next
# 或者
yarn add vue-waterfall-next
```

## 使用方法

### 全局注册

```typescript
import { createApp } from 'vue'
import { VueWaterfallNextGlobal } from 'vue-waterfall-next'

const app = createApp(App)
app.use(VueWaterfallNextGlobal)
```

### 局部引入

```typescript
import { VueWaterfallNext } from 'vue-waterfall-next'
```

### 基础用法

```vue
<template>
  <VueWaterfallNext
    :data="dataSource"
    uniqueKey="id"
    :col="3"
    :gutterWidth="16"
    interactive
    @load-more="loadDataSource"
  >
    <template #item="{ record, index }">
      <div class="item">
        <!-- 图片展示 -->
        <div v-if="record.imgs.length" class="imgs">
          <!-- 多图布局 -->
          <div v-if="record.imgs.length > 1" class="grid">
            <img
              v-for="(img, iIndex) in record.imgs.slice(0, 9)"
              :key="iIndex"
              :src="img"
            />
          </div>
          <!-- 单图布局 -->
          <img v-else :src="record.imgs[0]" />
        </div>
        <!-- 内容展示 -->
        <div class="content">{{ record.content }}</div>
      </div>
    </template>
  </VueWaterfallNext>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueWaterfallNext } from 'vue-waterfall-next'

const dataSource = ref([])
const loadDataSource = () => {
  // 加载更多数据
}
</script>
```

## API

### Props

| 参数         | 说明                     | 类型      | 默认值  |
| ------------ | ------------------------ | --------- | ------- |
| data         | 瀑布流数据源             | `T[]`     | `[]`    |
| col          | 列数                     | `number`  | `2`     |
| width        | 列宽度                   | `number`  | -       |
| height       | 容器高度                 | `string`  | -       |
| gutterWidth  | 列间距                   | `number`  | `10`    |
| uniqueKey    | 数据项的唯一标识字段     | `string`  | -       |
| isTransition | 是否启用过渡动画         | `boolean` | `true`  |
| lazyDistance | 懒加载触发距离（像素）   | `number`  | `100`   |
| loadDistance | 加载更多触发距离（像素） | `number`  | `100`   |
| interactive  | 是否启用交互             | `boolean` | `false` |

### Events

| 事件名    | 说明               | 回调参数                                                                                        |
| --------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| load-more | 加载更多时触发     | -                                                                                               |
| scroll    | 滚动时触发         | `{ scrollHeight: number, scrollTop: number, clientHeight: number, diff: number, time: number }` |
| finish    | 布局计算完成时触发 | -                                                                                               |

### Methods

| 方法名 | 说明                               | 参数                                                                                                              |
| ------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| resize | 手动触发瀑布流布局的重新计算       | `(index?: number \| null, elements?: HTMLElement[]) => void`<br>- index: 起始索引<br>- elements: 要布局的元素数组 |
| mix    | 随机打乱瀑布流项目的顺序并重新布局 | `() => void`                                                                                                      |

### Slots

| 插槽名  | 说明               | 作用域参数                     |
| ------- | ------------------ | ------------------------------ |
| default | 瀑布流子项内容列表 | `{  }`                         |
| item    | 瀑布流子项内容     | `{ record: T, index: number }` |

## 注意事项

1. 当数据源更新时，组件会自动重新计算布局
2. 如何瀑布流内容有绑定事件，使用`interactive`属性开启交互模式

#### 基于[vue-waterfall2](https://github.com/AwesomeDevin/vue-waterfall2) 改写
