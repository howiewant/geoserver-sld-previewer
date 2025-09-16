<template>
    <div class="symbolizer-config">
        <!-- 符号化器类型 -->
        <el-form-item label="类型">
            <el-select v-model="localSymbolizer.type" @change="onTypeChange">
                <el-option label="多边形" value="polygon" />
                <el-option label="线条" value="line" />
                <el-option label="点" value="point" />
                <el-option label="文本" value="text" />
            </el-select>
        </el-form-item>

        <!-- 多边形样式 -->
        <template v-if="localSymbolizer.type === 'polygon'">
            <!-- 填充样式 -->
            <el-form-item label="填充颜色">
                <div class="color-picker-wrapper">
                    <el-color-picker v-model="localSymbolizer.fill.color" color-format="hex" @change="emitUpdate" />
                    <span>{{ localSymbolizer.fill.color }}</span>
                </div>
            </el-form-item>

            <el-form-item label="填充透明度">
                <el-input-number v-model="localSymbolizer.fill.opacity" :min="0" :max="1" :step="0.1" :precision="1"
                    @change="emitUpdate" />
            </el-form-item>

            <!-- 边框样式 -->
            <el-form-item label="边框颜色">
                <div class="color-picker-wrapper">
                    <el-color-picker v-model="localSymbolizer.stroke.color"  @change="emitUpdate" />
                    <span>{{ localSymbolizer.stroke.color }}</span>
                </div>
            </el-form-item>

            <el-form-item label="边框宽度">
                <el-input-number v-model="localSymbolizer.stroke.width" :min="0" :step="0.5" @change="emitUpdate" />
            </el-form-item>

            <el-form-item label="边框透明度">
                <el-input-number v-model="localSymbolizer.stroke.opacity" :min="0" :max="1" :step="0.1" :precision="1"
                    @change="emitUpdate" />
            </el-form-item>
        </template>

        <!-- 线条样式 -->
        <template v-if="localSymbolizer.type === 'line'">
            <el-form-item label="线条颜色">
                <div class="color-picker-wrapper">
                    <el-color-picker v-model="localSymbolizer.stroke.color"  @change="emitUpdate" />
                    <span>{{ localSymbolizer.stroke.color }}</span>
                </div>
            </el-form-item>

            <el-form-item label="线条宽度">
                <el-input-number v-model="localSymbolizer.stroke.width" :min="0" :step="0.5" @change="emitUpdate" />
            </el-form-item>

            <el-form-item label="线条透明度">
                <el-input-number v-model="localSymbolizer.stroke.opacity" :min="0" :max="1" :step="0.1" :precision="1"
                    @change="emitUpdate" />
            </el-form-item>

            <el-form-item label="线条样式">
                <el-select v-model="localSymbolizer.stroke.dashArray" @change="emitUpdate">
                    <el-option label="实线" :value="null" />
                    <el-option label="虚线" value="5 5" />
                    <el-option label="点线" value="2 3" />
                    <el-option label="点划线" value="10 5 2 5" />
                </el-select>
            </el-form-item>
        </template>

        <!-- 点样式 -->
        <template v-if="localSymbolizer.type === 'point'">
            <el-form-item label="标记类型">
                <el-select v-model="localSymbolizer.mark.wellKnownName" @change="emitUpdate">
                    <el-option label="圆形" value="circle" />
                    <el-option label="方形" value="square" />
                    <el-option label="三角形" value="triangle" />
                    <el-option label="星形" value="star" />
                    <el-option label="十字" value="cross" />
                    <el-option label="X形" value="x" />
                </el-select>
            </el-form-item>

            <el-form-item label="大小">
                <el-input-number v-model="localSymbolizer.mark.size" :min="1" @change="emitUpdate" />
            </el-form-item>

            <el-form-item label="填充颜色">
                <div class="color-picker-wrapper">
                    <el-color-picker v-model="localSymbolizer.mark.fill.color" @change="emitUpdate" />
                    <span>{{ localSymbolizer.mark.fill.color }}</span>
                </div>
            </el-form-item>

            <el-form-item label="边框颜色">
                <div class="color-picker-wrapper">
                    <el-color-picker v-model="localSymbolizer.mark.stroke.color" @change="emitUpdate" />
                    <span>{{ localSymbolizer.mark.stroke.color }}</span>
                </div>
            </el-form-item>
        </template>

        <!-- 文本样式 -->
        <template v-if="localSymbolizer.type === 'text'">
            <el-form-item label="标签字段">
                <el-select 
                    v-model="localSymbolizer.label.propertyName" 
                    placeholder="选择字段" 
                    @change="emitUpdate"
                    filterable
                    clearable
                >
                    <el-option 
                        v-for="field in sldStore.layerFields" 
                        :key="field.name" 
                        :label="`${field.name} (${field.type})`" 
                        :value="field.name"
                    >
                        <span style="float: left">{{ field.name }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">{{ field.type }}</span>
                    </el-option>
                </el-select>
                <div v-if="sldStore.layerFields.length === 0" class="field-hint">
                    请先在GeoServer配置中获取图层字段
                </div>
            </el-form-item>

            <el-form-item label="字体大小">
                <el-input-number v-model="localSymbolizer.font.size" :min="8" @change="emitUpdate" />
            </el-form-item>

            <el-form-item label="字体颜色">
                <div class="color-picker-wrapper">
                    <el-color-picker v-model="localSymbolizer.font.fill.color" @change="emitUpdate" />
                    <span>{{ localSymbolizer.font.fill.color }}</span>
                </div>
            </el-form-item>

            <el-form-item label="字体家族">
                <el-input v-model="localSymbolizer.font.family" placeholder="Arial, sans-serif" @input="emitUpdate" />
            </el-form-item>

            <!-- LabelPlacement 配置 -->
            <el-form-item label="标签放置类型">
                <el-select v-model="localSymbolizer.labelPlacement.type" @change="emitUpdate">
                    <el-option label="点放置" value="point" />
                    <el-option label="线放置" value="line" />
                </el-select>
            </el-form-item>

            <!-- 点放置配置 -->
            <template v-if="localSymbolizer.labelPlacement.type === 'point'">
                <el-form-item label="锚点X">
                    <el-input-number v-model="localSymbolizer.labelPlacement.point.anchorPointX" :min="0" :max="1" :step="0.1" :precision="1" @change="emitUpdate" />
                </el-form-item>

                <el-form-item label="锚点Y">
                    <el-input-number v-model="localSymbolizer.labelPlacement.point.anchorPointY" :min="0" :max="1" :step="0.1" :precision="1" @change="emitUpdate" />
                </el-form-item>

                <el-form-item label="位移X">
                    <el-input-number v-model="localSymbolizer.labelPlacement.point.displacementX" :step="1" @change="emitUpdate" />
                </el-form-item>

                <el-form-item label="位移Y">
                    <el-input-number v-model="localSymbolizer.labelPlacement.point.displacementY" :step="1" @change="emitUpdate" />
                </el-form-item>

                <el-form-item label="旋转角度">
                    <el-input-number v-model="localSymbolizer.labelPlacement.point.rotation" :min="0" :max="360" :step="1" @change="emitUpdate" />
                </el-form-item>
            </template>

            <!-- 线放置配置 -->
            <template v-if="localSymbolizer.labelPlacement.type === 'line'">
                <el-form-item label="垂直偏移">
                    <el-input-number v-model="localSymbolizer.labelPlacement.line.perpendicularOffset" :step="1" @change="emitUpdate" />
                </el-form-item>

                <el-form-item label="沿线放置">
                    <el-switch v-model="localSymbolizer.labelPlacement.line.isAligned" @change="emitUpdate" />
                </el-form-item>

                <el-form-item label="重复间隔">
                    <el-input-number v-model="localSymbolizer.labelPlacement.line.repeat" :min="0" :step="10" @change="emitUpdate" />
                </el-form-item>

                <el-form-item label="初始间隙">
                    <el-input-number v-model="localSymbolizer.labelPlacement.line.initialGap" :min="0" :step="5" @change="emitUpdate" />
                </el-form-item>
            </template>

            <!-- Halo 配置 -->
            <el-form-item label="启用光晕">
                <el-switch v-model="localSymbolizer.halo.enabled" @change="emitUpdate" />
            </el-form-item>

            <template v-if="localSymbolizer.halo.enabled">
                <el-form-item label="光晕半径">
                    <el-input-number v-model="localSymbolizer.halo.radius" :min="0" :step="0.5" @change="emitUpdate" />
                </el-form-item>

                <el-form-item label="光晕颜色">
                    <div class="color-picker-wrapper">
                        <el-color-picker v-model="localSymbolizer.halo.fill.color" @change="emitUpdate" />
                        <span>{{ localSymbolizer.halo.fill.color }}</span>
                    </div>
                </el-form-item>

                <el-form-item label="光晕透明度">
                    <el-input-number v-model="localSymbolizer.halo.fill.opacity" :min="0" :max="1" :step="0.1" :precision="1" @change="emitUpdate" />
                </el-form-item>
            </template>

            <!-- VendorOption 配置 -->
            <el-form-item label="标签障碍物">
                <el-switch v-model="localSymbolizer.vendorOptions.labelObstacle" @change="emitUpdate" />
                <div class="option-description">防止标签与其他要素重叠</div>
            </el-form-item>

            <el-form-item label="标签周围空间">
                <el-input-number 
                    v-model="localSymbolizer.vendorOptions.spaceAround" 
                    :min="0" 
                    :step="1" 
                    @change="emitUpdate"
                    placeholder="像素"
                />
                <div class="option-description">标签周围的最小空间（像素）</div>
            </el-form-item>

            <el-form-item label="最大位移">
                <el-input-number 
                    v-model="localSymbolizer.vendorOptions.maxDisplacement" 
                    :min="0" 
                    :step="1" 
                    @change="emitUpdate"
                    placeholder="像素"
                />
                <div class="option-description">标签可以偏移的最大距离（像素）</div>
            </el-form-item>

            <el-form-item label="最小组距离">
                <el-input-number 
                    v-model="localSymbolizer.vendorOptions.minGroupDistance" 
                    :min="0" 
                    :step="1" 
                    @change="emitUpdate"
                    placeholder="像素"
                />
                <div class="option-description">同组标签之间的最小距离（像素）</div>
            </el-form-item>

            <el-form-item label="重复距离">
                <el-input-number 
                    v-model="localSymbolizer.vendorOptions.repeat" 
                    :min="0" 
                    :step="10" 
                    @change="emitUpdate"
                    placeholder="像素"
                />
                <div class="option-description">标签重复显示的最小距离（像素）</div>
            </el-form-item>

            <el-form-item label="自动换行">
                <el-input-number 
                    v-model="localSymbolizer.vendorOptions.autoWrap" 
                    :min="0" 
                    :step="10" 
                    @change="emitUpdate"
                    placeholder="像素"
                />
                <div class="option-description">文本自动换行的宽度（像素）</div>
            </el-form-item>

            <el-form-item label="强制从左到右">
                <el-switch v-model="localSymbolizer.vendorOptions.forceLeftToRight" @change="emitUpdate" />
                <div class="option-description">强制文本从左到右显示</div>
            </el-form-item>

            <el-form-item label="冲突解决">
                <el-switch v-model="localSymbolizer.vendorOptions.conflictResolution" @change="emitUpdate" />
                <div class="option-description">启用标签冲突解决</div>
            </el-form-item>

            <el-form-item label="跟随线条">
                <el-switch v-model="localSymbolizer.vendorOptions.followLine" @change="emitUpdate" />
                <div class="option-description">标签跟随线条方向</div>
            </el-form-item>

            <el-form-item label="最大角度变化">
                <el-input-number 
                    v-model="localSymbolizer.vendorOptions.maxAngleDelta" 
                    :min="0" 
                    :max="90" 
                    :step="5" 
                    @change="emitUpdate"
                    placeholder="度"
                />
                <div class="option-description">沿线标签的最大角度变化（度）</div>
            </el-form-item>

            <el-form-item label="放置质量">
                <el-input-number 
                    v-model="localSymbolizer.vendorOptions.goodnessOfFit" 
                    :min="0" 
                    :max="1" 
                    :step="0.1" 
                    :precision="1"
                    @change="emitUpdate"
                    placeholder="0-1"
                />
                <div class="option-description">标签放置质量阈值（0-1，数值越高质量要求越严格）</div>
            </el-form-item>
        </template>

        <!-- 删除按钮 -->
        <el-form-item>
            <el-button type="danger" size="small" @click="$emit('delete')">
                <el-icon>
                    <Delete />
                </el-icon>
                删除符号化器
            </el-button>
        </el-form-item>
    </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useSldStore } from '../stores/sldStore.js'

