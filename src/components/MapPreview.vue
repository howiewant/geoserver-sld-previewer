<template>
  <div class="map-preview" v-loading="loading" element-loading-text="加载地图中...">
    <!-- 地图容器 -->
    <div class="map-section">
      <div ref="mapContainer" class="map-container"></div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-overlay">
        <el-alert
          :title="error"
          type="error"
          show-icon
          :closable="false"
        />
      </div>
    </div>
    
    <!-- XML 预览区域 -->
    <div class="xml-preview-section" v-if="props.sldXml && props.sldXml.trim()">
      <div class="xml-preview-header">
        <span class="xml-title">SLD XML 预览</span>
        <div class="xml-actions">
          <el-button 
            size="small" 
            type="info" 
            @click="toggleFormatted"
            :icon="isFormatted ? 'Document' : 'EditPen'"
          >
            {{ isFormatted ? '原始' : '格式化' }}
          </el-button>
          <el-button 
            size="small" 
            type="primary" 
            @click="copyXmlToClipboard"
            :icon="CopyDocument"
          >
            复制 XML
          </el-button>
        </div>
      </div>
      <div class="xml-preview-container">
        <pre class="xml-content">{{ formattedXml }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import ImageLayer from 'ol/layer/Image'
import XYZ from 'ol/source/XYZ'
import ImageWMS from 'ol/source/ImageWMS'
import { fromLonLat } from 'ol/proj'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import xmlFormatter from 'xml-formatter'
import 'ol/ol.css'

const props = defineProps({
  sldXml: {
    type: String,
    default: ''
  },
  geoserverConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['map-ready'])

const mapContainer = ref(null)
const map = ref(null)
const wmsLayer = ref(null)
const loading = ref(false)
const error = ref('')
const isFormatted = ref(true)

// 初始化地图
const initMap = () => {
  if (!mapContainer.value) return

  try {
    const tk = '9efe144857648780afd069b42769ebe7'
    // 创建底图图层 - 使用天地图（中国可用）
    const baseLayer = new TileLayer({
      source: new XYZ({
        url: `https://t{0-6}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`,
        projection: 'EPSG:3857'
      })
    })

    // 天地图注记
     const annLayer = new TileLayer({
      source: new XYZ({
        url: `https://t{0-6}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`,
        projection: 'EPSG:3857'
      })
    })

    // 创建地图
    map.value = new Map({
      target: mapContainer.value,
      layers: [baseLayer, annLayer],
      view: new View({
        center: fromLonLat([104, 35]), // 中国中心
        zoom: 4
      })
    })

    // 添加WMS图层
    addWmsLayer()

    emit('map-ready', map.value)
  } catch (err) {
    console.error('地图初始化失败:', err)
    error.value = '地图初始化失败: ' + err.message
  }
}

// 添加WMS图层
const addWmsLayer = () => {



  
  if (!map.value) {

    setTimeout(() => {
      if (map.value) {
        addWmsLayer()
      }
    }, 500)
    return
  }
  
  if (!props.geoserverConfig.wmsUrl) {

    return
  }
  
  if (!props.geoserverConfig.layerName) {

    return
  }

  try {
    // 移除现有WMS图层
    if (wmsLayer.value) {

      map.value.removeLayer(wmsLayer.value)
    }

    const layerName = props.geoserverConfig.layerName
    const wmsUrl = props.geoserverConfig.wmsUrl
    


    // 准备WMS参数
    const wmsParams = {
      'LAYERS': layerName,
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'VERSION': '1.1.1'
    }

    // 如果有SLD内容，添加SLD_BODY参数
    if (props.sldXml && props.sldXml.trim()) {
      wmsParams.SLD_BODY = props.sldXml

    }

    // 创建WMS图层
    wmsLayer.value = new ImageLayer({
      source: new ImageWMS({
        url: wmsUrl,
        params: wmsParams,
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
      })
    })

    map.value.addLayer(wmsLayer.value)

    error.value = ''
  } catch (err) {
    console.error('WMS图层添加失败:', err)
    error.value = 'WMS图层添加失败: ' + err.message
  }
}

// 更新SLD样式预览
const updateSldStyle = async () => {
  if (!props.sldXml || !wmsLayer.value) return

  try {
    // 验证SLD内容是否为有效的XML
    const trimmedSld = props.sldXml.trim()
    if (!trimmedSld || !trimmedSld.startsWith('<')) {
      throw new Error('SLD内容格式无效')
    }

    // 直接在WMS请求中使用SLD_BODY参数进行预览，不修改GeoServer中的样式
    const source = wmsLayer.value.getSource()
    const params = { ...source.getParams() }
    
    // 使用SLD_BODY参数直接传递SLD进行预览
    params.SLD_BODY = trimmedSld
    delete params.STYLES // 移除默认样式参数
    params.t = new Date().getTime() // 添加时间戳强制刷新
    
    // 更新参数
    source.updateParams(params)
    
  } catch (err) {
    console.error('SLD样式预览失败:', err)
    error.value = 'SLD样式预览失败: ' + err.message
  }
}

// 监听SLD变化
watch(() => props.sldXml, (newSld, oldSld) => {

  if (newSld && wmsLayer.value) {
    updateSldStyle()
  } else if (newSld && !wmsLayer.value) {
    // 如果有SLD但没有图层，重新添加图层

    addWmsLayer()
  }
})

// 监听GeoServer配置变化
watch(() => props.geoserverConfig, (newConfig, oldConfig) => {

  if (newConfig.wmsUrl && newConfig.layerName) {
    addWmsLayer()
  } else if ((!newConfig.wmsUrl || !newConfig.layerName) && wmsLayer.value) {
    // 如果配置被清空，移除WMS图层

    map.value?.removeLayer(wmsLayer.value)
    wmsLayer.value = null
  }
}, { deep: true, immediate: true })

// 监听SLD和配置的组合变化，确保刷新后正确应用SLD
watch([() => props.sldXml, () => props.geoserverConfig], ([sldXml, config]) => {

  
  // 如果有完整配置和SLD，但图层参数中没有SLD_BODY，则重新添加图层
  if (sldXml && config.wmsUrl && config.layerName && wmsLayer.value) {
    const currentParams = wmsLayer.value.getSource().getParams()
    if (!currentParams.SLD_BODY && sldXml.trim()) {

      addWmsLayer()
    }
  }
}, { deep: true })

// XML 格式化
const formattedXml = computed(() => {
  if (!props.sldXml) return ''
  
  // 如果不需要格式化，直接返回原始内容
  if (!isFormatted.value) {
    return props.sldXml
  }
  
  try {
    // 使用 xml-formatter 库进行专业格式化
    return xmlFormatter(props.sldXml, {
      indentation: '  ', // 2空格缩进
      collapseContent: true,
      lineSeparator: '\n'
    })
  } catch (error) {
    console.error('XML 格式化错误:', error)
    return props.sldXml
  }
})

// 切换格式化状态
const toggleFormatted = () => {
  isFormatted.value = !isFormatted.value
}

// 复制 XML 到剪贴板
const copyXmlToClipboard = async () => {
  try {
    // 复制当前显示的 XML 内容（格式化或原始）
    await navigator.clipboard.writeText(formattedXml.value)
    ElMessage.success('XML 已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = formattedXml.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('XML 已复制到剪贴板')
  }
}

// 组件挂载后初始化地图
onMounted(() => {
  nextTick(() => {
    initMap()
  })
})
</script>

<style scoped>
.map-preview {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.map-section {
  position: relative;
  flex: 1;
  min-height: 400px;
}

.map-container {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.error-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
}

.xml-preview-section {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.xml-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.xml-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.xml-actions {
  display: flex;
  gap: 8px;
}

.xml-preview-container {
  max-height: 300px;
  overflow-y: auto;
  background-color: #fafafa;
}

.xml-content {
  margin: 0;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #2c3e50;
  background-color: transparent;
  white-space: pre-wrap;
  word-break: break-all;
}

.xml-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.xml-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.xml-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.xml-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>