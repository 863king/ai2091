// ==========================================================================
// 工具箱 - 核心工具实现
// 日期、文本、数字、开发、便民工具的核心逻辑
// ==========================================================================

(function() {
  'use strict';

  // ==========================================================================
  // 日期工具
  // ==========================================================================
  const DateUtils = {
    diffDays(date1, date2, workdaysOnly = false) {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (!workdaysOnly) return diffDays;
      
      let count = 0;
      const start = new Date(Math.min(d1, d2));
      const end = new Date(Math.max(d1, d2));
      const current = new Date(start);
      
      while (current <= end) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) count++;
        current.setDate(current.getDate() + 1);
      }
      return count;
    },

    format(date, fmt = 'YYYY-MM-DD') {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      
      return fmt
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    },

    parse(dateStr) {
      return new Date(dateStr);
    },

    getDayName(date, lang = 'zh') {
      const d = new Date(date);
      const days = lang === 'zh' 
        ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[d.getDay()];
    },

    isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },

    getDaysInMonth(year, month) {
      return new Date(year, month, 0).getDate();
    }
  };

  // ==========================================================================
  // 农历转换
  // ==========================================================================
  const LunarUtils = {
    lunarInfo: [
      0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
      0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
      0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
      0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
      0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
      0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
      0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
      0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
      0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
      0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
      0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
      0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
      0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
      0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
      0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0
    ],

    solarTerm: [
      '小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨',
      '立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑',
      '白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'
    ],

    solarToLunar(solarDate) {
      const date = new Date(solarDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      if (year < 1900 || year > 2100) {
        return { error: '仅支持 1900-2100 年' };
      }

      const baseDate = new Date(1900, 0, 31);
      const targetDate = new Date(year, month - 1, day);
      const offset = Math.floor((targetDate - baseDate) / 86400000);

      if (offset < 0) return { error: '日期超出范围' };

      let temp = 0;
      let i;
      for (i = 1900; i <= 2100 && offset >= 0; i++) {
        temp = this.lunarYearDays(i);
        if (offset < temp) break;
        offset -= temp;
      }

      const lunarYear = i;
      let leapMonth = this.leapMonth(lunarYear);
      let isLeap = false;

      for (i = 1; i <= 12; i++) {
        const days = leapMonth === i ? this.leapDays(lunarYear) : this.monthDays(lunarYear, i);
        if (offset < days) break;
        offset -= days;
        if (leapMonth === i) isLeap = false;
      }

      const lunarMonth = i;
      const lunarDay = offset + 1;

      return {
        year: lunarYear,
        month: lunarMonth,
        day: lunarDay,
        isLeap,
        leapMonth,
        zodiac: this.getZodiac(lunarYear),
        term: this.getSolarTerm(year, month, day)
      };
    },

    lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap = false) {
      if (lunarYear < 1900 || lunarYear > 2100) return null;

      let offset = 0;
      for (let y = 1900; y < lunarYear; y++) {
        offset += this.lunarYearDays(y);
      }

      const leap = this.leapMonth(lunarYear);
      for (let m = 1; m < lunarMonth; m++) {
        if (leap === m) offset += this.leapDays(lunarYear);
        offset += this.monthDays(lunarYear, m);
      }

      if (isLeap && leap === lunarMonth) {
        offset += this.leapDays(lunarYear);
      }

      offset += lunarDay - 1;

      const baseDate = new Date(1900, 0, 31);
      const targetDate = new Date(baseDate.getTime() + offset * 86400000);

      return {
        year: targetDate.getFullYear(),
        month: targetDate.getMonth() + 1,
        day: targetDate.getDate()
      };
    },

    lunarYearDays(year) {
      let sum = 348;
      for (let i = 0x8000; i > 0x8; i >>= 1) {
        if (this.lunarInfo[year - 1900] & i) sum += 1;
      }
      return sum + this.leapDays(year);
    },

    leapMonth(year) {
      return this.lunarInfo[year - 1900] & 0xf;
    },

    leapDays(year) {
      const leap = this.leapMonth(year);
      if (!leap) return 0;
      return (this.lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
    },

    monthDays(year, month) {
      return (this.lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
    },

    getZodiac(year) {
      const zodiacs = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
      return zodiacs[(year - 4) % 12];
    },

    getSolarTerm(year, month, day) {
      const terms = [
        {m:1,d:5,n:'小寒'},{m:1,d:20,n:'大寒'},
        {m:2,d:4,n:'立春'},{m:2,d:19,n:'雨水'},
        {m:3,d:6,n:'惊蛰'},{m:3,d:21,n:'春分'},
        {m:4,d:5,n:'清明'},{m:4,d:20,n:'谷雨'},
        {m:5,d:6,n:'立夏'},{m:5,d:21,n:'小满'},
        {m:6,d:6,n:'芒种'},{m:6,d:22,n:'夏至'},
        {m:7,d:7,n:'小暑'},{m:7,d:23,n:'大暑'},
        {m:8,d:8,n:'立秋'},{m:8,d:23,n:'处暑'},
        {m:9,d:8,n:'白露'},{m:9,d:23,n:'秋分'},
        {m:10,d:8,n:'寒露'},{m:10,d:24,n:'霜降'},
        {m:11,d:7,n:'立冬'},{m:11,d:22,n:'小雪'},
        {m:12,d:7,n:'大雪'},{m:12,d:22,n:'冬至'}
      ];
      const t = terms.find(t => t.m === month && t.d === day);
      return t ? t.n : '';
    }
  };

  // ==========================================================================
  // 年龄计算
  // ==========================================================================
  const AgeUtils = {
    calculate(birthDate, referenceDate = new Date()) {
      const birth = new Date(birthDate);
      const ref = new Date(referenceDate);
      
      if (birth > ref) return null;

      let age = ref.getFullYear() - birth.getFullYear();
      const monthDiff = ref.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
        age--;
      }

      const virtualAge = ref.getFullYear() - birth.getFullYear() + 1;

      const nextBirthday = new Date(ref.getFullYear(), birth.getMonth(), birth.getDate());
      if (nextBirthday < ref) {
        nextBirthday.setFullYear(ref.getFullYear() + 1);
      }
      const daysUntilBirthday = Math.ceil((nextBirthday - ref) / 86400000);

      const zodiacs = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
      const zodiac = zodiacs[(birth.getFullYear() - 4) % 12];

      const constellation = this.getConstellation(birth.getMonth() + 1, birth.getDate());

      return {
        age,
        virtualAge,
        nextBirthday: nextBirthday.toISOString().split('T')[0],
        daysUntilBirthday,
        zodiac,
        constellation,
        birthDate: birth.toISOString().split('T')[0]
      };
    },

    getConstellation(month, day) {
      const constellations = [
        {m:1,d:20,n:'水瓶座'},{m:2,d:19,n:'双鱼座'},{m:3,d:21,n:'白羊座'},
        {m:4,d:20,n:'金牛座'},{m:5,d:21,n:'双子座'},{m:6,d:22,n:'巨蟹座'},
        {m:7,d:23,n:'狮子座'},{m:8,d:23,n:'处女座'},{m:9,d:23,n:'天秤座'},
        {m:10,d:24,n:'天蝎座'},{m:11,d:23,n:'射手座'},{m:12,d:22,n:'摩羯座'}
      ];
      for (let i = constellations.length - 1; i >= 0; i--) {
        const c = constellations[i];
        if (month > c.m || (month === c.m && day >= c.d)) return c.n;
      }
      return '摩羯座';
    }
  };

  // ==========================================================================
  // 时区换算
  // ==========================================================================
  const TimezoneUtils = {
    timezones: [
      { id: 'UTC', name: 'UTC (协调世界时)', offset: 0 },
      { id: 'Asia/Shanghai', name: '北京时间 (CST)', offset: 8 },
      { id: 'Asia/Tokyo', name: '东京 (JST)', offset: 9 },
      { id: 'Asia/Seoul', name: '首尔 (KST)', offset: 9 },
      { id: 'Asia/Singapore', name: '新加坡 (SGT)', offset: 8 },
      { id: 'Asia/Dubai', name: '迪拜 (GST)', offset: 4 },
      { id: 'Europe/London', name: '伦敦 (GMT/BST)', offset: 0 },
      { id: 'Europe/Paris', name: '巴黎 (CET/CEST)', offset: 1 },
      { id: 'Europe/Berlin', name: '柏林 (CET/CEST)', offset: 1 },
      { id: 'America/New_York', name: '纽约 (EST/EDT)', offset: -5 },
      { id: 'America/Chicago', name: '芝加哥 (CST/CDT)', offset: -6 },
      { id: 'America/Denver', name: '丹佛 (MST/MDT)', offset: -7 },
      { id: 'America/Los_Angeles', name: '洛杉矶 (PST/PDT)', offset: -8 },
      { id: 'Pacific/Honolulu', name: '檀香山 (HST)', offset: -10 },
      { id: 'Pacific/Auckland', name: '奥克兰 (NZST/NZDT)', offset: 12 },
      { id: 'Australia/Sydney', name: '悉尼 (AEST/AEDT)', offset: 10 }
    ],

    convert(timeStr, fromTz, toTz) {
      const from = this.timezones.find(t => t.id === fromTz);
      const to = this.timezones.find(t => t.id === toTz);
      if (!from || !to) return null;

      const [datePart, timePart] = timeStr.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);

      const utcTime = Date.UTC(year, month - 1, day, hours, minutes);
      const targetTime = utcTime + (to.offset - from.offset) * 3600000;
      const targetDate = new Date(targetTime);

      return {
        from: `${from.name} ${DateUtils.format(new Date(utcTime + from.offset * 3600000), 'YYYY-MM-DD HH:mm')}`,
        to: `${to.name} ${DateUtils.format(targetDate, 'YYYY-MM-DD HH:mm')}`,
        diff: `${to.offset - from.offset > 0 ? '+' : ''}${to.offset - from.offset} 小时`
      };
    },

    getWorldClock() {
      const now = new Date();
      return this.timezones.map(tz => {
        const localTime = new Date(now.getTime() + tz.offset * 3600000);
        return {
          name: tz.name,
          time: DateUtils.format(localTime, 'HH:mm'),
          date: DateUtils.format(localTime, 'MM-DD')
        };
      });
    }
  };

  // ==========================================================================
  // 节假日
  // ==========================================================================
  const HolidayUtils = {
    holidays: {
      2024: [
        { name: '元旦', start: '2024-01-01', end: '2024-01-01', days: 1, work: [] },
        { name: '春节', start: '2024-02-10', end: '2024-02-17', days: 8, work: ['2024-02-04', '2024-02-18'] },
        { name: '清明节', start: '2024-04-04', end: '2024-04-06', days: 3, work: [] },
        { name: '劳动节', start: '2024-05-01', end: '2024-05-05', days: 5, work: ['2024-04-28', '2024-05-11'] },
        { name: '端午节', start: '2024-06-08', end: '2024-06-10', days: 3, work: [] },
        { name: '中秋节', start: '2024-09-15', end: '2024-09-17', days: 3, work: ['2024-09-14'] },
        { name: '国庆节', start: '2024-10-01', end: '2024-10-07', days: 7, work: ['2024-09-29', '2024-10-12'] }
      ],
      2025: [
        { name: '元旦', start: '2025-01-01', end: '2025-01-01', days: 1, work: [] },
        { name: '春节', start: '2025-01-28', end: '2025-02-04', days: 8, work: ['2025-01-26', '2025-02-08'] },
        { name: '清明节', start: '2025-04-04', end: '2025-04-06', days: 3, work: [] },
        { name: '劳动节', start: '2025-05-01', end: '2025-05-05', days: 5, work: ['2025-04-27', '2025-05-10'] },
        { name: '端午节', start: '2025-05-31', end: '2025-06-02', days: 3, work: [] },
        { name: '中秋节', start: '2025-10-06', end: '2025-10-08', days: 3, work: ['2025-10-05'] },
        { name: '国庆节', start: '2025-10-01', end: '2025-10-07', days: 7, work: ['2025-09-28', '2025-10-11'] }
      ]
    },

    getHolidays(year) {
      return this.holidays[year] || [];
    },

    getCountdowns(year) {
      const holidays = this.getHolidays(year);
      const today = new Date();
      today.setHours(0,0,0,0);
      return holidays.map(h => {
        const start = new Date(h.start);
        const diff = Math.ceil((start - today) / 86400000);
        return { ...h, daysLeft: diff, passed: diff < 0 };
      }).sort((a,b) => a.daysLeft - b.daysLeft);
    }
  };

  // ==========================================================================
  // 星座查询
  // ==========================================================================
  const ZodiacUtils = {
    constellations: {
      aries: { name: '白羊座', date: '3/21-4/19', element: '火象', ruler: '火星', trait: '热情、勇敢、冲动' },
      taurus: { name: '金牛座', date: '4/20-5/20', element: '土象', ruler: '金星', trait: '稳重、务实、固执' },
      gemini: { name: '双子座', date: '5/21-6/21', element: '风象', ruler: '水星', trait: '聪明、多变、善沟通' },
      cancer: { name: '巨蟹座', date: '6/22-7/22', element: '水象', ruler: '月亮', trait: '敏感、顾家、多愁善感' },
      leo: { name: '狮子座', date: '7/23-8/22', element: '火象', ruler: '太阳', trait: '自信、大方、爱表现' },
      virgo: { name: '处女座', date: '8/23-9/22', element: '土象', ruler: '水星', trait: '完美、挑剔、细心' },
      libra: { name: '天秤座', date: '9/23-10/23', element: '风象', ruler: '金星', trait: '优雅、犹豫、求和谐' },
      scorpio: { name: '天蝎座', date: '10/24-11/22', element: '水象', ruler: '冥王星', trait: '神秘、专一、报复心强' },
      sagittarius: { name: '射手座', date: '11/23-12/21', element: '火象', ruler: '木星', trait: '乐观、自由、直率' },
      capricorn: { name: '摩羯座', date: '12/22-1/19', element: '土象', ruler: '土星', trait: '务实、野心、保守' },
      aquarius: { name: '水瓶座', date: '1/20-2/18', element: '风象', ruler: '天王星', trait: '创新、独立、理智' },
      pisces: { name: '双鱼座', date: '2/19-3/20', element: '水象', ruler: '海王星', trait: '浪漫、直觉、逃避现实' }
    },

    getConstellation(month, day) {
      const ranges = [
        {key:'capricorn',sm:12,sd:22,em:1,ed:19},
        {key:'aquarius',sm:1,sd:20,em:2,ed:18},
        {key:'pisces',sm:2,sd:19,em:3,ed:20},
        {key:'aries',sm:3,sd:21,em:4,ed:19},
        {key:'taurus',sm:4,sd:20,em:5,ed:20},
        {key:'gemini',sm:5,sd:21,em:6,ed:21},
        {key:'cancer',sm:6,sd:22,em:7,ed:22},
        {key:'leo',sm:7,sd:23,em:8,ed:22},
        {key:'virgo',sm:8,sd:23,em:9,ed:22},
        {key:'libra',sm:9,sd:23,em:10,ed:23},
        {key:'scorpio',sm:10,sd:24,em:11,ed:22},
        {key:'sagittarius',sm:11,sd:23,em:12,ed:21}
      ];
      for (const r of ranges) {
        if ((month === r.sm && day >= r.sd) || (month === r.em && day <= r.ed)) {
          return this.constellations[r.key];
        }
      }
      return this.constellations.capricorn;
    },

    getCompatibility(sign1, sign2) {
      const elements = {
        aries:'火',leo:'火',sagittarius:'火',
        taurus:'土',virgo:'土',capricorn:'土',
        gemini:'风',libra:'风',aquarius:'风',
        cancer:'水',scorpio:'水',pisces:'水'
      };
      const e1 = elements[sign1], e2 = elements[sign2];
      if (e1 === e2) return {score: 85, desc: '同元素，天然默契'};
      if ((e1==='火'&&e2==='风')||(e1==='风'&&e2==='火')) return {score: 80, desc: '火风相生，激情四溢'};
      if ((e1==='土'&&e2==='水')||(e1==='水'&&e2==='土')) return {score: 75, desc: '土水相融，互补性强'};
      return {score: 60, desc: '需要磨合，相互理解'};
    }
  };

  // ==========================================================================
  // 文本工具
  // ==========================================================================
  const TextUtils = {
    countWords(text) {
      const chars = text.length;
      const charsNoSpace = text.replace(/\s/g, '').length;
      const lines = text.split('\n').length;
      const paragraphs = text.split('\n\n').filter(p => p.trim()).length;
      
      const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      const english = (text.match(/[a-zA-Z]+/g) || []).join(' ').split(/\s+/).filter(w => w).length;
      const numbers = (text.match(/\d+/g) || []).length;
      const punctuation = (text.match(/[，。！？、；：""''（）【】《》]/g) || []).length;
      
      const words = chinese + english;
      const readTime = Math.ceil(words / 300);

      return {
        chars, charsNoSpace, lines, paragraphs,
        chinese, english, numbers, punctuation,
        words, readTime
      };
    },

    changeCase(text, type) {
      switch (type) {
        case 'lower': return text.toLowerCase();
        case 'upper': return text.toUpperCase();
        case 'capitalize': return text.replace(/\b\w/g, c => c.toUpperCase());
        case 'camel': return this.toCamelCase(text);
        case 'pascal': return this.toPascalCase(text);
        case 'snake': return this.toSnakeCase(text);
        case 'kebab': return this.toKebabCase(text);
        case 'const': return this.toConstCase(text);
        default: return text;
      }
    },

    toCamelCase(text) {
      return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
    },

    toPascalCase(text) {
      const camel = this.toCamelCase(text);
      return camel.charAt(0).toUpperCase() + camel.slice(1);
    },

    toSnakeCase(text) {
      return text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    },

    toKebabCase(text) {
      return text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    },

    toConstCase(text) {
      return text.toUpperCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    },

    removeWhitespace(text, options = {}) {
      let result = text;
      if (options.trim) result = result.trim();
      if (options.allSpace) result = result.replace(/\s+/g, '');
      if (options.newline) result = result.replace(/\n+/g, '');
      if (options.tab) result = result.replace(/\t+/g, '');
      if (options.multiSpace) result = result.replace(/\s{2,}/g, ' ');
      if (options.zeroWidth) result = result.replace(/[\u200b-\u200f\ufeff]/g, '');
      return result;
    },

    formatJson(json, indent = 2) {
      return JSON.stringify(JSON.parse(json), null, indent);
    },

    minifyJson(json) {
      return JSON.stringify(JSON.parse(json));
    },

    validateJson(json) {
      try {
        JSON.parse(json);
        return { valid: true, error: null };
      } catch (e) {
        return { valid: false, error: e.message };
      }
    },

    encodeUrl(text) { return encodeURIComponent(text); },
    decodeUrl(text) { return decodeURIComponent(text); },
    encodeBase64(text) { return btoa(unescape(encodeURIComponent(text))); },
    decodeBase64(text) { return decodeURIComponent(escape(atob(text))); },
    encodeHtml(text) { return text.replace(/[&<>"']/g, c => ({'&':'&','<':'<','>':'>','"':'"',"'":"'"}[c])); },
    decodeHtml(text) { return text.replace(/&|<|>|"|'/g, m => ({'&':'&','<':'<','>':'>','"':'"',"'":"'"}[m])); },
    encodeUnicode(text) { return text.replace(/[\u0080-\uffff]/g, c => '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)); },
    decodeUnicode(text) { return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, c) => String.fromCharCode(parseInt(c, 16))); }
  };

  // ==========================================================================
  // 哈希工具
  // ==========================================================================
  const HashUtils = {
    async hash(text, algorithm = 'SHA-256', format = 'hex', hmacKey = null) {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      let key = null;
      if (hmacKey) {
        key = await crypto.subtle.importKey(
          'raw', encoder.encode(hmacKey),
          { name: 'HMAC', hash: algorithm },
          false, ['sign']
        );
      }

      let hashBuffer;
      if (key) {
        hashBuffer = await crypto.subtle.sign('HMAC', key, data);
      } else {
        hashBuffer = await crypto.subtle.digest(algorithm, data);
      }

      const bytes = new Uint8Array(hashBuffer);
      if (format === 'base64') {
        return btoa(String.fromCharCode(...bytes));
      }
      return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    },

    md5(text) {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(8, '0');
    }
  };

  // ==========================================================================
  // 数字计算工具
  // ==========================================================================
  const MathUtils = {
    percentage(type, params) {
      switch (type) {
        case 'basic':
          return { result: (params.part / params.whole * 100).toFixed(2) + '%' };
        case 'increase':
          return { result: ((params.new - params.original) / params.original * 100).toFixed(2) + '%' };
        case 'discount':
          const discount = params.original * (1 - params.rate / 100);
          return { result: discount.toFixed(2), saved: (params.original - discount).toFixed(2) };
        case 'tax':
          if (params.mode === 'add') {
            const tax = params.amount * params.rate / 100;
            return { tax: tax.toFixed(2), total: (params.amount + tax).toFixed(2) };
          } else {
            const net = params.amount / (1 + params.rate / 100);
            const tax = params.amount - net;
            return { net: net.toFixed(2), tax: tax.toFixed(2) };
          }
        case 'proportion':
          const ratios = params.ratios.split(',').map(r => {
            const v = parseFloat(r.trim());
            return r.includes('%') ? v / 100 : v;
          });
          const sum = ratios.reduce((a,b) => a+b, 0);
          return ratios.map(r => (params.total * r / sum).toFixed(2));
        default: return { result: '未知类型' };
      }
    },

    units: {
      length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, yd: 0.9144, ft: 0.3048, in: 0.0254 },
      weight: { kg: 1, g: 0.001, mg: 0.000001, t: 1000, lb: 0.453592, oz: 0.0283495 },
      area: { m2: 1, km2: 1000000, ha: 10000, acre: 4046.86, ft2: 0.092903 },
      volume: { l: 1, ml: 0.001, m3: 1000, gal: 3.78541, qt: 0.946353, pt: 0.473176 }
    },

    convertUnit(value, from, to, category) {
      const units = this.units[category];
      if (!units || !units[from] || !units[to]) return null;
      const baseValue = value * units[from];
      return baseValue / units[to];
    },

    mortgage(total, rate, years, method) {
      const monthlyRate = rate / 100 / 12;
      const months = years * 12;
      
      if (method === 'equal') {
        const monthly = total * 10000 * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalPay = monthly * months;
        const totalInterest = totalPay - total * 10000;
        return { monthly: monthly.toFixed(2), totalPay: totalPay.toFixed(2), totalInterest: totalInterest.toFixed(2) };
      } else {
        const principal = total * 10000 / months;
        let totalInterest = 0;
        for (let i = 1; i <= months; i++) {
          totalInterest += (total * 10000 - principal * (i - 1)) * monthlyRate;
        }
        const totalPay = total * 10000 + totalInterest;
        const firstMonth = principal + total * 10000 * monthlyRate;
        const lastMonth = principal * (1 + monthlyRate);
        return { 
          principal: principal.toFixed(2), 
          firstMonth: firstMonth.toFixed(2), 
          lastMonth: lastMonth.toFixed(2),
          totalPay: totalPay.toFixed(2), 
          totalInterest: totalInterest.toFixed(2) 
        };
      }
    },

    convertCurrency(amount, from, to, rates) {
      if (!rates[from] || !rates[to]) return null;
      const cnyAmount = amount / rates[from];
      return cnyAmount * rates[to];
    }
  };

  // ==========================================================================
  // 开发工具
  // ==========================================================================
  const DevUtils = {
    timestampToDate(ts, unit = 'ms', timezone = 'local') {
      const ms = unit === 's' ? ts * 1000 : ts;
      const date = new Date(ms);
      
      if (timezone === 'UTC') {
        return date.toISOString().replace('T', ' ').slice(0, 19);
      }
      
      return date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    },

    dateToTimestamp(dateStr, unit = 'ms') {
      const date = new Date(dateStr);
      const ms = date.getTime();
      return unit === 's' ? Math.floor(ms / 1000) : ms;
    },

    hexToRgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    },

    rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    },

    rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
      }
      return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
    },

    hslToRgb(h, s, l) {
      h /= 360; s /= 100; l /= 100;
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      if (s === 0) return { r: l*255, g: l*255, b: l*255 };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      return {
        r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
      };
    },

    generatePassword(length = 16, options = {}) {
      const { upper = true, lower = true, numbers = true, symbols = true, excludeSimilar = false } = options;
      let chars = '';
      if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (numbers) chars += '0123456789';
      if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      if (excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, '');
      
      let password = '';
      const array = new Uint32Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
      }
      return password;
    },

    testRegex(pattern, text, flags = 'g') {
      try {
        const regex = new RegExp(pattern, flags);
        const matches = [...text.matchAll(regex)];
        return matches.map(m => ({ match: m[0], index: m.index, groups: m.groups }));
      } catch (e) {
        return { error: e.message };
      }
    },

    getClientIp() {
      return '127.0.0.1';
    },

    ipToLong(ip) {
      return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    },

    longToIp(long) {
      return [(long >>> 24) & 255, (long >>> 16) & 255, (long >>> 8) & 255, long & 255].join('.');
    },

    cidrToRange(cidr) {
      const [ip, bits] = cidr.split('/');
      const mask = ~((1 << (32 - parseInt(bits))) - 1);
      const start = this.ipToLong(ip) & mask;
      const end = start + (1 << (32 - parseInt(bits))) - 1;
      return { start: this.longToIp(start), end: this.longToIp(end), count: 1 << (32 - parseInt(bits)) };
    }
  };

  // ==========================================================================
  // 便民工具
  // ==========================================================================
  const UtilityUtils = {
    chineseSurnames: ['张','王','李','赵','刘','陈','杨','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗'],
    chineseGivenNames: ['伟','芳','娜','秀英','敏','静','丽','强','磊','军','洋','勇','艳','杰','涛','明','超','秀兰','霞','平'],

    generateChineseName() {
      const surname = this.chineseSurnames[Math.floor(Math.random() * this.chineseSurnames.length)];
      const given = this.chineseGivenNames[Math.floor(Math.random() * this.chineseGivenNames.length)];
      const given2 = this.chineseGivenNames[Math.floor(Math.random() * this.chineseGivenNames.length)];
      return Math.random() > 0.5 ? surname + given : surname + given + given2;
    },

    generateEnglishName() {
      const first = ['James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles','Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen'];
      const last = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin'];
      return first[Math.floor(Math.random() * first.length)] + ' ' + last[Math.floor(Math.random() * last.length)];
    },

    generatePhone(carrier = 'random') {
      const carriers = {
        mobile: ['134','135','136','137','138','139','147','150','151','152','157','158','159','172','178','182','183','184','187','188','198'],
        unicom: ['130','131','132','145','155','156','166','171','175','176','185','186','166'],
        telecom: ['133','149','153','173','177','180','181','189','199']
      };
      const prefix = carrier === 'random' 
        ? [...carriers.mobile, ...carriers.unicom, ...carriers.telecom]
        : carriers[carrier];
      const selected = prefix[Math.floor(Math.random() * prefix.length)];
      const suffix = Math.floor(10000000 + Math.random() * 90000000);
      return selected + suffix;
    },

    calculatePrintSize(pxWidth, pxHeight, dpi = 300) {
      const inchWidth = pxWidth / dpi;
      const inchHeight = pxHeight / dpi;
      const cmWidth = inchWidth * 2.54;
      const cmHeight = inchHeight * 2.54;
      return { inchWidth: inchWidth.toFixed(2), inchHeight: inchHeight.toFixed(2), cmWidth: cmWidth.toFixed(2), cmHeight: cmHeight.toFixed(2) };
    },

    validateIdCard(id) {
      if (!/^\d{17}[\dXx]$/.test(id)) return { valid: false, error: '格式错误' };
      const weights = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
      const checkCodes = ['1','0','X','9','8','7','6','5','4','3','2'];
      let sum = 0;
      for (let i = 0; i < 17; i++) sum += parseInt(id[i]) * weights[i];
      const check = checkCodes[sum % 11];
      const valid = id[17].toUpperCase() === check;
      if (!valid) return { valid: false, error: '校验码错误' };
      
      const birth = id.slice(6, 14);
      const year = parseInt(birth.slice(0,4));
      const month = parseInt(birth.slice(4,6));
      const day = parseInt(birth.slice(6,8));
      const gender = parseInt(id[16]) % 2 === 1 ? '男' : '女';
      const regionCode = id.slice(0, 6);
      
      return { valid: true, birth: `${year}-${month}-${day}`, gender, regionCode, age: new Date().getFullYear() - year };
    },

    identifyBankCard(card) {
      const bins = {
        '6225': '中国农业银行', '6228': '中国工商银行', '6217': '中国建设银行',
        '6222': '中国工商银行', '6226': '中国建设银行', '6214': '中国工商银行',
        '6229': '中国银行', '6216': '中国银行', '6215': '交通银行',
        '6221': '招商银行', '6225': '招商银行', '6230': '招商银行',
        '6223': '平安银行', '6227': '平安银行', '6224': '中信银行',
        '6225': '光大银行', '6228': '华夏银行', '6229': '民生银行'
      };
      const prefix = card.slice(0, 4);
      return { bank: bins[prefix] || '未知银行', prefix };
    }
  };

  // 暴露给全局
  window.DateUtils = DateUtils;
  window.LunarUtils = LunarUtils;
  window.AgeUtils = AgeUtils;
  window.TimezoneUtils = TimezoneUtils;
  window.HolidayUtils = HolidayUtils;
  window.ZodiacUtils = ZodiacUtils;
  window.TextUtils = TextUtils;
  window.HashUtils = HashUtils;
  window.MathUtils = MathUtils;
  window.DevUtils = DevUtils;
  window.UtilityUtils = UtilityUtils;

  console.log('[Utils] 核心工具库加载完成');
})();