const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
})

// 使用Pinia store
const sldStore = useSldStore()

const emit = defineEmits(['update:modelValue', 'delete', 'update'])

const localSymbolizer = reactive({ 
    ...props.modelValue,
    vendorOptions: props.modelValue.vendorOptions || {
        labelObstacle: false,
        spaceAround: null,
        maxDisplacement: null,
        minGroupDistance: null,
        repeat: null,
        autoWrap: null,
        forceLeftToRight: false,
        conflictResolution: true,
        followLine: false,
        maxAngleDelta: null,
        goodnessOfFit: null
    },
    halo: props.modelValue.halo || {
        enabled: false,
        radius: 1,
        fill: { color: '#ffffff', opacity: 1 }
    },
    labelPlacement: props.modelValue.labelPlacement || {
        type: 'point',
        point: {
            anchorPointX: 0.5,
            anchorPointY: 0.5,
            displacementX: 0,
            displacementY: 0,
            rotation: 0
        },
        line: {
            perpendicularOffset: 0,
            isAligned: true,
            repeat: 0,
            initialGap: 0
        }
    }
})

// 类型改变时重置配置
const onTypeChange = (type) => {
    const baseConfig = { type }

    switch (type) {
        case 'polygon':
            Object.assign(localSymbolizer, {
                ...baseConfig,
                fill: { color: '#ff0000', opacity: 0.7 },
                stroke: { color: '#000000', width: 1, opacity: 1 }
            })
            break
        case 'line':
            Object.assign(localSymbolizer, {
                ...baseConfig,
                stroke: { color: '#000000', width: 2, opacity: 1, dashArray: null }
            })
            break
        case 'point':
            Object.assign(localSymbolizer, {
                ...baseConfig,
                mark: {
                    wellKnownName: 'circle',
                    size: 6,
                    fill: { color: '#ff0000' },
                    stroke: { color: '#000000', width: 1 }
                }
            })
            break
        case 'text':
            Object.assign(localSymbolizer, {
                ...baseConfig,
                label: { propertyName: '' },
                font: {
                    family: 'Arial, sans-serif',
                    size: 12,
                    fill: { color: '#000000' }
                },
                labelPlacement: {
                    type: 'point',
                    point: {
                        anchorPointX: 0.5,
                        anchorPointY: 0.5,
                        displacementX: 0,
                        displacementY: 0,
                        rotation: 0
                    },
                    line: {
                        perpendicularOffset: 0,
                        isAligned: true,
                        repeat: 0,
                        initialGap: 0
                    }
                },
                halo: {
                    enabled: false,
                    radius: 1,
                    fill: { color: '#ffffff', opacity: 1 }
                },
                vendorOptions: {
                    labelObstacle: false,
                    spaceAround: null,
                    maxDisplacement: null,
                    minGroupDistance: null,
                    repeat: null,
                    autoWrap: null,
                    forceLeftToRight: false,
                    conflictResolution: true,
                    followLine: false,
                    maxAngleDelta: null,
                    goodnessOfFit: null
                }
            })
            break
    }

    emitUpdate()
}



