// ==========================================================================
// 工具箱 - 核心工具数据
// 所有工具的元数据、分类、功能实现
// ==========================================================================

const TOOLS_DATA = [
  // 生活查询 (6个)
  { id: 'date-calculator', name: '日期天数计算器', category: 'life', description: '计算两个日期之间的天数差，支持工作日/自然日切换', tags: ['日期', '天数', '工作日'], popular: true },
  { id: 'lunar-converter', name: '农历公历转换', category: 'life', description: '公历农历互转，支持1900-2100年，显示节气、生肖、星座', tags: ['农历', '公历', '节气', '生肖'], popular: true },
  { id: 'age-calculator', name: '年龄计算器', category: 'life', description: '精确计算周岁、虚岁、下次生日倒计时、生肖星座', tags: ['年龄', '生日', '倒计时', '生肖'], popular: true },
  { id: 'timezone-converter', name: '时区时差换算', category: 'life', description: '全球主要城市时区对照，夏令时自动处理，会议时间跨时区安排', tags: ['时区', '世界时间', '会议'], popular: true },
  { id: 'holiday-query', name: '节假日查询', category: 'life', description: '中国法定节假日安排、调休补班日历、假期倒计时', tags: ['节假日', '放假', '调休', '倒计时'], popular: false },
  { id: 'zodiac-query', name: '星座查询', category: 'life', description: '输入出生日期查询星座、守护星、性格特点、配对指数', tags: ['星座', '运势', '配对', '性格'], popular: false },

  // 文本工具 (6个)
  { id: 'word-counter', name: '字数统计', category: 'text', description: '实时统计字符数、字数、行数、段落数、中英文字数、阅读时长', tags: ['字数', '字符', '阅读时长'], popular: true },
  { id: 'case-converter', name: '大小写转换', category: 'text', description: '全大写、全小写、首字母大写、驼峰命名、帕斯卡命名、下划线命名', tags: ['大小写', '驼峰', '命名规范'], popular: true },
  { id: 'whitespace-remover', name: '文本去空格', category: 'text', description: '去除首尾空白、所有空格、换行符、制表符、多余空白、零宽字符', tags: ['去空格', '清理', '格式化'], popular: false },
  { id: 'json-formatter', name: 'JSON格式化', category: 'text', description: 'JSON格式化/压缩/验证，语法高亮，错误定位，支持大文件', tags: ['JSON', '格式化', '验证', '压缩'], popular: true },
  { id: 'encode-decoder', name: '编码解码', category: 'text', description: 'URL编码/解码、Base64编码/解码、HTML实体编码/解码、Unicode转义', tags: ['URL', 'Base64', 'HTML', 'Unicode'], popular: true },
  { id: 'md5-hash', name: 'MD5/哈希', category: 'text', description: 'MD5、SHA-1、SHA-256、SHA-512哈希生成，支持批量处理、HMAC', tags: ['MD5', 'SHA', '哈希', '加密'], popular: false },

  // 数字计算 (4个)
  { id: 'percentage-calculator', name: '百分比计算器', category: 'math', description: '基础百分比、增长率、折扣价、税费、比例分配计算', tags: ['百分比', '增长率', '折扣', '税费'], popular: true },
  { id: 'unit-converter', name: '单位换算', category: 'math', description: '长度、重量、面积、体积、温度、压力、功率、速度、时间、数据存储', tags: ['单位', '换算', '长度', '重量', '温度'], popular: true },
  { id: 'mortgage-calculator', name: '房贷计算器', category: 'math', description: '等额本息/等额本金，支持公积金组合贷、提前还款、利率调整', tags: ['房贷', '贷款', '等额本息', '公积金'], popular: true },
  { id: 'currency-converter', name: '汇率换算', category: 'math', description: '主要货币实时汇率模拟换算，历史汇率查询', tags: ['汇率', '货币', '换算'], popular: false },

  // 开发工具 (7个)
  { id: 'timestamp-converter', name: '时间戳转换', category: 'dev', description: '毫秒/秒级时间戳与日期时间互转，批量转换，时区支持', tags: ['时间戳', 'Unix', '日期转换'], popular: true },
  { id: 'color-picker', name: '颜色取色器', category: 'dev', description: '色盘选择、HEX/RGB/HSL/HSV颜色值互转、颜色方案生成', tags: ['颜色', '取色', 'HEX', 'RGB', 'HSL'], popular: true },
  { id: 'qrcode-generator', name: '二维码生成', category: 'dev', description: '文本/链接/联系人/WiFi生成二维码，支持Logo、颜色、纠错级别', tags: ['二维码', 'QR码', '生成器'], popular: true },
  { id: 'random-password', name: '随机密码生成', category: 'dev', description: '可自定义长度、字符集、排除相似字符，批量生成，强度检测', tags: ['密码', '随机', '生成器', '安全'], popular: true },
  { id: 'regex-tester', name: '正则测试', category: 'dev', description: '正则表达式实时匹配、替换、分组提取、常用正则库、解释说明', tags: ['正则', '正则表达式', '匹配', '替换'], popular: false },
  { id: 'ip-lookup', name: 'IP本地查询', category: 'dev', description: '本机IP显示、IP地址归属地查询、私有IP段参考、CIDR计算', tags: ['IP', '归属地', 'CIDR', '网络'], popular: false },
  { id: 'user-agent-parser', name: 'User-Agent解析', category: 'dev', description: '解析UA字符串，提取浏览器、操作系统、设备、引擎版本信息', tags: ['User-Agent', 'UA', '解析', '浏览器'], popular: false },

  // 便民工具 (5个)
  { id: 'random-name', name: '随机名字生成', category: 'utility', description: '中文姓名、英文名、网名、昵称生成，支持姓氏、性别、长度自定义', tags: ['名字', '随机', '起名', '昵称'], popular: true },
  { id: 'random-phone', name: '随机手机号生成', category: 'utility', description: '中国大陆手机号生成，支持运营商、号段、批量导出', tags: ['手机号', '随机', '运营商'], popular: false },
  { id: 'image-size', name: '图片尺寸换算', category: 'utility', description: '像素/英寸/厘米互转，DPI/PPI设置，打印尺寸计算，常用尺寸预设', tags: ['图片', '尺寸', 'DPI', '打印'], popular: false },
  { id: 'id-card', name: '身份证号码查询', category: 'utility', description: '身份证号码校验、地区码查询、出生日期、性别提取', tags: ['身份证', '校验', '查询'], popular: false },
  { id: 'bank-card', name: '银行卡归属查询', category: 'utility', description: '银行卡号识别发卡行、卡类型、卡等级、BIN码查询', tags: ['银行卡', '归属', 'BIN码'], popular: false },
];

const CATEGORIES = [
  { id: 'life', name: '生活查询', icon: 'calendar', color: '#2563eb', count: 6 },
  { id: 'text', name: '文本工具', icon: 'file-text', color: '#0d9488', count: 6 },
  { id: 'math', name: '数字计算', icon: 'calculator', color: '#d97706', count: 4 },
  { id: 'dev', name: '开发工具', icon: 'code', color: '#7c3aed', count: 7 },
  { id: 'utility', name: '便民工具', icon: 'tool', color: '#16a34a', count: 5 },
];

// 暴露给全局
window.TOOLS_DATA = TOOLS_DATA;
window.CATEGORIES = CATEGORIES;

// 辅助函数
function getToolById(id) { return TOOLS_DATA.find(t => t.id === id); }
function getToolsByCategory(cat) { return TOOLS_DATA.filter(t => t.category === cat); }
function getCategoryById(id) { return CATEGORIES.find(c => c.id === id); }