<script setup>
import { ref, computed } from 'vue';
import PointStyleForm from './components/PointStyleForm.vue';

// 共享数据
const wmsUrl = ref('');
const layerName = ref('');
const geometryType = ref('point');
const sldConfig = ref('');

// 点线面样式配置
const pointStyles = ref({
  type: 'wellknown', // 'wellknown' 或 'external'
  shape: 'circle',
  shapeFill: '',
  url: '',
  size: 24,
  rotate: 0,
  wellknown: {
    shape: 'circle',
    color: '#ff0000',
    size: 8,
    opacity: 1
  },
  external: {
    url: '',
    size: 8,
    opacity: 1,
    rotation: 0
  }
});

const wellknownShapes = [
  { label: '圆形', value: 'circle' },
  { label: '方形', value: 'square' },
  { label: '三角形', value: 'triangle' },
  { label: '星形', value: 'star' },
  { label: '十字', value: 'cross' },
  { label: 'X形', value: 'x' }
];

const lineStyles = ref({
  color: '#0000ff',
  width: 2,
  opacity: 1,
  dashArray: ''
});

const polygonStyles = ref({
  fillColor: '#00ff00',
  fillOpacity: 0.5,
  strokeColor: '#000000',
  strokeWidth: 1
});

// 动态表单配置
const dynamicForm = computed(() => {
  switch (geometryType.value) {
    case 'point':
      return [
        {
          label: '点类型',
          type: 'radio',
          model: pointStyles.value.type,
          options: [
            { label: '预定义图形', value: 'wellknown' },
            { label: '外部图片', value: 'external' }
          ]
        },
        ...(pointStyles.value.type === 'wellknown' ? [
          {
            label: '图形形状',
            type: 'select',
            model: pointStyles.value.wellknown.shape,
            options: wellknownShapes
          },
          {
            label: '图形颜色',
            type: 'color',
            model: pointStyles.value.wellknown.color
          },
          {
            label: '图形大小',
            type: 'number',
            model: pointStyles.value.wellknown.size
          },
          {
            label: '透明度',
            type: 'range',
            model: pointStyles.value.wellknown.opacity,
            min: 0,
            max: 1,
            step: 0.1
          }
        ] : [
          {
            label: '图片URL',
            type: 'text',
            model: pointStyles.value.external.url,
            placeholder: '输入图片URL地址'
          },
          {
            label: '图片大小',
            type: 'number',
            model: pointStyles.value.external.size
          },
          {
            label: '透明度',
            type: 'range',
            model: pointStyles.value.external.opacity,
            min: 0,
            max: 1,
            step: 0.1
          },
          {
            label: '旋转角度',
            type: 'number',
            model: pointStyles.value.external.rotation,
            min: 0,
            max: 360
          }
        ])
      ];
    case 'line':
      return [
        { label: '颜色', type: 'color', model: lineStyles.value.color },
        { label: '宽度', type: 'number', model: lineStyles.value.width },
        { label: '透明度', type: 'range', model: lineStyles.value.opacity, min: 0, max: 1, step: 0.1 },
        { label: '虚线样式', type: 'text', model: lineStyles.value.dashArray, placeholder: '例如: 5,5' }
      ];
    case 'polygon':
      return [
        { label: '填充颜色', type: 'color', model: polygonStyles.value.fillColor },
        { label: '填充透明度', type: 'range', model: polygonStyles.value.fillOpacity, min: 0, max: 1, step: 0.1 },
        { label: '边框颜色', type: 'color', model: polygonStyles.value.strokeColor },
        { label: '边框宽度', type: 'number', model: polygonStyles.value.strokeWidth }
      ];
    default:
      return [];
  }
});

// 预览函数
const handlePreview = () => {
  // 根据几何类型生成SLD配置
  switch (geometryType.value) {
    case 'point':
      sldConfig.value = generatePointSLD();
      break;
    case 'line':
      sldConfig.value = generateLineSLD();
      break;
    case 'polygon':
      sldConfig.value = generatePolygonSLD();
      break;
  }
  console.log('预览配置:', { wmsUrl: wmsUrl.value, layer: layerName.value, sld: sldConfig.value });
};

