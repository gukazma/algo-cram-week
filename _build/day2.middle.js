/* ---------- 步骤数据生成 ---------- */
function buildCountingSortSteps(arr, maxVal){
  const count = new Array(maxVal + 1).fill(0);
  const output = new Array(arr.length).fill(null);
  const steps = [];
  const snap = (msg, arrHi, countHi, outHi) => steps.push({
    rows:[
      {label:'arr[]', values:arr.slice(), highlights:arrHi || {}},
      {label:'count[]（下标 = 数值）', values:count.slice(), highlights:countHi || {}},
      {label:'output[]', values:output.slice(), highlights:outHi || {}}
    ],
    message: msg
  });
  snap('初始化 count 数组，长度 = 最大值 + 1，全部为 0', {}, {}, {});
  for(let i=0;i<arr.length;i++){
    count[arr[i]]++;
    snap(`count[${arr[i]}]++ → ${count[arr[i]]}（统计 arr[${i}]=${arr[i]} 出现的次数）`, {[i]:'accent'}, {[arr[i]]:'warm'}, {});
  }
  let pos = 0;
  for(let v=0; v<=maxVal; v++){
    if(count[v] > 0){
      const from = pos;
      for(let k=0;k<count[v];k++){ output[pos] = v; pos++; }
      const outHi = {};
      for(let p=from; p<pos; p++) outHi[p] = 'ok';
      snap(`数值 ${v} 共出现 ${count[v]} 次，依次写入 output`, {}, {[v]:'accent'}, outHi);
    }
  }
  snap('计数排序完成：output 就是排好序的结果', {}, {}, Object.fromEntries(output.map((_,i)=>[i,'ok'])));
  return steps;
}

function buildWiggleConstructSteps(sorted){
  const n = sorted.length;
  const output = new Array(n).fill(null);
  let l = 0, r = n - 1;
  const steps = [];
  const snap = (msg, srcHi, outHi) => steps.push({
    rows:[
      {label:'排好序的原数组', values:sorted.slice(), highlights:srcHi || {}},
      {label:'构造结果 output[]（低高交替）', values:output.slice(), highlights:outHi || {}}
    ],
    message: msg
  });
  snap('原数组已排好序，准备交替取"最小"和"最大"来构造低高摆动序列', {}, {});
  for(let i=0;i<n;i++){
    if(i % 2 === 0){
      output[i] = sorted[l];
      snap(`第 ${i} 位（偶数位，要"低"）取当前最小值 sorted[${l}]=${sorted[l]}`, {[l]:'accent'}, {[i]:'accent'});
      l++;
    } else {
      output[i] = sorted[r];
      snap(`第 ${i} 位（奇数位，要"高"）取当前最大值 sorted[${r}]=${sorted[r]}`, {[r]:'warm'}, {[i]:'warm'});
      r--;
    }
  }
  snap('构造完成：output 满足 a[0]<a[1]>a[2]<a[3]... 的摆动性质', {}, Object.fromEntries(output.map((_,i)=>[i,'ok'])));
  return steps;
}

function buildXorSteps(arr){
  let cur = 0;
  const steps = [];
  const toBits = v => v.toString(2).padStart(8,'0').split('').map(Number);
  const snap = msg => steps.push({ bits:toBits(cur), resultText:`当前异或结果 = ${cur}`, message: msg });
  snap('初始 result = 0');
  for(let i=0;i<arr.length;i++){
    const before = cur;
    cur ^= arr[i];
    snap(`result ^= arr[${i}]（=${arr[i]}）：${before} ^ ${arr[i]} = ${cur}`);
  }
  snap(`异或完成：出现两次的数字互相抵消（a^a=0），最后剩下的 ${cur} 就是只出现一次的数`);
  return steps;
}

