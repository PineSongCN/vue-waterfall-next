<script setup lang="ts">
import { ref } from 'vue';
import { VueWaterfallNext } from '../Waterfall';
import { generateMockList } from './mock';

const dataSource = ref(generateMockList());
const loadDataSource = () => {
    dataSource.value = [...dataSource.value, ...generateMockList()];
};

const onItemClick = () => {
    console.log('onItemClick');
};
</script>

<template>
    <div class="demo-box">
        <VueWaterfallNext
            :data="dataSource"
            uniqueKey="id"
            :col="3"
            :gutterWidth="16"
            interactive
            @load-more="loadDataSource"
        >
            <template #item="{ record, index }">
                <div class="item" @click="onItemClick">
                    <div
                        v-if="record.imgs.length"
                        class="imgs"
                        :class="{ multi: record.imgs.length > 1 }"
                    >
                        <div v-if="record.imgs.length > 1" class="grid">
                            <img
                                v-for="(img, iIndex) in record.imgs.slice(0, 9)"
                                :key="iIndex"
                                class="grid-item"
                                :src="img"
                            />
                        </div>
                        <img v-else :src="record.imgs[0]" class="img" />
                    </div>
                    <div class="content">
                        <div class="text">{{ record.content }}</div>
                    </div>
                    <div class="index">{{ index + 1 }}</div>
                </div>
            </template>
        </VueWaterfallNext>
        <div class="fixed">
            {{ dataSource.length }}
        </div>
    </div>
</template>

<style lang="less" scoped>
.demo-box {
    width: 100%;
    padding: 24px;
    .fixed {
        padding: 0 12px;
        border-radius: 4px;
        position: fixed;
        left: 12px;
        bottom: 12px;
        font-size: 24px;
        color: #f00;
        background-color: rgba(255, 0, 0, 0.2);
    }
}
.item {
    width: 100%;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    .imgs {
        width: 100%;
        .img {
            width: 100%;
        }
        &.multi {
            display: flex;
            gap: 12px;
            .img {
                width: 100%;
            }
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
            .grid-item {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
    }
    .index {
        font-size: 24px;
    }
}
</style>
