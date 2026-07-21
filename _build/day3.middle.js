/* ---------- 步骤数据生成 ---------- */
function buildGreedyIntervalSteps(starts, ends){
  let lastEnd = -Infinity, count = 0;
  const steps = [];
  const snap = (msg, hi) => steps.push({
    rows:[
      {label:'start[]（已按 end 排序）', values:starts.slice(), highlights:hi ? hi.s : {}},
      {label:'end[]', values:ends.slice(), highlights:hi ? hi.e : {}}
    ],
    message: msg
  });
  snap('区间已按结束时间从早到晚排好序，依次尝试贪心选择', {});
  for(let i=0;i<starts.length;i++){
    if(starts[i] >= lastEnd){
      count++;
      snap(`区间 [${starts[i]}, ${ends[i]}]：start=${starts[i]} >= 上一个已选的 end=${lastEnd===-Infinity?'-∞':lastEnd}，可以选，选上（第 ${count} 个）`, {s:{[i]:'ok'}, e:{[i]:'ok'}});
      lastEnd = ends[i];
    } else {
      snap(`区间 [${starts[i]}, ${ends[i]}]：start=${starts[i]} < 上一个已选的 end=${lastEnd}，会冲突，跳过`, {s:{[i]:'danger'}, e:{[i]:'danger'}});
    }
  }
  snap(`处理完成，一共选中 ${count} 个互不冲突的区间`, {});
  return steps;
}

function buildRegretGreedySteps(durs, deadlines){
  let time = 0;
  let chosen = [];
  const steps = [];
  const snap = msg => steps.push({ rows:[{label:'已选任务耗时', values:chosen.slice()}], message: msg });
  snap('开始按截止时间从早到晚处理任务');
  for(let i=0;i<durs.length;i++){
    const d = durs[i], dl = deadlines[i];
    if(time + d <= dl){
      chosen.push(d);
      time += d;
      snap(`任务${i}（耗时${d}，截止${dl}）：当前时间+耗时=${time} <= 截止，直接选上`);
    } else {
      const maxV = Math.max(...chosen);
      if(maxV > d){
        const idx = chosen.indexOf(maxV);
        chosen.splice(idx, 1);
        chosen.push(d);
        time = time - maxV + d;
        snap(`任务${i}（耗时${d}）来不及做，但比已选中最长的任务（耗时${maxV}）还短：反悔换掉它腾出时间，当前总耗时=${time}`);
      } else {
        snap(`任务${i}（耗时${d}）来不及做，且不比已选中最长的任务（耗时${maxV}）短，放弃`);
      }
    }
  }
  snap(`处理完成，最终选中 ${chosen.length} 个任务`);
  return steps;
}

function buildGcdSteps(a, b){
  const steps = [];
  const snap = msg => steps.push({ rows:[{label:'a', values:[a]}, {label:'b', values:[b]}], message: msg });
  snap(`gcd(${a}, ${b})：开始辗转相除`);
  while(b !== 0){
    const r = a % b;
    snap(`${a} % ${b} = ${r}，令 a=${b}, b=${r}`);
    a = b; b = r;
  }
  snap(`b 变成 0，gcd = ${a}`);
  return steps;
}

function buildFibSteps(n){
  const fib = new Array(n + 1).fill(null);
  fib[0] = 0; if(n >= 1) fib[1] = 1;
  const steps = [];
  const snap = (msg, hi) => steps.push({ rows:[{label:'fib[]', values:fib.slice(), highlights:hi || {}}], message: msg });
  snap('初始化 fib[0]=0, fib[1]=1', {0:'warm', 1:'warm'});
  for(let i=2;i<=n;i++){
    fib[i] = fib[i-1] + fib[i-2];
    snap(`fib[${i}] = fib[${i-1}] + fib[${i-2}] = ${fib[i-1]} + ${fib[i-2]} = ${fib[i]}`, {[i-1]:'muted', [i-2]:'muted', [i]:'warm'});
  }
  snap(`计算完成，fib[${n}] = ${fib[n]}`, {[n]:'ok'});
  return steps;
}

