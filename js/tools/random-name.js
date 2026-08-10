// ==========================================================================
// 工具箱 - 随机名字生成
// ==========================================================================

const CHINESE_SURNAMES = ['张','王','李','赵','刘','陈','杨','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗','梁','宋','郑','谢','韩','唐','冯','于','董','萧','程','曹','袁','邓','许','傅','沈','曾','彭','吕','苏','卢','蒋','蔡','贾','丁','魏','薛','叶','阎','余','潘','杜','戴','夏','钟','汪','田','任','姜','范','方','石','姚','谭','廖','邹','熊','金','陆','郝','孔','白','崔','康','毛','邱','秦','江','史','顾','侯','邵','孟','龙','万','段','雷','钱','汤','尹','黎','易','常','武','乔','贺','赖','龚','文'];
const CHINESE_MALE_GIVEN = ['伟','强','磊','军','洋','勇','杰','涛','明','超','鹏','辉','华','宇','宁','凡','诚','博','毅','峰','帆','航','泽','霖','轩','皓','睿','天','昊','子','浩','然','俊','杰','豪','刚','建','国','民','志','永','波','涛','海','山','石','林','森','淼','鑫','垚','焱','燚'];
const CHINESE_FEMALE_GIVEN = ['芳','娜','敏','静','丽','艳','秀','英','华','美','慧','颖','欣','怡','婷','琳','瑶','瑾','瑜','璇','玥','彤','茜','菲','语','嫣','雯','雪','冰','霜','露','霞','虹','霓','曦',' dawn','阳','春','夏','秋','冬','月','星','云','雨','露','霜','雪','冰','霏','霭','岚','岚'];
const CHINESE_NEUTRAL_GIVEN = ['伟','芳','娜','敏','强','静','丽','磊','军','洋','勇','杰','涛','明','超','秀英','秀兰','秀梅','秀华','秀云','秀梅','秀兰','秀英','伟','强','磊','军','洋','勇','杰','涛','明','超','鹏','辉','华','宇','宁','凡','诚','博','毅','峰','帆','航','泽','霖','轩','皓','睿','天','昊','子','浩','然','俊','杰','豪','刚','建','国','民','志','永','波','涛','海','山','石','林','森','淼','鑫','垚','焱','燚'];

const ENGLISH_FIRST_NAMES_MALE = ['James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles','Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua','Kenneth','Kevin','Brian','George','Edward','Ronald','Timothy','Jason','Jeffrey','Ryan','Jacob','Gary','Nicholas','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon','Benjamin','Samuel','Gregory','Frank','Alexander','Patrick','Raymond','Jack','Dennis','Jerry','Tyler','Aaron','Jose','Henry','Adam','Douglas','Nathan','Peter','Zachary','Kyle','Walter','Harold','Jeremy','Christian','Keith','Roger','Arthur','Lawrence','Terry','Sean','Gerald','Carl','Joe','Albert','Joe','Joe'];
const ENGLISH_FIRST_NAMES_FEMALE = ['Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Nancy','Lisa','Betty','Margaret','Sandra','Ashley','Kimberly','Emily','Donna','Michelle','Carol','Amanda','Melissa','Deborah','Stephanie','Rebecca','Laura','Sharon','Cynthia','Kathleen','Amy','Angela','Shirley','Anna','Brenda','Pamela','Emma','Nicole','Helen','Samantha','Katherine','Christine','Debra','Rachel','Carolyn','Janet','Maria','Catherine','Heather','Diane','Ruth','Julie','Joyce','Virginia','Olivia','Olivia','Olivia'];
const ENGLISH_LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell','Jenkins','Perry','Russell','Sullivan','Bell','Coleman','Butler','Henderson','Barnes','Gonzales','Fisher','Vasquez','Simmons','Romero','Jordan','Patterson','Alexander','Hamilton','Graham','Reynolds','Griffin','Wallace','Moreno','West','Cole','Hayes','Bryant','Herrera','Gibson','Ellis','Stevens','Murray','Ford','Marshall','Owens','Mcdonald','Harrison','Ruiz','Kennedy','Wells','Alvarez','Woods','Mendoza','Castillo','Olson','Webb','Washington','Tucker','Freeman','Burns','Henry','Vasquez','Snyder','Simpson','Crawford','Jimenez','Porter','Mason','Shaw','Gordon','Wagner','Hunter','Romero','Hicks','Dixon','Hunt','Palmer','Robertson','Black','Holman','Hudson','Collins','Ferguson','Garcia','Gonzalez','Gutierrez','Harper','Hart','Henderson','Hernandez','Hill','Howard','Hughes','Jackson','Jenkins','Johnson','Jones','Kelly','Kim','King','Lee','Lewis','Long','Lopez','Martin','Martinez','Miller','Moore','Morales','Morris','Murphy','Nelson','Nguyen','Ortiz','Parker','Patel','Perez','Peterson','Phillips','Powell','Price','Ramirez','Reed','Reyes','Richards','Richardson','Rivera','Roberts','Robinson','Rodriguez','Rogers','Ross','Ruiz','Russell','Sanchez','Sanders','Scott','Shaw','Simmons','Smith','Stewart','Taylor','Thomas','Thompson','Torres','Turner','Walker','Ward','Washington','Watson','White','Williams','Wilson','Wood','Wright','Young'];

