import {
    ref,
    onMounted,
    onUnmounted,
    onActivated,
    onDeactivated,
    nextTick,
    computed,
    watch,
} from 'vue';

import type { VueEmit, WaterfallEmits, WaterfallProps } from './interface';

/**
 * 瀑布流组件的核心逻辑 Hook
 * @param props - 组件属性
 * @param emit - 事件
 */
export const useProps = (props: WaterfallProps, emit: VueEmit<WaterfallEmits>) => {
    // 组件根元素和插槽容器的引用
    const vueWaterfall = ref<HTMLElement | null>(null);
    const vueWaterfallSlotBox = ref<HTMLElement | null>(null);

    // 瀑布流布局相关的状态
    const root = ref<HTMLElement | null>(null);
    const columns = ref<HTMLElement[]>([]);
    const loadMore = ref(true);
    const lazyTimeout = ref<number | null>(null);
    const lastScrollTop = ref(0);
    const timer = ref<number | null>(null);
    const loadedIndex = ref(0);
    const columnWidth = ref(0);
    const isResizing = ref(false);
    const clientHeight = ref(document.documentElement.clientHeight || document.body.clientHeight);
    const clientWidth = ref(document.documentElement.clientWidth || document.body.clientWidth);

    // 计算图片懒加载的触发距离
    const trueLazyDistance = computed(() => {
        return props.lazyDistance ?? 0;
    });

    // 计算加载更多的触发距离
    const max = computed(() => {
        return props.loadDistance ?? 0;
    });

    // 监听列数变化，重新初始化布局
    watch(
        () => props.col,
        () => {
            nextTick(() => {
                setTimeout(() => {
                    init();
                }, 300);
            });
        }
    );

    // 监听数据源变化，更新布局
    watch(
        () => props.data,
        (newVal, oldVal) => {
            nextTick(() => {
                clearTimeout(timer.value as number);
                timer.value = window.setTimeout(() => {
                    if (isResizing.value) {
                        return;
                    }
                    const newValLength = newVal?.length ?? 0;
                    const oldValLength = oldVal?.length ?? 0;
                    if (newValLength < loadedIndex.value) {
                        loadedIndex.value = 0;
                    }
                    if (newValLength > oldValLength || newValLength > loadedIndex.value) {
                        if (newValLength === oldValLength) {
                            resize(loadedIndex.value > 0 ? loadedIndex.value : null);
                            return;
                        }
                        resize(oldValLength > 0 ? oldValLength : null);
                    }
                }, 300);
            });
        }
    );

    /**
     * 初始化瀑布流布局
     * 创建列容器并设置样式
     */
    const init = () => {
        root.value = vueWaterfall.value;
        clearColumn();
        const col = parseInt((props.col ?? 2).toString());
        for (let i = 0; i < col; i++) {
            const oDiv = document.createElement('div');
            oDiv.className = 'ui-waterfall-column';
            oDiv.style.gap = `${props.gutterWidth}px`;
            if (props.width) {
                oDiv.style.width = `${props.width}px`;
                if (i !== 0) {
                    oDiv.style.marginLeft = `${props.gutterWidth}px`;
                }
                columnWidth.value = props.width;
            } else {
                const gap = Math.ceil((props.gutterWidth! * 2) / 3);
                oDiv.style.width = `calc(${100 / parseInt(col.toString())}% - ${gap}px)`;

                columnWidth.value =
                    (100 / parseInt(col.toString()) / 100) * document.documentElement.clientWidth -
                    gap;
                if (i !== 0) {
                    oDiv.style.marginLeft = `${props.gutterWidth}px`;
                }
            }
            if (!root.value) {
                root.value = vueWaterfall.value;
            }
            root.value?.appendChild?.(oDiv);
            columns.value.push(oDiv);
        }
        resize();
    };

    /**
     * 设置图片元素的高度
     * @param dom - 包含图片的 DOM 元素
     */
    const setDomImageHeight = async (dom: HTMLElement) => {
        if (!dom.getElementsByTagName) {
            return;
        }
        const imgs = dom.getElementsByTagName('img');
        for (let i = 0; i < imgs.length; i++) {
            const lazySrc = imgs[i].getAttribute('lazy-src');
            if (!imgs[i].getAttribute('src') && lazySrc) {
                const newImg = new Image();
                newImg.src = lazySrc;
                if (newImg.complete) {
                    const trueWidth = imgs[i].offsetWidth || columnWidth.value;
                    const imgColumnHeight = (newImg.height * trueWidth) / newImg.width;

                    if (imgs[i].offsetWidth) {
                        imgs[i].style.height = `${imgColumnHeight}px`;
                    }
                } else {
                    await new Promise<void>((resolve) => {
                        newImg.onload = function () {
                            const trueWidth = imgs[i].offsetWidth || columnWidth.value;
                            const imgColumnHeight = (newImg.height * trueWidth) / newImg.width;

                            if (imgs[i].offsetWidth) {
                                imgs[i].style.height = `${imgColumnHeight}px`;
                            }
                            resolve();
                        };
                        newImg.onerror = function () {
                            resolve();
                        };
                    });
                }
            }
        }
    };

    /**
     * 将元素添加到高度最小的列中
     * @param dom - 要添加的 DOM 元素
     */
    const append = async (dom: HTMLElement) => {
        if (columns.value.length > 0) {
            let min = columns.value[0];
            for (let i = 1; i < columns.value.length; i++) {
                if ((await getHeight(min)) > (await getHeight(columns.value[i]))) {
                    min = columns.value[i];
                }
            }
            min?.appendChild?.(dom);
            await setDomImageHeight(dom);
        }
    };

    /**
     * 检查 DOM 元素是否包含图片
     * @param dom - 要检查的 DOM 元素
     */
    const checkImg = (dom: HTMLElement | null): boolean => {
        if (!dom) {
            return false;
        }
        if (dom.getElementsByTagName && dom.getElementsByTagName('img').length) {
            return true;
        }
        return false;
    };

    /**
     * 重新计算瀑布流布局
     * @param index - 起始索引
     * @param elements - 要布局的元素数组
     */
    const resize = async (index?: number | null, elements?: HTMLElement[]) => {
        isResizing.value = true;

        if (!vueWaterfallSlotBox.value?.children?.length) {
            isResizing.value = false;
            return;
        }
        if (props.interactive) {
            index = 0;
        }
        const tmp = props.interactive
            ? vueWaterfallSlotBox.value
            : (vueWaterfallSlotBox.value.cloneNode(true) as unknown as HTMLElement);
        if (!index && index !== 0 && !elements) {
            elements = Array.from(tmp.children) as HTMLElement[];
            loadedIndex.value = 0;
            clear();
        } else if (!elements) {
            elements = Array.from(tmp.children).splice(index!) as HTMLElement[];
        }

        for (let j = 0; j < elements.length; j++) {
            if (elements[j] && checkImg(elements[j])) {
                const imgs = elements[j].getElementsByTagName('img');
                const newImg = new Image();
                newImg.src = imgs[0].src;
                if (newImg.complete) {
                    await append(elements[j]);
                    lazyLoad(imgs);
                } else {
                    await new Promise<void>((resolve) => {
                        newImg.onload = async function () {
                            await append(elements![j]);
                            lazyLoad(imgs);
                            resolve();
                        };
                        newImg.onerror = async function () {
                            await append(elements![j]);
                            lazyLoad(imgs);
                            resolve();
                        };
                    });
                }
            } else {
                await append(elements[j]);
            }
            loadedIndex.value++;
        }
        isResizing.value = false;
        emit('finish');
    };

    /**
     * 图片懒加载处理
     * @param imgs - 图片元素集合
     */
    const lazyLoad = (imgs?: HTMLCollectionOf<HTMLImageElement>) => {
        if (!imgs) {
            if (!root.value) {
                root.value = vueWaterfall.value;
            }
            imgs = root.value?.getElementsByTagName('img');
        }

        if (!imgs || imgs.length < 0) {
            return;
        }

        for (let index = 0; index < imgs.length; index++) {
            if (imgs[index].className.match('animation') && imgs[index].getAttribute('src')) {
                continue;
            } else if (
                imgs[index].className.match('animation') &&
                !imgs[index].getAttribute('src')
            ) {
                imgs[index].src = imgs[index].getAttribute('lazy-src') || '';
                imgs[index].removeAttribute('lazy-src');
            } else if (
                imgs[index].getAttribute('src') &&
                !imgs[index].className.match('animation')
            ) {
                imgs[index].className = imgs[index].className + ' animation';
            } else if (
                !imgs[index].getAttribute('src') &&
                imgs[index].getBoundingClientRect().top <
                    clientHeight.value + trueLazyDistance.value
            ) {
                imgs[index].src = imgs[index].getAttribute('lazy-src') || '';
                imgs[index].className = imgs[index].className + ' animation';
                imgs[index].removeAttribute('lazy-src');
            }
        }
    };

    /**
     * 清除所有列容器
     */
    const clearColumn = () => {
        columns.value.forEach((item) => {
            item.remove();
        });
        columns.value = [];
    };

    /**
     * 清空所有列容器的内容
     */
    const clear = () => {
        columns.value.forEach((item) => {
            item.innerHTML = '';
        });
    };

    /**
     * 随机打乱元素顺序并重新布局
     */
    const mix = () => {
        const elements = Array.from(
            (vueWaterfallSlotBox.value?.cloneNode(true) as HTMLElement).children || []
        ) as HTMLElement[];
        elements.sort(() => {
            return Math.random() - 0.5;
        });
        resize(0, elements);
    };

    /**
     * 获取元素高度
     * @param dom - DOM 元素
     */
    const getHeight = async (dom: HTMLElement): Promise<number> => {
        return dom.offsetHeight;
    };

    /**
     * 触发加载更多事件
     */
    const emitLoadMore = () => {
        if (!root.value) {
            return;
        }

        const scrollTop = props.height
            ? root.value.scrollTop
            : document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = props.height
            ? root.value.scrollHeight
            : document.documentElement.offsetHeight;
        const diff = scrollHeight - scrollTop - clientHeight.value;
        emit('scroll', {
            scrollHeight,
            scrollTop,
            clientHeight: clientHeight.value,
            diff,
            time: Date.now(),
        });

        if (
            diff <= max.value &&
            loadMore.value &&
            scrollHeight > clientHeight.value &&
            !isResizing.value
        ) {
            lastScrollTop.value = scrollTop;
            loadMore.value = false;
            emit('loadMore');
        } else if (diff >= max.value) {
            loadMore.value = true;
        }

        clearTimeout(lazyTimeout.value as number);
        lazyTimeout.value = window.setTimeout(() => {
            lazyLoad();
        }, 14);
    };

    /**
     * 滚动事件处理函数
     */
    const handleScroll = () => {
        emitLoadMore();
    };

    /**
     * 初始化滚动事件监听
     */
    const initScrollEvents = () => {
        if (props.height) {
            root.value?.addEventListener('scroll', handleScroll);
            root.value?.addEventListener('touchmove', handleScroll);
        } else {
            document.addEventListener('scroll', handleScroll);
            document.addEventListener('touchmove', handleScroll);
        }
    };

    /**
     * 清除滚动事件监听
     */
    const destroyScrollEvents = () => {
        root.value?.removeEventListener('scroll', handleScroll);
        root.value?.removeEventListener('touchmove', handleScroll);

        if (root.value) {
            root.value.onresize = null;
        }
        window.onresize = null;
        document.removeEventListener('scroll', handleScroll);
        document.removeEventListener('touchmove', handleScroll);
    };

    // 组件挂载时初始化布局和事件监听
    onMounted(() => {
        nextTick(() => {
            init();
            initScrollEvents();
        });
    });

    // 组件卸载时清除事件监听
    onUnmounted(() => {
        destroyScrollEvents();
    });

    // keep-alive 组件激活时重新添加事件监听
    onActivated(() => {
        initScrollEvents();
    });

    // keep-alive 组件停用时清除事件监听
    onDeactivated(() => {
        destroyScrollEvents();
    });

    return { vueWaterfall, vueWaterfallSlotBox, resize, mix };
};