// 重置函数
const handleReset = () => {
  wmsUrl.value = '';
  layerName.value = '';
  geometryType.value = 'point';
  sldConfig.value = '';
};

// SLD生成函数
const generatePointSLD = () => {
  return `<!-- 点样式SLD配置 -->`;
};

const generateLineSLD = () => {
  return `<!-- 线样式SLD配置 -->`;
};

const generatePolygonSLD = () => {
  return `<!-- 面样式SLD配置 -->`;
};
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>Geoserver SLD Previewer</el-header>
      <el-main>
        <div class="main-container">
          <!-- 表单配置区域 -->
          <div class="form-container">
            <h2>表单配置</h2>

            <el-form label-position="right" label-width="auto">
              <el-form-item label="WMS服务地址">
                <el-input v-model="wmsUrl" placeholder="例如: http://geoserver.example.com/wms"></el-input>
              </el-form-item>
              <el-form-item label="图层名称">
                <el-input v-model="layerName" placeholder="请输入图层名称"></el-input>
              </el-form-item>
              <el-form-item label="几何类型">
                <el-select v-model="geometryType" style="width: 100%">
                  <el-option label="点" value="point"></el-option>
                  <el-option label="线" value="line"></el-option>
                  <el-option label="面" value="polygon"></el-option>
                </el-select>
              </el-form-item>
              
              <!-- 使用点样式组件 -->
              <PointStyleForm 
                v-if="geometryType === 'point'" 
                v-model:pointStyles="pointStyles"
                :wellknownShapes="wellknownShapes"
              />
              
              <!-- 线样式表单 -->
              <template v-else-if="geometryType === 'line'">
                <el-form-item label="颜色">
                  <el-color-picker v-model="lineStyles.color"></el-color-picker>
                </el-form-item>
                <el-form-item label="宽度">
                  <el-input-number v-model="lineStyles.width" :min="1" :max="10"></el-input-number>
                </el-form-item>
                <el-form-item label="透明度">
                  <el-slider v-model="lineStyles.opacity" :min="0" :max="1" :step="0.1" show-input></el-slider>
                </el-form-item>
                <el-form-item label="虚线样式">
                  <el-input v-model="lineStyles.dashArray" placeholder="例如: 5,5"></el-input>
                </el-form-item>
              </template>
              
              <!-- 面样式表单 -->
              <template v-else-if="geometryType === 'polygon'">
                <el-form-item label="填充颜色">
                  <el-color-picker v-model="polygonStyles.fillColor"></el-color-picker>
                </el-form-item>
                <el-form-item label="填充透明度">
                  <el-slider v-model="polygonStyles.fillOpacity" :min="0" :max="1" :step="0.1" show-input></el-slider>
                </el-form-item>
                <el-form-item label="边框颜色">
                  <el-color-picker v-model="polygonStyles.strokeColor"></el-color-picker>
                </el-form-item>
                <el-form-item label="边框宽度">
                  <el-input-number v-model="polygonStyles.strokeWidth" :min="0" :max="10"></el-input-number>
                </el-form-item>
              </template>


              <el-form-item label="SLD配置">
                <el-input v-model="sldConfig" type="textarea" rows="10" placeholder="SLD配置将根据上方设置自动生成"
                  readonly></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handlePreview">生成SLD并预览</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 地图预览区域 -->
          <div class="map-container">
            <h2>地图预览</h2>
            <div class="map-preview">
              <!-- 这里将显示地图 -->
              <div v-if="!layerName" class="map-placeholder">请输入图层名称和SLD配置</div>
              <div v-else class="map-placeholder">正在加载地图: {{ layerName }}</div>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.el-header {
  font-size: 24px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-container {
  display: flex;
  height: 100%;
  gap: 20px;
}

.form-container {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.map-container {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.map-preview {
  flex: 1;
  background-color: #e6e6e6;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.map-placeholder {
  color: #666;
  font-size: 16px;
}
</style>