const NICKNAME_STYLES = {
  cute: ['小可爱','软萌酱','甜心宝','萌萌哒','可爱多','糖果糖','奶茶妹','果冻君','棉花糖','小甜饼','布丁酱','果冻宝','软糖糖','棉花糖','甜甜圈','蛋挞酥','小奶猫','小奶狗','小熊猫','小兔子','小松鼠','小刺猬','小企鹅','小考拉','小袋鼠','小浣熊','小狐狸','小狼崽','小鹿','小羊羔','小马驹'],
  cool: ['暗夜刺客','孤独行者','冷夜魅影','破晓之刃','冰封王座','雷霆万钧','风暴使者','暗影猎手','幽灵骑士','死亡笔记','虚空行者','深渊凝视','黑暗降临','绝望深渊','禁忌之力','混沌之源','虚无缥缈','超越极限','巅峰对决','王者荣耀','至尊宝','大圣归来','齐天大圣','斗战胜佛','孙悟空','哪吒闹海','杨戬二郎','申公豹','姜子牙','姜太公','姜尚'],
  literary: ['听风说雨','观云卷云舒','半生浮华','一世安然','清风徐来','水波不兴','花开花落','云卷云舒','岁月静好','现世安稳','半盏清茶','一壶浊酒','青灯古卷','红尘客梦','断桥残雪','西湖断桥','白蛇传说','许仙白娘子','法海雷峰塔','青蛇小青','许仙断桥','白娘子水漫金山','法海不懂爱','许仙不懂爱','白娘子不懂爱','青蛇不懂爱','小青不懂爱','法海不懂爱','许仙不懂爱'],
  game: ['大神带我','菜鸟求带','躺赢选手','全服第一','段位之王','排位之神','五杀收割','超神之路','逆风翻盘','绝地求生','吃鸡大神','和平精英','王者荣耀','英雄联盟','Dota2','CSGO','守望先锋','APEX','瓦罗兰特','原神','崩坏3','崩坏星穹铁道','明日方舟','少女前线','碧蓝航线','公主连结','赛马娘','偶像大师','LoveLive','BanG Dream','プロセカ','Project SEKAI'],
  random: ['用户','玩家','游客','访客','路人','匿名','神秘人','未知','隐士','隐者','逍遥','自在','洒脱','潇洒','豁达','豁达','通透','看透','悟透','明白','懂得','知足','常乐','安然','安稳','安宁','安详','安好','安康','安乐','安然','安稳','安宁','安详','安好','安康','安乐']
};