function buildBashGameSteps(n, m, opponentMoves){
  const k = m + 1;
  const r = n % k;
  let remain = n;
  const steps = [];
  const snap = msg => steps.push({ rows:[{label:'剩余石子', values:Array(remain).fill(1)}], message: msg });
  snap(`初始 ${n} 颗石子，每次可拿 1~${m} 颗，拿到最后一颗的人赢。${n} % ${k} = ${r}${r===0 ? '，先手必败' : '，先手必胜'}`);
  if(r > 0){
    remain -= r;
    snap(`先手先拿 ${r} 颗，让剩余变成 ${k} 的倍数：剩 ${remain}`);
  }
  let turn = 'opp', oi = 0, lastOppTake = 0;
  while(remain > 0){
    if(turn === 'opp'){
      const take = Math.min(opponentMoves[oi % opponentMoves.length], remain, m);
      oi++; lastOppTake = take;
      remain -= take;
      snap(`对方拿 ${take} 颗，剩 ${remain}`);
      turn = 'me';
    } else {
      const take = Math.min(k - lastOppTake, remain);
      remain -= take;
      snap(`我方跟着拿 ${take} 颗，凑够 ${k} 的倍数：剩 ${remain}`);
      turn = 'opp';
    }
  }
  snap('石子拿完，最后一颗是先手拿的，先手获胜！');
  return steps;
}

function buildDivisorBlockSteps(n){
  const iArr = [], vArr = [];
  const steps = [];
  const snap = msg => steps.push({
    rows:[
      {label:'区间起点 i', values:iArr.slice()},
      {label:'⌊n / i⌋', values:vArr.slice()}
    ],
    message: msg
  });
  snap(`n = ${n}，逐块找出 ⌊n/i⌋ 相同的连续区间`);
  let i = 1;
  while(i <= n){
    const v = Math.floor(n / i);
    const j = Math.floor(n / v);
    iArr.push(i); vArr.push(v);
    snap(`i=${i}..${j} 时 ⌊n/i⌋ 都等于 ${v}（一段区间只需算一次），下一段从 i=${j+1} 开始`);
    i = j + 1;
  }
  snap(`所有区间处理完毕，只用了 ${iArr.length} 步，而不是 n=${n} 步`);
  return steps;
}

