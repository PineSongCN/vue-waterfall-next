<template>
    <div
        ref="vueWaterfall"
        class="ui-waterfall"
        :style="{ height: height }"
        :class="{ 'is-transition': isTransition }"
    >
        <div class="ui-waterfall-slot-box" ref="vueWaterfallSlotBox">
            <slot></slot>
            <slot
                v-for="(record, index) in data"
                :key="uniqueKey ? record[uniqueKey] : index"
                name="item"
                :record="record"
                :index="index"
            ></slot>
        </div>
    </div>
</template>

<script lang="ts" setup generic="T extends Record<string, any>">
import { useProps } from './hooks';
import type { WaterfallEmits, WaterfallInstance, WaterfallProps } from './interface';

const props = withDefaults(defineProps<WaterfallProps<T>>(), {
    col: 2,
    data: () => [],
    gutterWidth: 10,
    isTransition: true,
    lazyDistance: 100,
    loadDistance: 100,
    interactive: false,
});

const emit = defineEmits<WaterfallEmits>();

const { vueWaterfall, vueWaterfallSlotBox, resize, mix } = useProps(props, emit);

defineExpose<WaterfallInstance>({ resize, mix });
</script>

<style lang="less" scoped>
@import './Waterfall.less';
</style>
