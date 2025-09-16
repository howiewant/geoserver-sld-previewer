<template>
  <div id="app">
    <el-container>
      <!-- 头部 -->
      <el-header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <el-icon><MapLocation /></el-icon>
            SLD 可视化编辑器
          </h1>
          <div class="header-actions">
            <el-button type="primary" @click="showGeoserverDialog = true">
              <el-icon><Setting /></el-icon>
              GeoServer配置
            </el-button>
            <el-button type="warning" @click="clearAllConfig">
              <el-icon><Delete /></el-icon>
              清除配置
            </el-button>
            <el-button type="success" @click="exportSLD">
              <el-icon><Download /></el-icon>
              导出SLD
            </el-button>
            <el-button 
              type="info" 
              @click="openGithub"
              circle
              class="github-btn"
            >
              <img src="/github-mark-white.svg" alt="GitHub" class="github-icon">
            </el-button>
          </div>
        </div>
      </el-header>

      <!-- 主体内容 -->
      <el-container class="main-container">
        <!-- 左侧配置面板 -->
        <el-aside width="400px" class="config-panel">
          <div class="panel-header">
            <h3>样式配置</h3>
          </div>
          <div class="panel-content">
            <SldConfigPanel />
          </div>
        </el-aside>

        <!-- 右侧地图预览 -->
        <el-main class="map-container">
          <div class="map-header">
            <h3>地图预览</h3>
            <div class="map-info" v-if="sldStore.geoserverConfig.layerName">
              <el-tag type="info">{{ sldStore.geoserverConfig.layerName }}</el-tag>
            </div>
          </div>
          <MapPreview 
            :sld-xml="sldStore.sldXml" 
            :geoserver-config="sldStore.geoserverConfig"
            @map-ready="handleMapReady"
          />
        </el-main>
      </el-container>
    </el-container>

    <!-- GeoServer配置对话框 -->
    <GeoserverConfigDialog
      v-model="showGeoserverDialog"
      @fields-loaded="handleFieldsLoaded"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MapLocation, Setting, Delete, Download, Share } from '@element-plus/icons-vue'
import SldConfigPanel from './components/SldConfigPanel.vue'
import MapPreview from './components/MapPreview.vue'
import GeoserverConfigDialog from './components/GeoserverConfigDialog.vue'
import { useSldStore } from './stores/sldStore.js'

// 使用Pinia store
const sldStore = useSldStore()

// 响应式数据
const showGeoserverDialog = ref(false)

// 应用启动时的初始化
onMounted(() => {
  // 延迟检查配置，确保持久化插件已完成数据恢复
  nextTick(() => {
    setTimeout(() => {
      if (sldStore.geoserverConfig.layerName) {
        ElMessage.success('已恢复上次保存的配置')

      }
    }, 100)
  })
})

// 地图准备就绪
const handleMapReady = (map) => {

}

// 处理字段加载
const handleFieldsLoaded = (fields) => {
  sldStore.setLayerFields(fields)

  ElMessage.success(`已加载 ${fields.length} 个字段信息`)
}





// 清除所有配置
const clearAllConfig = () => {
  ElMessageBox.confirm(
    '确定要清除所有保存的配置吗？此操作不可恢复。',
    '清除配置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    sldStore.clearAllConfig()
    ElMessage.success('配置已清除')
  }).catch(() => {
    ElMessage.info('已取消清除操作')
  })
}

// 导出SLD
const exportSLD = () => {
  const sldContent = sldStore.sldXml
  const blob = new Blob([sldContent], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sldStore.sldConfig.name || 'style'}.sld`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('SLD文件已导出')
}

// 打开GitHub仓库
const openGithub = () => {
  window.open('https://github.com/howiewant/geoserver-sld-previewer', '_blank')
}
</script>

<style scoped>
#app {
  height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.app-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.main-container {
  height: calc(100vh - 60px);
  background: #f5f7fa;
}

.config-panel {
  background: white;
  border-right: 1px solid #e4e7ed;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.panel-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.map-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  background: white;
}

.map-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.map-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    padding: 10px;
  }
  
  .app-title {
    font-size: 20px;
  }
  
  .config-panel {
    width: 100% !important;
  }
  
  .main-container {
    flex-direction: column;
  }
}

.github-icon {
  width: 20px;
  height: 20px;
  filter: invert(1);
}
</style>