function initRandomName() {
  const typeSelect = document.getElementById('name-type');
  const countInput = document.getElementById('name-count');
  const resultPanel = document.getElementById('name-result');
  const resultContent = document.getElementById('name-result-content');

  // 切换字段显示
  window.toggleNameFields = function() {
    const type = typeSelect.value;
    document.querySelectorAll('.name-field').forEach(f => f.style.display = 'none');
    const targetField = document.getElementById('name-' + type);
    if (targetField) targetField.style.display = 'block';
  };

  // 生成名字
  window.generateNames = function() {
    const type = typeSelect.value;
    const count = parseInt(countInput.value) || 10;
    
    let names = [];
    
    switch (type) {
      case 'chinese': {
        const gender = document.getElementById('name-gender').value;
        const surname = document.getElementById('name-surname').value.trim();
        
        for (let i = 0; i < count; i++) {
          const sn = surname || CHINESE_SURNAMES[Math.floor(Math.random() * CHINESE_SURNAMES.length)];
          let given = '';
          if (gender === 'male') {
            given = CHINESE_MALE_GIVEN[Math.floor(Math.random() * CHINESE_MALE_GIVEN.length)];
            if (Math.random() > 0.5) given += CHINESE_MALE_GIVEN[Math.floor(Math.random() * CHINESE_MALE_GIVEN.length)];
          } else if (gender === 'female') {
            given = CHINESE_FEMALE_GIVEN[Math.floor(Math.random() * CHINESE_FEMALE_GIVEN.length)];
            if (Math.random() > 0.5) given += CHINESE_FEMALE_GIVEN[Math.floor(Math.random() * CHINESE_FEMALE_GIVEN.length)];
          } else {
            const pool = [...CHINESE_MALE_GIVEN, ...CHINESE_FEMALE_GIVEN, ...CHINESE_NEUTRAL_GIVEN];
            given = pool[Math.floor(Math.random() * pool.length)];
            if (Math.random() > 0.5) given += pool[Math.floor(Math.random() * pool.length)];
          }
          names.push(sn + given);
        }
        break;
      }
      case 'english': {
        const gender = document.getElementById('ename-gender').value;
        for (let i = 0; i < count; i++) {
          let firstName;
          if (gender === 'male') {
            firstName = ENGLISH_FIRST_NAMES_MALE[Math.floor(Math.random() * ENGLISH_FIRST_NAMES_MALE.length)];
          } else if (gender === 'female') {
            firstName = ENGLISH_FIRST_NAMES_FEMALE[Math.floor(Math.random() * ENGLISH_FIRST_NAMES_FEMALE.length)];
          } else {
            const pool = [...ENGLISH_FIRST_NAMES_MALE, ...ENGLISH_FIRST_NAMES_FEMALE];
            firstName = pool[Math.floor(Math.random() * pool.length)];
          }
          const lastName = ENGLISH_LAST_NAMES[Math.floor(Math.random() * ENGLISH_LAST_NAMES.length)];
          names.push(firstName + ' ' + lastName);
        }
        break;
      }
      case 'nickname': {
        const style = document.getElementById('nick-style').value;
        const length = parseInt(document.getElementById('nick-length').value) || 4;
        const pool = style === 'random' ? NICKNAME_STYLES.random : NICKNAME_STYLES[style];
        
        for (let i = 0; i < count; i++) {
          if (style === 'random') {
            // 生成随机组合
            const parts = ['逍遥','自在','洒脱','豁达','通透','看透','悟透','明白','懂得','知足','常乐','安然','安稳','安宁','安详','安好','安康','安乐'];
            const suffixes = ['客','者','人','生','仙','神','佛','魔','鬼','妖','仙','圣','贤','哲','智','慧','明','亮','光','辉','耀','辉','煌','灿','烂','灿','烂'];
            const name = parts[Math.floor(Math.random() * parts.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
            names.push(name);
          } else {
            names.push(pool[Math.floor(Math.random() * pool.length)]);
          }
        }
        break;
      }
    }
    
    // 显示结果
    resultContent.innerHTML = names.map(name => `
      <div class="name-item" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--color-bg-elevated);border-radius:var(--radius);margin-bottom:6px;">
        <span style="font-size:1.0625rem;font-weight:500;">${name}</span>
        <button class="btn btn-ghost btn-small" onclick="navigator.clipboard.writeText('${name}');window.Toolbox?.showToast('已复制','success')"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
      </div>
    `).join('');
    
    resultPanel.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast(`已生成 ${names.length} 个名字`, 'success');
    if (window.Toolbox) window.Toolbox.addHistory('random-name');
  };

  window.clearNames = function() {
    resultPanel.style.display = 'none';
    resultContent.innerHTML = '';
  };

  window.copyAllNames = function() {
    const items = resultContent.querySelectorAll('.name-item span:first-child');
    const texts = Array.from(items).map(el => el.textContent).join('\n');
    navigator.clipboard.writeText(texts).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制全部名字', 'success');
    });
  };

  window.downloadNames = function() {
    const items = resultContent.querySelectorAll('.name-item span:first-child');
    const texts = Array.from(items).map(el => el.textContent).join('\n');
    const blob = new Blob([texts], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'names.txt';
    a.click();
    URL.revokeObjectURL(url);
    if (window.Toolbox) window.Toolbox.showToast('已下载', 'success');
  };

  // 初始化
  toggleNameFields();
}

// 页面加载初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRandomName);
} else {
  initRandomName();
}