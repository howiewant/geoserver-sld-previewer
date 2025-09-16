import { defineStore } from 'pinia'
import { ref, reactive, computed, nextTick } from 'vue'
import { generateSldXml } from '../utils/sldGenerator.js'

export const useSldStore = defineStore('sld', () => {
  // 默认配置
  const defaultSldConfig = {
    name: 'default_style',
    title: '默认样式',
    abstract: '',
    featureTypeStyle: {
      name: 'default',
      title: '默认要素类型样式',
      rules: [
        {
          name: 'rule1',
          title: '规则1',
          minScaleDenominator: null,
          maxScaleDenominator: null,
          filter: '',
          symbolizers: [
            {
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
          ]
        }
      ]
    }
  }

  const defaultGeoserverConfig = {
    wmsUrl: '',
    layerName: ''
  }

  // SLD配置状态 - 使用深拷贝避免引用问题
  const sldConfig = reactive(JSON.parse(JSON.stringify(defaultSldConfig)))

  // GeoServer配置状态 - 使用深拷贝避免引用问题
  const geoserverConfig = reactive(JSON.parse(JSON.stringify(defaultGeoserverConfig)))

  // 图层字段状态
  const layerFields = ref([])

  // 计算属性：生成的SLD XML
  const sldXml = computed(() => {
    return generateSldXml(sldConfig, geoserverConfig.layerName)
  })

  // Actions
  const updateSldConfig = (newConfig) => {
    Object.assign(sldConfig, newConfig)
  }

  const updateGeoserverConfig = (newConfig) => {
    Object.assign(geoserverConfig, newConfig)
  }

  const setLayerFields = (fields) => {
    layerFields.value = fields
  }

  const addRule = () => {
    const newRule = {
      name: `rule${sldConfig.featureTypeStyle.rules.length + 1}`,
      title: `规则${sldConfig.featureTypeStyle.rules.length + 1}`,
      minScaleDenominator: null,
      maxScaleDenominator: null,
      filter: '',
      symbolizers: [
        {
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
      ]
    }
    sldConfig.featureTypeStyle.rules.push(newRule)
  }

  const deleteRule = (index) => {
    sldConfig.featureTypeStyle.rules.splice(index, 1)
  }

  const addSymbolizer = (ruleIndex) => {
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
    sldConfig.featureTypeStyle.rules[ruleIndex].symbolizers.push(newSymbolizer)
  }

  const deleteSymbolizer = (ruleIndex, symbolizerIndex) => {
    sldConfig.featureTypeStyle.rules[ruleIndex].symbolizers.splice(symbolizerIndex, 1)
  }

  const resetSldConfig = () => {
    Object.assign(sldConfig, defaultSldConfig)
  }

  // 清除所有配置
  const clearAllConfig = () => {
    try {
      // 清除持久化存储
      localStorage.removeItem('geoserver-sld-store')
      
      // 使用更简单但有效的方法重置配置
      const newSldConfig = JSON.parse(JSON.stringify(defaultSldConfig))
      const newGeoserverConfig = JSON.parse(JSON.stringify(defaultGeoserverConfig))
      
      // 完全替换reactive对象的内容
      Object.keys(sldConfig).forEach(key => delete sldConfig[key])
      Object.assign(sldConfig, newSldConfig)
      
      Object.keys(geoserverConfig).forEach(key => delete geoserverConfig[key])
      Object.assign(geoserverConfig, newGeoserverConfig)
      
      // 重置图层字段
      layerFields.value = []
      
      // 强制触发响应式更新
      nextTick(() => {


      })
      
    } catch (error) {
      console.error('清除配置时出错:', error)
    }
  }

  return {
    // State
    sldConfig,
    geoserverConfig,
    layerFields,
    
    // Getters
    sldXml,
    
    // Actions
    updateSldConfig,
    updateGeoserverConfig,
    setLayerFields,
    addRule,
    deleteRule,
    addSymbolizer,
    deleteSymbolizer,
    resetSldConfig,
    clearAllConfig
  }
}, {
  // 持久化配置
  persist: {
    key: 'store',
    storage: localStorage,
    paths: ['sldConfig', 'geoserverConfig', 'layerFields'],
    beforeRestore: (context) => {

    },
    afterRestore: (context) => {

    }
  }
})