/* ---------- 题型数据 ---------- */
const TOPICS = [
  {
    id:'greedy-interval', title:'简单贪心：区间调度', badge:'贪心 · 排序后贪心', height:150, render:'array',
    explain:'很多贪心题的套路是"先排序，再依次决策"。比如从若干区间里选出最多数量互不重叠的区间：按结束时间从早到晚排序，每次只要当前区间的开始时间不早于上一个已选区间的结束时间，就选上——局部最优能拼出全局最优。',
    steps: buildGreedyIntervalSteps([1,3,0,5,8], [2,4,6,7,9]),
    blankParts:[
      T(`// intervals 已按 end 从小到大排序\nint lastEnd = INT_MIN, count = 0;\nfor (auto& [s, e] : intervals) {\n    if (`),
      B('s >= lastEnd'),
      T(`) {\n        count++;\n        `),
      B('lastEnd = e'),
      T(`;\n    }\n}`)
    ],
    problems:[
      P('BISHI43','讨厌鬼进货','入门-6','e364bac751204aa0b2d27389ca8e3c94'),
      P('BISHI44','灵异背包？','入门-7','812bcedbbe244c9b86e459a244af5ddf'),
      P('BISHI45','小红的矩阵染色', null, 'dcbaf862c0e046d79e9cd297abd76bcf'),
      P('BISHI46','小红的魔法药剂','入门-7','1ede2daa3ab445bc8ac8ea62b6ca8201'),
      P('BISHI47','交换到最大', null, '73fd35bbfaa5483d8aa8b03cd27887a8'),
      P('BISHI48','小红的整数配对', null, '66b9810e4fe34956a8d1f5c67aacc6dc'),
      P('BISHI49','小红闯关', null, '7ce4b75f7a304be481e73bc4dd2705a4')
    ]
  },
  {
    id:'regret-greedy', title:'贪心进阶：反悔堆', badge:'贪心 · 反悔贪心', height:150, render:'array',
    explain:'有些贪心一次选完不一定是最优的，需要"留后悔药"：用一个大顶堆维护已选任务里耗时最长的那个，后面遇到来不及做但比堆顶还短的任务时，把堆顶换成它——相当于"反悔"了之前的选择，为后面腾出时间。',
    steps: buildRegretGreedySteps([5,2,3], [5,6,6]),
    blankParts:[
      T(`priority_queue<int> chosen;  // 大顶堆，堆顶是已选中耗时最长的任务\nlong long time = 0;\nfor (auto& [d, deadline] : tasks) {  // 已按 deadline 排序\n    if (`),
      B('time + d <= deadline'),
      T(`) {\n        chosen.push(d);\n        time += d;\n    } else if (!chosen.empty() && `),
      B('chosen.top() > d'),
      T(`) {\n        time += d - chosen.top();\n        chosen.pop();\n        chosen.push(d);\n    }\n}`)
    ],
    problems:[
      P('BISHI50','[JSOI2007]建筑抢修','入门-0','e69a484a4dfb4015b34c2e0ff2ae2ac8'),
      P('BISHI51','低买高卖', null, '61ad3cbe0e7d4db9b64fc2b7b503dfd8'),
      P('BISHI52','奥赛组队', null, '8809c78fe4fa445ab8218cee5b69910f'),
      P('BISHI53','[P1080] 国王游戏(简化版)','入门-0','145c3426577f40f8b2b5e51ca6f61523'),
      P('BISHI54','货物堆放', null, '22541f98215747aeb0b8217ae1dd97e8')
    ]
  },
  {
    id:'gcd', title:'数论基础：质数与 GCD', badge:'数学 · 数论基础', height:150, render:'array',
    explain:'求最大公约数的经典套路是辗转相除法：gcd(a,b) = gcd(b, a mod b)，反复用余数替换，直到余数为 0，此时的另一个数就是答案。判断质数、分解质因数则通常只需要试除到 √n。',
    steps: buildGcdSteps(48, 18),
    blankParts:[
      T(`int gcd(int a, int b) {\n    while (b != 0) {\n        int r = `),
      B('a % b'),
      T(`;\n        a = b;\n        b = r;\n    }\n    return `),
      B('a'),
      T(`;\n}`)
    ],
    problems:[
      P('BISHI55','判断质数','入门-7','9f418ff48b5e4e879f398352bed6118d'),
      P('BISHI56','分解质因数','入门-7','35723516d6f841ca8869ecbcf3ddacaf'),
      P('BISHI57','最大公因数与最小公倍数','入门-6','ee732bec4f174cd9b4abc6427ba90584'),
      P('BISHI58','矩形游戏', null, '5b6c2c824a434b55a5e3b77619c54a90')
    ]
  },
  {
    id:'fib-recursion', title:'递归与取模基础：斐波那契', badge:'数学 · 递归/取模', height:150, render:'array',
    explain:'斐波那契数列是最经典的"递推"例子：fib[i] = fib[i-1] + fib[i-2]。直接写递归会重复计算大量子问题，改成从小到大顺序递推（本质是记录中间结果）就能做到 O(n)。数值很大时记得对结果取模，防止溢出。',
    steps: buildFibSteps(10),
    blankParts:[
      T(`vector<long long> fib(n + 1);\nfib[0] = 0; fib[1] = 1;\nfor (int i = 2; i <= n; i++) {\n    fib[i] = (`),
      B('fib[i - 1] + fib[i - 2]'),
      T(`) % MOD;  // 注意取模，防止溢出\n}`)
    ],
    problems:[
      P('BISHI59','阶乘末尾非零数字','入门-10','248c8fbee56e491aa147b67b9c082da0'),
      P('BISHI60','大水题','入门-0','6b9770de551c426287252421742f6ebf'),
      P('BISHI61','小q的数列','入门-10','8ea1e0d996f64e15961ae42e658a04a7'),
      P('BISHI62','斐波那契数列','入门-9','c245af6cfdce49ceb5435f649ee14f89'),
      P('BISHI63','计算阶乘','入门-6','b93729ad46d74a62801bdc320be2aa8e')
    ]
  }
];
