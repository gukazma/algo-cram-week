/* ---------- 步骤数据生成 ---------- */
function buildKadaneSteps(arr){
  const dp = new Array(arr.length).fill(null);
  dp[0] = arr[0];
  let best = arr[0];
  const steps = [];
  const snap = (msg, hi) => steps.push({
    rows:[{label:'arr[]', values:arr.slice()}, {label:'dp[]（以 i 结尾的最大子段和）', values:dp.slice(), highlights:hi || {}}],
    message: msg
  });
  snap(`dp[0] = arr[0] = ${arr[0]}`, {0:'warm'});
  for(let i=1;i<arr.length;i++){
    if(dp[i-1] > 0){
      dp[i] = dp[i-1] + arr[i];
      snap(`dp[${i-1}]=${dp[i-1]} > 0，接着往后延续更划算：dp[${i}] = dp[${i-1}] + arr[${i}] = ${dp[i]}`, {[i]:'accent', [i-1]:'muted'});
    } else {
      dp[i] = arr[i];
      snap(`dp[${i-1}]=${dp[i-1]} <= 0，接上反而拖后腿，不如从 arr[${i}] 重新开始：dp[${i}] = ${dp[i]}`, {[i]:'warm', [i-1]:'muted'});
    }
    if(dp[i] > best) best = dp[i];
  }
  const finalHi = {};
  dp.forEach((v,i) => { if(v === best) finalHi[i] = 'ok'; });
  snap(`扫描完成，dp[] 中的最大值就是答案：最大子段和 = ${best}`, finalHi);
  return steps;
}

function build01KnapsackSteps(weights, values, cap){
  const dp = new Array(cap + 1).fill(0);
  const steps = [];
  const snap = (msg, hi) => steps.push({ rows:[{label:`dp[]（容量 0..${cap} 的最大价值）`, values:dp.slice(), highlights:hi || {}}], message: msg });
  snap('初始化 dp[0..cap] = 0（背包空的时候价值都是 0）', {});
  for(let it=0; it<weights.length; it++){
    const w = weights[it], v = values[it];
    snap(`处理第 ${it} 件物品：重量=${w}, 价值=${v}。容量从大到小遍历，避免同一件物品选多次`, {});
    for(let cw=cap; cw>=w; cw--){
      const cand = dp[cw-w] + v;
      if(cand > dp[cw]){
        dp[cw] = cand;
        snap(`dp[${cw}] = max(dp[${cw}], dp[${cw-w}]+${v}) = ${dp[cw]}（选这件物品更好）`, {[cw]:'accent'});
      }
    }
  }
  snap(`所有物品处理完，dp[${cap}] = ${dp[cap]} 就是容量为 ${cap} 时能装下的最大价值`, {[cap]:'ok'});
  return steps;
}

function buildUnboundedKnapsackSteps(weights, values, cap){
  const dp = new Array(cap + 1).fill(0);
  const steps = [];
  const snap = (msg, hi) => steps.push({ rows:[{label:`dp[]（完全背包，容量 0..${cap}）`, values:dp.slice(), highlights:hi || {}}], message: msg });
  snap('完全背包：每件物品可以选无限次。和 01 背包唯一的区别是容量从小到大遍历', {});
  for(let it=0; it<weights.length; it++){
    const w = weights[it], v = values[it];
    snap(`处理物品：重量=${w}, 价值=${v}。容量从小到大遍历，允许同一件物品被重复选中`, {});
    for(let cw=w; cw<=cap; cw++){
      const cand = dp[cw-w] + v;
      if(cand > dp[cw]){
        dp[cw] = cand;
        snap(`dp[${cw}] = max(dp[${cw}], dp[${cw-w}]+${v}) = ${dp[cw]}`, {[cw]:'accent'});
      }
    }
  }
  snap(`处理完成，dp[${cap}] = ${dp[cap]}`, {[cap]:'ok'});
  return steps;
}