/* ---------- 题型数据 ---------- */
const TOPICS = [
  {
    id:'counting-sort', title:'桶思想 / 计数排序', badge:'基础 · 桶/计数排序', height:280, render:'array',
    explain:'当数值范围不大时，可以开一个"桶"数组统计每个值出现的次数，再按桶的顺序把答案还原出来，不需要比较元素大小，比通用排序更快（O(n+k)）。',
    steps: buildCountingSortSteps([3,1,2,3,1,0,2], 3),
    blankParts:[
      T(`vector<int> count(maxVal + 1, 0);\nfor (int i = 0; i < n; i++) `),
      B('count[arr[i]]++'),
      T(`;\nint pos = 0;\nfor (int v = 0; v <= maxVal; v++) {\n    while (count[v]--) `),
      B('output[pos++] = v'),
      T(`;\n}`)
    ],
    problems:[
      P('BISHI22','分数线划定','入门-8','2395fa7b6c6e452e8d8310a7cfdbe902'),
      P('BISHI23','小红书推荐系统','入门-9','e5b39c9034a84bf2a5e026b2b9b973d0'),
      P('BISHI24','谐距下标对','入门-10','12fd032361704c978bcb9c2c2b3bb93d'),
      P('BISHI25','最大 FST 距离', null, '6295f81acd1b4fb59c8beed92577f64b')
    ]
  },
  {
    id:'construct', title:'构造：交替取值构造摆动序列', badge:'基础 · 构造', height:186, render:'array',
    explain:'"构造"类题目没有搜索空间，要求直接给出一个满足条件的答案。常见技巧是先把数据排序，再按某种规律（比如两端交替取值）直接拼出结果，一次搞定，不需要试错。',
    steps: buildWiggleConstructSteps([1,2,3,4,5,6]),
    blankParts:[
      T(`int l = 0, r = n - 1;\nfor (int i = 0; i < n; i++) {\n    if (i % 2 == 0) output[i] = `),
      B('sorted[l++]'),
      T(`;\n    else output[i] = `),
      B('sorted[r--]'),
      T(`;\n}`)
    ],
    problems:[
      P('BISHI26','构造C的歪','入门-4','56735b3fe2fc4ed5916f5427dc787156'),
      P('BISHI27','构造数对','入门-6','c16b86c1149a43eaaa0fd85aaee51290'),
      P('BISHI28','构造数独','入门-7','bf8ffcbf95f743d7bbb2dd96bafa1a3c'),
      P('BISHI29','小红的排列构造①','入门-9','2b0a9318cc0740d1a78eec06162e7bea')
    ]
  },
  {
    id:'xor', title:'位运算：异或的性质', badge:'基础 · 位运算进阶', height:150, render:'bit',
    explain:'异或有两个关键性质：a^a=0（自己异或自己抵消），a^0=a（异或 0 不变）。把数组所有元素异或起来，成对出现的数字两两抵消，剩下的就是落单的那个，常用于"找不同"类题目。',
    steps: buildXorSteps([4,1,2,1,2]),
    blankParts:[
      T(`int result = 0;\nfor (int i = 0; i < n; i++) {\n    `),
      B('result ^= arr[i]'),
      T(`;\n}\n// 出现两次的数字异或后抵消为 0，剩下的就是只出现一次的数`)
    ],
    problems:[
      P('BISHI30','二进制数1','入门-5','bc4c7936f5ed42cbb9131b6f39aa272b'),
      P('BISHI31','二进制不同位数','入门-6','daf9032926614dab91ca624a7759a868'),
      P('BISHI32','被打乱的异或和','入门-6','116db6858c424fb89b821125053bbc15'),
      P('BISHI33','Poi 的新加法（Easy Version）','入门-10','9f766daa7e4042a786633c341fe9d7e2')
    ]
  },
  {
    id:'bash-game', title:'博弈论：巴什博弈', badge:'基础 · 博弈论', height:150, render:'array',
    explain:'n 颗石子，每次能拿 1~m 颗，拿到最后一颗的人赢。关键结论：设 k=m+1，若 n 是 k 的倍数则先手必败（无论怎么拿，后手总能凑回 k 的倍数）；否则先手只要先拿 n%k 颗，之后就能一直保持这个优势。',
    steps: buildBashGameSteps(13, 3, [2,3,1]),
    blankParts:[
      T(`int k = m + 1;\nint r = `),
      B('n % k'),
      T(`;\nif (r == 0) {\n    // 先手必败\n} else {\n    int first = r;   // 先手第一步先拿 first 颗\n    // 之后对方拿 x 颗，我方就跟着拿 `),
      B('k - x'),
      T(` 颗，凑够 k 的倍数\n}`)
    ],
    problems:[
      P('BISHI34','甜蜜的博弈','入门-10','d3934f2d05624c8fa1a748ef225d0460'),
      P('BISHI35','【模板】巴什博弈','入门-8','9bb882504d574ec287f69e967ce0fb95'),
      P('BISHI36','【模板】扩展巴什博弈', null, '4b0d36a3d3884cf69f618cf4c2511d82')
    ]
  },
  {
    id:'divisor-block', title:'数论技巧：整除分块', badge:'基础 · 整除分块', height:186, render:'array',
    explain:'要对所有 i 求和 ⌊n/i⌋ 时，会发现很多连续的 i 算出来的 ⌊n/i⌋ 值是一样的。把值相同的一段区间一次性跳过去，整个过程只需要 O(√n) 步，而不是 O(n) 步。',
    steps: buildDivisorBlockSteps(30),
    blankParts:[
      T(`int i = 1;\nwhile (i <= n) {\n    int v = `),
      B('n / i'),
      T(`;\n    int j = `),
      B('n / v'),
      T(`;\n    // 区间 [i, j] 内 ⌊n/i⌋ 的值都等于 v\n    i = `),
      B('j + 1'),
      T(`;\n}`)
    ],
    problems:[
      P('BISHI41','【模板】整除分块', null, '6b0b510b32484281bd21abb71ef7ba0b'),
      P('BISHI42','余数求和', null, '5d18ffe2c6cd45ac8d8040be19c96f14')
    ]
  },
  {
    id:'randomized', title:'随机化算法（选学，了解即可）', badge:'基础 · 随机化', brief:true,
    explain:'这部分包含 Pollard-rho 大数质因数分解、随机化构造等技巧，属于进阶数论内容，多数校招笔试很少直接考到。时间紧的话可以先跳过，专注前面几类核心套路；有余力再来看也不迟。',
    problems:[
      P('BISHI37','数位差与数值和的构造','入门-10','36f3593e553c4c67987abf88a3d4d105'),
      P('BISHI38','有向二分图构造', null, 'e56757bb703b4cee9d641d1682b54b63'),
      P('BISHI39','【模板】Pollard-Pho算法', null, '9da360a56fa846708542b0fb3985c647'),
      P('BISHI40','数组取精', null, '6f77d207b40c41d899d23627d6bd122a')
    ]
  }
];
