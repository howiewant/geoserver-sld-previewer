<script setup>
// defineProps 和 defineEmits 是编译器宏，不需要导入

const props = defineProps({
  pointStyles: {
    type: Object,
    required: true
  },
  wellknownShapes: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:pointStyles']);

// 更新点样式的方法
const updatePointStyles = (key, value) => {
  const updatedStyles = { ...props.pointStyles };
  updatedStyles[key] = value;
  emit('update:pointStyles', updatedStyles);
};
</script>

<template>
  <div class="point-style-form">
    <el-form label-position="right" label-width="auto">
      <el-form-item label="点样式">
        <el-radio-group v-model="pointStyles.type">
          <el-radio value="wellknown" label="预定义图形">预定义图形</el-radio>
          <el-radio value="external" label="外部图片">外部图片</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 预定义图形选项 -->
      <el-row :gutter="20" v-if="pointStyles.type === 'wellknown'">
        <el-col :span="12">
          <el-form-item label="图形">
            <el-select v-model="pointStyles.wellknown.shape" style="width: 100%">
              <el-option 
                v-for="shape in wellknownShapes" 
                :key="shape.value" 
                :label="shape.label"
                :value="shape.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="填充颜色">
            <el-color-picker v-model="pointStyles.wellknown.color" style="width: 100%"></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 外部图片选项 -->
      <el-form-item label="图片URL" v-if="pointStyles.type === 'external'">
        <el-input v-model="pointStyles.external.url" placeholder="请输入图片URL地址"></el-input>
      </el-form-item>

      <!-- 共用选项 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="大小">
            <el-input-number 
              :model-value="pointStyles.type === 'wellknown' ? pointStyles.wellknown.size : pointStyles.external.size"
              @update:model-value="val => pointStyles.type === 'wellknown' ? pointStyles.wellknown.size = val : pointStyles.external.size = val"
              :min="1" 
              :max="100">
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="透明度">
            <el-slider 
              :model-value="pointStyles.type === 'wellknown' ? pointStyles.wellknown.opacity : pointStyles.external.opacity"
              @update:model-value="val => pointStyles.type === 'wellknown' ? pointStyles.wellknown.opacity = val : pointStyles.external.opacity = val"
              :min="0" 
              :max="1" 
              :step="0.1" 
              show-input>
            </el-slider>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="旋转角度" v-if="pointStyles.type === 'external'">
        <el-input-number v-model="pointStyles.external.rotation" :min="-360" :max="360"></el-input-number>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.point-style-form {
  margin-bottom: 20px;
}
</style>