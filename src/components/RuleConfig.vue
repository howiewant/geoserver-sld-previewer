<template>
    <div class="rule-config">
        <el-form :model="localRule" label-position="right" label-width="auto" size="small">
            <!-- 规则基本信息 -->
            <el-form-item label="规则名称">
                <el-input v-model="localRule.name" placeholder="输入规则名称" />
            </el-form-item>

            <el-form-item label="规则标题">
                <el-input v-model="localRule.title" placeholder="输入规则标题" />
            </el-form-item>

            <!-- 比例尺范围 -->
            <el-form-item label="最小比例尺">
                <el-input-number v-model="localRule.minScaleDenominator" :min="0" placeholder="最小比例尺"
                    style="width: 100%" />
            </el-form-item>

            <el-form-item label="最大比例尺">
                <el-input-number v-model="localRule.maxScaleDenominator" :min="0" placeholder="最大比例尺"
                    style="width: 100%" />
            </el-form-item>

            <!-- 过滤器 -->
            <el-form-item label="过滤条件">
                <el-input v-model="localRule.filter" placeholder="输入CQL过滤条件，如: POPULATION > 1000000" />
            </el-form-item>

            <!-- 符号化器 -->
            <el-form-item label="符号化器">
                <div class="symbolizers-container">
                    <div v-for="(symbolizer, index) in localRule.symbolizers" :key="index" class="symbolizer-item">
                        <SymbolizerConfig 
                            v-model="localRule.symbolizers[index]" 
                            @delete="deleteSymbolizer(index)"
                            @update="emitUpdate" 
                        />
                    </div>

                    <el-button type="primary" class="dashed-button" @click="addSymbolizer" style="width: 100%;">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        添加符号化器
                    </el-button>
                </div>
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item>
                <el-button type="danger" size="small" @click="$emit('delete')">
                    <el-icon>
                        <Delete />
                    </el-icon>
                    删除规则
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import SymbolizerConfig from './SymbolizerConfig.vue'
import { useSldStore } from '../stores/sldStore.js'

const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    },
    ruleIndex: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['update:modelValue', 'delete', 'update'])

// 使用Pinia store
const sldStore = useSldStore()

const localRule = reactive({ 
    ...props.modelValue
})

// 添加符号化器
const addSymbolizer = () => {
    const newSymbolizer = {
        type: 'polygon',
        fill: {
            color: '#ff0000',
            opacity: 0.7
        },
        stroke: {
            color: '#000000',
            width: 1,
            opacity: 1
        }
    }

    localRule.symbolizers.push(newSymbolizer)
    emitUpdate()
}

// 删除符号化器
const deleteSymbolizer = (index) => {
    localRule.symbolizers.splice(index, 1)
    emitUpdate()
}

// 发出更新事件
const emitUpdate = () => {
    emit('update:modelValue', localRule)
    emit('update')
}

// 监听本地规则变化
watch(localRule, () => {
    emitUpdate()
}, { deep: true })

// 监听外部规则变化
watch(() => props.modelValue, (newRule) => {
    Object.assign(localRule, newRule)
}, { deep: true })
</script>

<style scoped>
.rule-config {
    padding: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    margin-bottom: 20px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
}

.rule-config:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #409eff;
}

.symbolizers-container {
    width: 100%;
}

.symbolizer-item {
    margin-bottom: 16px;
    padding: 10px;
    border: 1px solid #e8f4fd;
    border-radius: 6px;
    background: linear-gradient(135deg, #f8fbff 0%, #f0f9ff 100%);
    position: relative;
    transition: all 0.3s ease;
}

.symbolizer-item:hover {
    border-color: #409eff;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(64, 158, 255, 0.1);
}

.symbolizer-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #409eff, #67c23a);
    border-radius: 0 3px 3px 0;
}

/* 表单项间距优化 */
.el-form-item {
    margin-bottom: 18px;
}

/* 按钮样式优化 */
.dashed-button {
    border-style: dashed !important;
    border-color: #409eff !important;
    color: #409eff !important;
    background: #ecf5ff !important;
    transition: all 0.3s ease;
}

.dashed-button:hover {
    background: #409eff !important;
    color: white !important;
    border-style: solid !important;
}

/* 删除按钮样式 */
.el-button--danger {
    background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
    border: none;
    box-shadow: 0 2px 4px rgba(245, 101, 101, 0.3);
}

.el-button--danger:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(245, 101, 101, 0.4);
}
</style>