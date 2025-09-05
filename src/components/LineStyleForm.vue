<script setup>
// 线样式表单组件
const props = defineProps({
  lineStyles: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:lineStyles']);

// 更新线样式
const updateLineStyle = (key, value) => {
  const updatedStyles = { ...props.lineStyles };
  updatedStyles[key] = value;
  emit('update:lineStyles', updatedStyles);
};
</script>

<template>
  <el-form label-position="right" label-width="auto">
    <el-form-item label="颜色">
      <el-color-picker 
        v-model="lineStyles.color" 
        @change="(val) => updateLineStyle('color', val)"
      ></el-color-picker>
    </el-form-item>
    
    <el-form-item label="宽度">
      <el-input-number 
        v-model="lineStyles.width" 
        :min="1" 
        :max="10"
        @change="(val) => updateLineStyle('width', val)"
      ></el-input-number>
    </el-form-item>
    
    <el-form-item label="透明度">
      <el-slider 
        v-model="lineStyles.opacity" 
        :min="0" 
        :max="1" 
        :step="0.1" 
        show-input
        @change="(val) => updateLineStyle('opacity', val)"
      ></el-slider>
    </el-form-item>
    
    <el-form-item label="虚线样式">
      <el-input 
        v-model="lineStyles.dashArray" 
        placeholder="例如: 5,5"
        @input="(val) => updateLineStyle('dashArray', val)"
      ></el-input>
    </el-form-item>
  </el-form>
</template>

<style scoped>
/* 线样式表单特定样式 */
</style>