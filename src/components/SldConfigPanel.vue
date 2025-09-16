<template>
    <div class="sld-config-panel">
        <el-form :model="sldStore.sldConfig" label-position="top" size="small">
            <!-- 样式基本信息 -->
            <div class="config-section">
                <h4 class="section-title">基本信息</h4>
                
                <el-form-item label="样式名称">
                    <el-input v-model="sldStore.sldConfig.name" placeholder="输入样式名称" />
                </el-form-item>

                <el-form-item label="样式标题">
                    <el-input v-model="sldStore.sldConfig.title" placeholder="输入样式标题" />
                </el-form-item>

                <el-form-item label="样式描述">
                    <el-input 
                        v-model="sldStore.sldConfig.abstract" 
                        type="textarea" 
                        :rows="2" 
                        placeholder="输入样式描述" 
                    />
                </el-form-item>
            </div>

            <!-- 要素类型样式 -->
            <div class="config-section">
                <h4 class="section-title">要素类型样式</h4>
                
                <el-form-item label="样式名称">
                    <el-input v-model="sldStore.sldConfig.featureTypeStyle.name" placeholder="要素类型样式名称" />
                </el-form-item>

                <el-form-item label="样式标题">
                    <el-input v-model="sldStore.sldConfig.featureTypeStyle.title" placeholder="要素类型样式标题" />
                </el-form-item>
            </div>

            <!-- 规则配置 -->
            <div class="config-section">
                <div class="section-header">
                    <h4 class="section-title">样式规则</h4>
                    <el-button type="primary" size="small" @click="sldStore.addRule">
                        <el-icon><Plus /></el-icon>
                        添加规则
                    </el-button>
                </div>

                <div class="rules-container">
                    <div v-for="(rule, ruleIndex) in sldStore.sldConfig.featureTypeStyle.rules" :key="ruleIndex" class="rule-wrapper">
                        <RuleConfig 
                            v-model="sldStore.sldConfig.featureTypeStyle.rules[ruleIndex]"
                            :rule-index="ruleIndex"
                            @delete="sldStore.deleteRule(ruleIndex)"
                        />
                    </div>

                    <div v-if="sldStore.sldConfig.featureTypeStyle.rules.length === 0" class="empty-rules">
                        <el-empty description="暂无规则，点击上方按钮添加规则" :image-size="80" />
                    </div>
                </div>
            </div>
        </el-form>
    </div>
</template>

<script setup>
import RuleConfig from './RuleConfig.vue'
import { useSldStore } from '../stores/sldStore.js'

// 使用Pinia store
const sldStore = useSldStore()
</script>

<style scoped>
.sld-config-panel {
    height: 100%;
    overflow-y: auto;
    padding: 20px;
    background: #ffffff;
}

.config-section {
    margin-bottom: 32px;
    padding: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
}

.config-section:hover {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.section-title {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-title::before {
    content: '';
    width: 4px;
    height: 16px;
    background: linear-gradient(to bottom, #409eff, #67c23a);
    border-radius: 2px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-header .section-title {
    margin-bottom: 0;
}

.rules-container {
    width: 100%;
}

.rule-wrapper {
    margin-bottom: 20px;
}

.rule-wrapper:last-child {
    margin-bottom: 0;
}

.empty-rules {
    text-align: center;
    padding: 40px 20px;
    color: #909399;
    background: #fafafa;
    border: 2px dashed #e4e7ed;
    border-radius: 8px;
}

/* 表单项样式优化 */
.el-form-item {
    margin-bottom: 18px;
}

.el-form-item__label {
    font-weight: 500;
    color: #606266;
    padding-bottom: 8px;
}

/* 输入框样式优化 */
.el-input,
.el-textarea {
    transition: all 0.3s ease;
}

.el-input:hover,
.el-textarea:hover {
    border-color: #c0c4cc;
}

.el-input:focus-within,
.el-textarea:focus-within {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 按钮样式优化 */
.el-button--primary {
    background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
    border: none;
    box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
    transition: all 0.3s ease;
}

.el-button--primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(64, 158, 255, 0.4);
}

/* 滚动条样式 */
.sld-config-panel::-webkit-scrollbar {
    width: 6px;
}

.sld-config-panel::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.sld-config-panel::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.sld-config-panel::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .sld-config-panel {
        padding: 15px;
    }
    
    .config-section {
        padding: 15px;
        margin-bottom: 20px;
    }
    
    .section-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }
}
</style>