/* ---------- 题型数据 ---------- */
const TOPICS = [
  {
    id:'segment-tree', title:'线段树初步（选学，了解即可）', badge:'数据结构 · 进阶', brief:true,
    explain:'线段树支持"区间修改 + 区间查询"都在 O(log n) 完成，是数据结构里公认的难点，通常需要专门花时间才能吃透。第一周时间紧的话建议先跳过，优先把动态规划这个大头啃完；线段树可以放到二刷再攻克。',
    problems:[
      P('BISHI127','区间根号与区间求和', null, '56547df6934f4048a80ec75838d60c8f'),
      P('BISHI128','区间加乘与单点求值', null, '7a1de22fa7a1456f8ba519f21de31c84'),
      P('BISHI129','区间增量与区间小于计数', null, '74481dd14e3b4875a190952f86e6ffab'),
      P('BISHI130','区间取反与区间数一', null, '55d474a878a84f4b84dca4b177a8c45c')
    ]
  },
  {
    id:'kadane', title:'动态规划入门：最大子段和', badge:'DP · 一维DP', height:186, render:'array',
    explain:'DP 的核心是定义"状态"：dp[i] 表示以第 i 个数结尾的最大子段和。转移时只有两种选择——接上前面（如果前面的 dp 是正的，接上更划算），或者从当前数重新开始（如果前面是负的，拖累整体，不如另起炉灶）。',
    steps: buildKadaneSteps([-2,1,-3,4,-1,2,1,-5,4]),
    blankParts:[
      T(`vector<int> dp(n);\ndp[0] = arr[0];\nint best = dp[0];\nfor (int i = 1; i < n; i++) {\n    if (dp[i-1] > 0) dp[i] = `),
      B('dp[i-1] + arr[i]'),
      T(`;\n    else dp[i] = arr[i];\n    best = `),
      B('max(best, dp[i])'),
      T(`;\n}`)
    ],
    problems:[
      P('BISHI131','数楼梯','入门-7','c7e5f164fa5d471f8f83c90fe4ee3f05'),
      P('BISHI132','小红的地砖','入门-7','8cd083c66a5f43489a532164e2a2304d'),
      P('BISHI133','最长不下降子序列', null, '25da45d0d4fb4faba45094cbb0649062'),
      P('BISHI134','最大子段和','入门-6','f04519cd1d904f50b68f4229a126ab08')
    ]
  },
  {
    id:'knapsack-01', title:'01 背包', badge:'DP · 背包DP', height:150, render:'array',
    explain:'每件物品最多选一次，要在容量限制内选出总价值最大的组合。用 dp[w] 表示"容量为 w 时的最大价值"，每件物品处理时容量必须从大到小遍历——这样才能保证同一件物品不会被重复计算进同一个状态。',
    steps: build01KnapsackSteps([2,3,4], [3,4,5], 7),
    blankParts:[
      T(`vector<int> dp(cap + 1, 0);\nfor (int i = 0; i < n; i++) {\n    for (int w = cap; `),
      B('w >= weight[i]'),
      T(`; w--) {\n        dp[w] = max(dp[w], `),
      B('dp[w - weight[i]] + value[i]'),
      T(`);\n    }\n}`)
    ],
    problems:[
      P('BISHI135','三角形取数(Hard Version)', null, 'ceea5825472940dabfec917ef93538e6'),
      P('BISHI136','【模板】01背包','入门-10','fd55637d3f24484e96dad9e992d3f62e')
    ]
  },
  {
    id:'knapsack-unbounded', title:'完全背包 / 多重背包 / 分组背包', badge:'DP · 背包DP进阶', height:150, render:'array',
    explain:'这几种背包都是 01 背包的变形：完全背包每件物品能选无限次（容量改成从小到大遍历即可）；多重背包每件物品有限次（可以拆分成多个 01 物品）；分组背包每组只能选一件（内层按组处理，组内互斥）。理解了 01 背包的状态定义，这些都是遍历方式的调整。',
    steps: buildUnboundedKnapsackSteps([2,3,4], [3,4,5], 7),
    blankParts:[
      T(`for (int i = 0; i < n; i++) {\n    for (int w = weight[i]; w <= cap; w++) {  // 从小到大：和 01 背包唯一的区别\n        dp[w] = max(dp[w], `),
      B('dp[w - weight[i]] + value[i]'),
      T(`);\n    }\n}`)
    ],
    problems:[
      P('BISHI137','【模板】完全背包','入门-11','deda4293d9b24ce1aeaf1813c88b8c25'),
      P('BISHI138','【模板】多重背包', null, '8fa10063d33a43dd9652c1511a34d461'),
      P('BISHI139','【模板】二维费用背包', null, '84b88177894c4c82980017e6b4a15fb3'),
      P('BISHI140','【模板】分组背包', null, '32a6c222213c42efa902da6b5c9f8e99')
    ]
  },
  {
    id:'advanced-dp', title:'进阶 DP 杂题（选学，按时间决定）', badge:'DP · 进阶', brief:true,
    explain:'这部分包含树形 DP（没有上司的舞会）、区间 DP（石子合并）等进阶模型，思路比前面的线性 DP / 背包 DP 更绕。如果一周时间刚好用完，可以先只看一眼题目长什么样，把这些留到二刷再深入。',
    problems:[
      P('BISHI141','来硬的', null, '08dbc77ec79942c1914b002f488b87ee'),
      P('BISHI142','最大学分', null, '66403297dfe04faaacf7d0e905fea7ac'),
      P('BISHI143','没有上司的舞会', null, 'f703237089ee42d9b37e01d70e14e2fc'),
      P('BISHI144','食物链计数', null, '9844dd9f531e46e29f5749e8fcc4bd0b'),
      P('BISHI145','石子合并', null, '237337887b094938bfc6e9557f92c3e9'),
      P('BISHI146','收集金币', null, 'bde230df252c4b41a059c9b06fcf65b6'),
      P('BISHI147','旅行者的大逃脱', null, '3a02e2b818144c2dbad8dd3dc28d04cf')
    ]
  }
];
