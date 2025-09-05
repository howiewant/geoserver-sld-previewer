<script setup>
// 面样式表单组件
const props = defineProps({
  polygonStyles: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:polygonStyles']);

// 更新面样式
const updatePolygonStyle = (key, value) => {
  const updatedStyles = { ...props.polygonStyles };
  updatedStyles[key] = value;
  emit('update:polygonStyles', updatedStyles);
};
</script>

<template>
  <el-form label-position="right" label-width="auto">
    <el-form-item label="填充颜色">
      <el-color-picker 
        v-model="polygonStyles.fillColor"
        @change="(val) => updatePolygonStyle('fillColor', val)"
      ></el-color-picker>
    </el-form-item>
    
    <el-form-item label="填充透明度">
      <el-slider 
        v-model="polygonStyles.fillOpacity" 
        :min="0" 
        :max="1" 
        :step="0.1" 
        show-input
        @change="(val) => updatePolygonStyle('fillOpacity', val)"
      ></el-slider>
    </el-form-item>
    
    <el-form-item label="边框颜色">
      <el-color-picker 
        v-model="polygonStyles.strokeColor"
        @change="(val) => updatePolygonStyle('strokeColor', val)"
      ></el-color-picker>
    </el-form-item>
    
    <el-form-item label="边框宽度">
      <el-input-number 
        v-model="polygonStyles.strokeWidth" 
        :min="0" 
        :max="10"
        @change="(val) => updatePolygonStyle('strokeWidth', val)"
      ></el-input-number>
    </el-form-item>
  </el-form>
</template>

<style scoped>
/* 面样式表单特定样式 */
</style>