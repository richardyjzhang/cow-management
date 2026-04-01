export interface ThemePreset {
  id: string
  name: string
  primary: string
  primaryHover: string
  primaryPressed: string
  primarySuppl: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'pasture-green',
    name: '暖金',
    primary: '#DFC798',
    primaryHover: '#E8D4A8',
    primaryPressed: '#C4AE78',
    primarySuppl: '#C9B27A',
  },
  {
    id: 'sky-blue',
    name: '天空蓝',
    primary: '#0084ff',
    primaryHover: '#2593ff',
    primaryPressed: '#0066cc',
    primarySuppl: '#0066cc',
  },
  {
    id: 'deep-ocean',
    name: '深海蓝',
    primary: '#0e7490',
    primaryHover: '#06b6d4',
    primaryPressed: '#0c4a6e',
    primarySuppl: '#0c4a6e',
  },
  {
    id: 'mint-green',
    name: '薄荷绿',
    primary: '#10b981',
    primaryHover: '#34d399',
    primaryPressed: '#059669',
    primarySuppl: '#059669',
  },
  {
    id: 'coral-orange',
    name: '珊瑚橙',
    primary: '#f97316',
    primaryHover: '#fb923c',
    primaryPressed: '#ea580c',
    primarySuppl: '#ea580c',
  },
  {
    id: 'grape-purple',
    name: '葡萄紫',
    primary: '#7c3aed',
    primaryHover: '#8b5cf6',
    primaryPressed: '#6d28d9',
    primarySuppl: '#6d28d9',
  },
]