// 发出更新事件
const emitUpdate = () => {
    emit('update:modelValue', localSymbolizer)
    emit('update')
}

// 监听本地符号化器变化
watch(localSymbolizer, () => {
    emitUpdate()
}, { deep: true })

// 监听外部符号化器变化
watch(() => props.modelValue, (newSymbolizer) => {
    Object.assign(localSymbolizer, newSymbolizer)
}, { deep: true })
</script>

<style scoped>
.symbolizer-config {
    border: none;
    border-radius: 6px;
    padding: 0;
    background: transparent;
}

.color-picker-wrapper {}

/* 
.color-picker-wrapper:hover {
    border-color: #409eff;
    background: #ecf5ff;
} */

.color-picker-wrapper span {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    color: #606266;
    background: white;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #dcdfe6;
    min-width: 60px;
    width: auto;
    text-align: center;
}

/* 表单项间距优化 */
.symbolizer-config .el-form-item {
    margin-top: 16px;
    margin-bottom: 16px;
}

/* 表单标签样式优化 */
.el-form-item__label {
    font-weight: 500;
    color: #303133;
}

/* 选择器样式优化 */
.el-select {
    width: 100%;
}

/* 滑块样式优化 */
.el-slider {
    margin: 8px 0;
}

/* 输入框样式优化 */
.el-input-number {
    width: 100%;
}

/* VendorOption 样式 */
.vendor-options-container {
    width: 100%;
}

.vendor-option-item {
    margin-bottom: 8px;
    padding: 12px;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    background: #fafafa;
    transition: all 0.3s ease;
}

.vendor-option-item:hover {
    border-color: #409eff;
    background: #f0f9ff;
}

/* 按钮样式优化 */

/* 选项描述样式 */
.option-description {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.4;
}

/* 字段提示样式 */
.field-hint {
    font-size: 12px;
    color: #e6a23c;
    margin-top: 4px;
    padding: 4px 8px;
    background: #fdf6ec;
    border: 1px solid #f5dab1;
    border-radius: 4px;
    text-align: center;
}

</style>