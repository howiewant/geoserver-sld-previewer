<template>
    <el-dialog
        v-model="dialogVisible"
        title="GeoServer 配置"
        width="600px"
        :before-close="handleClose"
    >
        <el-form :model="sldStore.geoserverConfig" label-position="top" size="default">
            <el-form-item label="WMS服务地址" required>
                <el-input 
                    v-model="sldStore.geoserverConfig.wmsUrl" 
                    placeholder="http://localhost:8080/geoserver/wms"
                />
            </el-form-item>

            <el-form-item label="图层选择">
                <div class="layer-selection">
                    <div class="layer-actions">
                        <el-button 
                            type="primary" 
                            @click="loadLayers" 
                            :loading="layersLoading"
                            size="default"
                            style="width: 100%;"
                        >
                            <el-icon><Refresh /></el-icon>
                            获取图层
                        </el-button>
                    </div>

                    <el-select 
                        v-model="selectedLayer" 
                        placeholder="选择图层"
                        filterable
                        clearable
                        style="width: 100%; margin-top: 12px;"
                    >
                        <el-option 
                            v-for="layer in availableLayers" 
                            :key="layer" 
                            :label="layer" 
                            :value="layer"
                        />
                    </el-select>
                </div>
            </el-form-item>

            <!-- 字段信息显示 -->
            <el-form-item v-if="layerFields.length > 0" label="图层字段">
                <div class="fields-container">
                    <el-tag 
                        v-for="field in layerFields" 
                        :key="field.name"
                        :type="getFieldTypeColor(field.type || 'string')"
                        size="small"
                        class="field-tag"
                    >
                        {{ field.name }} ({{ field.type || 'string' }})
                    </el-tag>
                </div>
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" @click="handleConfirm" :disabled="!selectedLayer">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useSldStore } from '../stores/sldStore.js'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'fields-loaded'])

// 使用Pinia store
const sldStore = useSldStore()

// 响应式数据
const dialogVisible = ref(props.modelValue)
const layersLoading = ref(false)
const fieldsLoading = ref(false)
const availableLayers = ref([])
const selectedLayer = ref('')
const layerFields = ref([])

// 监听对话框显示状态
watch(() => props.modelValue, (newVal) => {
    dialogVisible.value = newVal
    if (newVal) {
        // 对话框打开时，同步选中的图层
        selectedLayer.value = sldStore.geoserverConfig.layerName
    }
})

watch(dialogVisible, (newVal) => {
    emit('update:modelValue', newVal)
})

// 监听图层选择变化，自动加载字段
watch(selectedLayer, (newLayer) => {
    if (newLayer) {

        loadLayerFields()
    }
})

// 加载图层列表
const loadLayers = async () => {
    if (!sldStore.geoserverConfig.wmsUrl) {
        ElMessage.warning('请先填写WMS服务地址')
        return
    }

    layersLoading.value = true
    try {
        const url = `${sldStore.geoserverConfig.wmsUrl}?service=WMS&version=1.1.1&request=GetCapabilities`
        const response = await fetch(url)
        const xmlText = await response.text()
        
        // 解析XML获取图层列表
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
        
        // 查找所有Layer元素
        const layers = xmlDoc.querySelectorAll('Layer > Name')
        const layerNames = Array.from(layers).map(layer => layer.textContent).filter(Boolean)
        
        availableLayers.value = layerNames
        ElMessage.success(`成功加载 ${layerNames.length} 个图层`)
    } catch (error) {
        console.error('加载图层失败:', error)
        ElMessage.error('加载图层失败: ' + error.message)
    } finally {
        layersLoading.value = false
    }
}

// 加载图层字段
const loadLayerFields = async () => {
    if (!selectedLayer.value) {
        ElMessage.warning('请先选择图层')
        return
    }
    
    fieldsLoading.value = true
    try {
        const url = `${sldStore.geoserverConfig.wmsUrl}?service=WFS&version=1.0.0&request=DescribeFeatureType&typeName=${selectedLayer.value}`
        const response = await fetch(url)
        const xmlText = await response.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
        
        const elements = xmlDoc.querySelectorAll('xsd\\:element, element')
        const fields = Array.from(elements)
            .filter(el => el.getAttribute('name') && el.getAttribute('name') !== 'the_geom')
            .map(el => ({
                name: el.getAttribute('name'),
                type: el.getAttribute('type') || 'string'
            }))
        
        layerFields.value = fields
        emit('fields-loaded', fields)
        ElMessage.success(`成功加载 ${fields.length} 个字段`)
    } catch (error) {
        console.error('加载字段失败:', error)
        ElMessage.error('加载字段失败: ' + error.message)
    } finally {
        fieldsLoading.value = false
    }
}

// 获取字段类型颜色
const getFieldTypeColor = (type) => {
    // 确保 type 是字符串，避免 null/undefined 导致的错误
    if (!type || typeof type !== 'string') return 'info'
    
    if (type.includes('string') || type.includes('String')) return 'primary'
    if (type.includes('int') || type.includes('long') || type.includes('double') || type.includes('float')) return 'success'
    if (type.includes('date') || type.includes('time')) return 'warning'
    if (type.includes('boolean')) return 'info'
    return 'info' // 返回默认的有效类型
}

// 处理确认
const handleConfirm = () => {
    if (!selectedLayer.value) {
        ElMessage.warning('请选择图层')
        return
    }

    // 直接更新store中的配置，插件会自动持久化
    sldStore.updateGeoserverConfig({
        ...sldStore.geoserverConfig,
        layerName: selectedLayer.value
    })
    
    ElMessage.success('GeoServer配置已保存并更新')
    handleClose()
}

// 处理关闭
const handleClose = () => {
    dialogVisible.value = false
}
</script>

<style scoped>
.layer-selection {
    width: 100%;
}

.layer-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.layer-actions .el-button {
    flex: 1;
}

.dialog-footer {
    text-align: right;
}

.fields-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 120px;
    overflow-y: auto;
    padding: 12px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
}

.field-tag {
    margin: 0;
    font-size: 12px;
}

/* 表单项间距 */
.el-form-item {
    margin-bottom: 20px;
}

/* 滚动条样式 */
.fields-container::-webkit-scrollbar {
    width: 4px;
}

.fields-container::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.fields-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
}

.fields-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>