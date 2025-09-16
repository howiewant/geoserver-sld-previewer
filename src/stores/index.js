import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()

// 使用持久化插件
pinia.use(createPersistedState({
  storage: localStorage,
  key: id => `geoserver-sld-${id}`,
  auto: false, // 关闭自动持久化，使用手动配置
  serializer: {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  }
}))

export default pinia