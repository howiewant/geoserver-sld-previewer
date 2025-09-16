/**
 * SLD XML生成器
 * 根据配置对象生成符合OGC SLD标准的XML
 */

/**
 * 生成完整的SLD XML
 * @param {Object} config SLD配置对象
 * @returns {string} SLD XML字符串
 */
export function generateSldXml(config, layerName = null) {
  const { name, title, abstract, featureTypeStyle } = config
  
  // 使用传入的图层名称作为NamedLayer的名称，这样才能正确预览
  const namedLayerName = layerName || name || 'default_style'
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0" 
    xmlns="http://www.opengis.net/sld" 
    xmlns:ogc="http://www.opengis.net/ogc" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>${escapeXml(namedLayerName)}</Name>
    <UserStyle>
      <Name>${escapeXml(name || 'default_style')}</Name>
      ${title ? `<Title>${escapeXml(title)}</Title>` : ''}
      ${abstract ? `<Abstract>${escapeXml(abstract)}</Abstract>` : ''}
      ${generateFeatureTypeStyle(featureTypeStyle)}
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>`
}

/**
 * 生成FeatureTypeStyle
 * @param {Object} featureTypeStyle 要素类型样式配置
 * @returns {string} FeatureTypeStyle XML
 */
function generateFeatureTypeStyle(featureTypeStyle) {
  const { name, rules } = featureTypeStyle
  
  return `<FeatureTypeStyle>
    ${name ? `<Name>${escapeXml(name)}</Name>` : ''}
    ${rules.map(rule => generateRule(rule)).join('\n    ')}
  </FeatureTypeStyle>`
}

/**
 * 生成Rule
 * @param {Object} rule 规则配置
 * @returns {string} Rule XML
 */
function generateRule(rule) {
  const { 
    name, 
    title, 
    filter, 
    minScaleDenominator, 
    maxScaleDenominator, 
    symbolizers
  } = rule
  
  return `<Rule>
      ${name ? `<Name>${escapeXml(name)}</Name>` : ''}
      ${title ? `<Title>${escapeXml(title)}</Title>` : ''}
      ${filter ? generateFilter(filter) : ''}
      ${minScaleDenominator ? `<MinScaleDenominator>${minScaleDenominator}</MinScaleDenominator>` : ''}
      ${maxScaleDenominator ? `<MaxScaleDenominator>${maxScaleDenominator}</MaxScaleDenominator>` : ''}
      ${symbolizers.map(symbolizer => generateSymbolizer(symbolizer)).join('\n      ')}
    </Rule>`
}

/**
 * 生成Filter
 * @param {string} filterExpression 过滤表达式
 * @returns {string} Filter XML
 */
function generateFilter(filterExpression) {
  if (!filterExpression.trim()) return ''
  
  // 解析CQL表达式并转换为OGC Filter
  const trimmed = filterExpression.trim()
  
  // 处理等于操作符
  if (trimmed.includes(' = ')) {
    const [property, value] = trimmed.split(' = ').map(s => s.trim())
    return `<ogc:Filter>
        <ogc:PropertyIsEqualTo>
          <ogc:PropertyName>${escapeXml(property)}</ogc:PropertyName>
          <ogc:Literal>${escapeXml(value)}</ogc:Literal>
        </ogc:PropertyIsEqualTo>
      </ogc:Filter>`
  }
  
  // 处理大于操作符
  if (trimmed.includes(' > ')) {
    const [property, value] = trimmed.split(' > ').map(s => s.trim())
    return `<ogc:Filter>
        <ogc:PropertyIsGreaterThan>
          <ogc:PropertyName>${escapeXml(property)}</ogc:PropertyName>
          <ogc:Literal>${escapeXml(value)}</ogc:Literal>
        </ogc:PropertyIsGreaterThan>
      </ogc:Filter>`
  }
  
  // 处理小于操作符
  if (trimmed.includes(' < ')) {
    const [property, value] = trimmed.split(' < ').map(s => s.trim())
    return `<ogc:Filter>
        <ogc:PropertyIsLessThan>
          <ogc:PropertyName>${escapeXml(property)}</ogc:PropertyName>
          <ogc:Literal>${escapeXml(value)}</ogc:Literal>
        </ogc:PropertyIsLessThan>
      </ogc:Filter>`
  }
  
  // 处理大于等于操作符
  if (trimmed.includes(' >= ')) {
    const [property, value] = trimmed.split(' >= ').map(s => s.trim())
    return `<ogc:Filter>
        <ogc:PropertyIsGreaterThanOrEqualTo>
          <ogc:PropertyName>${escapeXml(property)}</ogc:PropertyName>
          <ogc:Literal>${escapeXml(value)}</ogc:Literal>
        </ogc:PropertyIsGreaterThanOrEqualTo>
      </ogc:Filter>`
  }
  
  // 处理小于等于操作符
  if (trimmed.includes(' <= ')) {
    const [property, value] = trimmed.split(' <= ').map(s => s.trim())
    return `<ogc:Filter>
        <ogc:PropertyIsLessThanOrEqualTo>
          <ogc:PropertyName>${escapeXml(property)}</ogc:PropertyName>
          <ogc:Literal>${escapeXml(value)}</ogc:Literal>
        </ogc:PropertyIsLessThanOrEqualTo>
      </ogc:Filter>`
  }
  
  // 处理不等于操作符
  if (trimmed.includes(' != ') || trimmed.includes(' <> ')) {
    const separator = trimmed.includes(' != ') ? ' != ' : ' <> '
    const [property, value] = trimmed.split(separator).map(s => s.trim())
    return `<ogc:Filter>
        <ogc:PropertyIsNotEqualTo>
          <ogc:PropertyName>${escapeXml(property)}</ogc:PropertyName>
          <ogc:Literal>${escapeXml(value)}</ogc:Literal>
        </ogc:PropertyIsNotEqualTo>
      </ogc:Filter>`
  }
  
  // 处理LIKE操作符
  if (trimmed.toUpperCase().includes(' LIKE ')) {
    const parts = trimmed.split(/\s+LIKE\s+/i)
    if (parts.length === 2) {
      const property = parts[0].trim()
      const value = parts[1].trim().replace(/^['"]|['"]$/g, '') // 移除引号
      return `<ogc:Filter>
        <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="\\">
          <ogc:PropertyName>${escapeXml(property)}</ogc:PropertyName>
          <ogc:Literal>${escapeXml(value)}</ogc:Literal>
        </ogc:PropertyIsLike>
      </ogc:Filter>`
    }
  }
  
  // 如果无法解析，返回原始表达式作为注释
  return `<!-- 无法解析的过滤条件: ${escapeXml(filterExpression)} -->`
}

/**
 * 生成Symbolizer
 * @param {Object} symbolizer 符号化器配置
 * @returns {string} Symbolizer XML
 */
function generateSymbolizer(symbolizer) {
  switch (symbolizer.type) {
    case 'polygon':
      return generatePolygonSymbolizer(symbolizer)
    case 'line':
      return generateLineSymbolizer(symbolizer)
    case 'point':
      return generatePointSymbolizer(symbolizer)
    case 'text':
      return generateTextSymbolizer(symbolizer)
    default:
      throw new Error(`不支持的符号化器类型: ${symbolizer.type}`)
  }
}

/**
 * 生成多边形符号化器
 * @param {Object} symbolizer 多边形符号化器配置
 * @returns {string} PolygonSymbolizer XML
 */
function generatePolygonSymbolizer(symbolizer) {
  const { fill, stroke } = symbolizer
  
  return `<PolygonSymbolizer>
        ${fill ? generateFill(fill) : ''}
        ${stroke ? generateStroke(stroke) : ''}
      </PolygonSymbolizer>`
}

/**
 * 生成线符号化器
 * @param {Object} symbolizer 线符号化器配置
 * @returns {string} LineSymbolizer XML
 */
function generateLineSymbolizer(symbolizer) {
  const { stroke } = symbolizer
  
  return `<LineSymbolizer>
        ${stroke ? generateStroke(stroke) : ''}
      </LineSymbolizer>`
}

/**
 * 生成点符号化器
 * @param {Object} symbolizer 点符号化器配置
 * @returns {string} PointSymbolizer XML
 */
function generatePointSymbolizer(symbolizer) {
  const { mark } = symbolizer
  
  return `<PointSymbolizer>
        <Graphic>
          ${generateMark(mark)}
          ${mark.size ? `<Size>${mark.size}</Size>` : ''}
        </Graphic>
      </PointSymbolizer>`
}

/**
 * 生成文本符号化器
 * @param {Object} symbolizer 文本符号化器配置
 * @returns {string} TextSymbolizer XML
 */
function generateTextSymbolizer(symbolizer) {
  const { label, font, labelPlacement, halo, vendorOptions = {} } = symbolizer
  
  const vendorOptionsXml = generateVendorOptions(vendorOptions)
  
  return `<TextSymbolizer>
        ${label ? `<Label><ogc:PropertyName>${escapeXml(label.propertyName)}</ogc:PropertyName></Label>` : ''}
        ${font ? generateFont(font) : ''}
        ${labelPlacement ? generateLabelPlacement(labelPlacement) : ''}
        ${halo && halo.enabled ? generateHalo(halo) : ''}
${vendorOptionsXml ? vendorOptionsXml : ''}
      </TextSymbolizer>`
}

/**
 * 生成Fill
 * @param {Object} fill 填充配置
 * @returns {string} Fill XML
 */
function generateFill(fill) {
  const { color, opacity } = fill
  
  return `<Fill>
          ${color ? `<CssParameter name="fill">${color}</CssParameter>` : ''}
          ${opacity !== undefined ? `<CssParameter name="fill-opacity">${opacity}</CssParameter>` : ''}
        </Fill>`
}

/**
 * 生成Stroke
 * @param {Object} stroke 描边配置
 * @returns {string} Stroke XML
 */
function generateStroke(stroke) {
  const { color, width, opacity, dashArray } = stroke
  
  return `<Stroke>
          ${color ? `<CssParameter name="stroke">${color}</CssParameter>` : ''}
          ${width !== undefined ? `<CssParameter name="stroke-width">${width}</CssParameter>` : ''}
          ${opacity !== undefined ? `<CssParameter name="stroke-opacity">${opacity}</CssParameter>` : ''}
          ${dashArray ? `<CssParameter name="stroke-dasharray">${dashArray}</CssParameter>` : ''}
        </Stroke>`
}

/**
 * 生成Mark
 * @param {Object} mark 标记配置
 * @returns {string} Mark XML
 */
function generateMark(mark) {
  const { wellKnownName, fill, stroke } = mark
  
  return `<Mark>
            ${wellKnownName ? `<WellKnownName>${wellKnownName}</WellKnownName>` : ''}
            ${fill ? generateFill(fill) : ''}
            ${stroke ? generateStroke(stroke) : ''}
          </Mark>`
}

/**
 * 生成Font
 * @param {Object} font 字体配置
 * @returns {string} Font XML
 */
function generateFont(font) {
  const { family, size, fill } = font
  
  return `<Font>
          ${family ? `<CssParameter name="font-family">${escapeXml(family)}</CssParameter>` : ''}
          ${size ? `<CssParameter name="font-size">${size}</CssParameter>` : ''}
        </Font>
        ${fill ? generateFill(fill) : ''}`
}

/**
 * XML转义
 * @param {string} str 要转义的字符串
 * @returns {string} 转义后的字符串
 */
function escapeXml(str) {
  if (typeof str !== 'string') return str
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 解析SLD XML为配置对象
 * @param {string} sldXml SLD XML字符串
 * @returns {Object} SLD配置对象
 */
export function parseSldXml(sldXml) {
  // 这里可以实现SLD XML的解析逻辑
  // 将XML解析为配置对象，用于编辑现有的SLD
  throw new Error('SLD XML解析功能尚未实现')
}

/**
 * 验证SLD配置
 * @param {Object} config SLD配置对象
 * @returns {Array} 验证错误数组
 */
export function validateSldConfig(config) {
  const errors = []
  
  if (!config.name) {
    errors.push('样式名称不能为空')
  }
  
  if (!config.featureTypeStyle || !config.featureTypeStyle.rules || config.featureTypeStyle.rules.length === 0) {
    errors.push('至少需要一个样式规则')
  }
  
  config.featureTypeStyle?.rules?.forEach((rule, index) => {
    if (!rule.symbolizers || rule.symbolizers.length === 0) {
      errors.push(`规则 ${index + 1} 至少需要一个符号化器`)
    }
  })
  
  return errors
}

/**
 * 生成VendorOptions
 * @param {Object} vendorOptions VendorOptions配置对象
 * @returns {string} VendorOptions XML
 */
function generateVendorOptions(vendorOptions) {
  const options = []
  
  // 处理布尔值选项
  if (vendorOptions.labelObstacle === true) {
    options.push(`        <VendorOption name="labelObstacle">true</VendorOption>`)
  }
  if (vendorOptions.forceLeftToRight === true) {
    options.push(`        <VendorOption name="forceLeftToRight">true</VendorOption>`)
  }
  
  // conflictResolution 默认值是true，所以需要显式处理false的情况
  if (vendorOptions.conflictResolution === true) {
    options.push(`        <VendorOption name="conflictResolution">true</VendorOption>`)
  } else if (vendorOptions.conflictResolution === false) {
    options.push(`        <VendorOption name="conflictResolution">false</VendorOption>`)
  }
  
  if (vendorOptions.followLine === true) {
    options.push(`        <VendorOption name="followLine">true</VendorOption>`)
  }
  
  // 处理数值选项
  if (vendorOptions.spaceAround !== null && vendorOptions.spaceAround !== undefined) {
    options.push(`        <VendorOption name="spaceAround">${vendorOptions.spaceAround}</VendorOption>`)
  }
  if (vendorOptions.maxDisplacement !== null && vendorOptions.maxDisplacement !== undefined) {
    options.push(`        <VendorOption name="maxDisplacement">${vendorOptions.maxDisplacement}</VendorOption>`)
  }
  if (vendorOptions.minGroupDistance !== null && vendorOptions.minGroupDistance !== undefined) {
    options.push(`        <VendorOption name="minGroupDistance">${vendorOptions.minGroupDistance}</VendorOption>`)
  }
  if (vendorOptions.repeat !== null && vendorOptions.repeat !== undefined) {
    options.push(`        <VendorOption name="repeat">${vendorOptions.repeat}</VendorOption>`)
  }
  if (vendorOptions.autoWrap !== null && vendorOptions.autoWrap !== undefined) {
    options.push(`        <VendorOption name="autoWrap">${vendorOptions.autoWrap}</VendorOption>`)
  }
  if (vendorOptions.maxAngleDelta !== null && vendorOptions.maxAngleDelta !== undefined) {
    options.push(`        <VendorOption name="maxAngleDelta">${vendorOptions.maxAngleDelta}</VendorOption>`)
  }
  if (vendorOptions.goodnessOfFit !== null && vendorOptions.goodnessOfFit !== undefined) {
    options.push(`        <VendorOption name="goodnessOfFit">${vendorOptions.goodnessOfFit}</VendorOption>`)
  }
  
  return options.join('\n')
}

/**
 * 生成VendorOption（单个）
 * @param {Object} option VendorOption配置
 * @returns {string} VendorOption XML
 */
function generateVendorOption(option) {
  const { name, value } = option
  
  if (!name || !value) {
    return ''
  }
  
  return `<VendorOption name="${escapeXml(name)}">${escapeXml(value)}</VendorOption>`
}

/**
 * 生成Halo
 * @param {Object} halo Halo配置
 * @returns {string} Halo XML
 */
function generateHalo(halo) {
  const { radius, fill } = halo
  
  return `<Halo>
        ${radius ? `<Radius>${radius}</Radius>` : ''}
        ${fill ? generateFill(fill) : ''}
      </Halo>`
}

/**
 * 生成LabelPlacement
 * @param {Object} labelPlacement LabelPlacement配置
 * @returns {string} LabelPlacement XML
 */
function generateLabelPlacement(labelPlacement) {
  const { type, point, line } = labelPlacement
  
  if (type === 'point' && point) {
    return `<LabelPlacement>
        <PointPlacement>
          ${point.anchorPointX !== undefined || point.anchorPointY !== undefined ? 
            `<AnchorPoint>
              <AnchorPointX>${point.anchorPointX || 0}</AnchorPointX>
              <AnchorPointY>${point.anchorPointY || 0}</AnchorPointY>
            </AnchorPoint>` : ''}
          ${point.displacementX !== undefined || point.displacementY !== undefined ?
            `<Displacement>
              <DisplacementX>${point.displacementX || 0}</DisplacementX>
              <DisplacementY>${point.displacementY || 0}</DisplacementY>
            </Displacement>` : ''}
          ${point.rotation !== undefined ? `<Rotation>${point.rotation}</Rotation>` : ''}
        </PointPlacement>
      </LabelPlacement>`
  } else if (type === 'line' && line) {
    return `<LabelPlacement>
        <LinePlacement>
          ${line.perpendicularOffset !== undefined ? `<PerpendicularOffset>${line.perpendicularOffset}</PerpendicularOffset>` : ''}
          ${line.isAligned !== undefined ? `<IsAligned>${line.isAligned}</IsAligned>` : ''}
          ${line.repeat !== undefined && line.repeat > 0 ? `<Repeat>${line.repeat}</Repeat>` : ''}
          ${line.initialGap !== undefined && line.initialGap > 0 ? `<InitialGap>${line.initialGap}</InitialGap>` : ''}
        </LinePlacement>
      </LabelPlacement>`
  }
  
  return ''
}