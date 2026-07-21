/* ---------- 步骤数据生成 ---------- */
function buildDijkstraSteps(n, edges, src){
  const dist = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  dist[src] = 0;
  const adj = Array.from({length:n}, () => []);
  edges.forEach(([u,v,w]) => { adj[u].push([v,w]); adj[v].push([u,w]); });
  const steps = [];
  const fmt = v => v === Infinity ? '∞' : v;
  const snap = (msg, hi) => steps.push({ rows:[{label:'dist[]', values:dist.map(fmt), highlights:hi || {}}], message: msg });
  snap(`初始化：dist[${src}]=0，其余为 ∞`, {[src]:'warm'});
  for(let iter=0; iter<n; iter++){
    let u = -1, best = Infinity;
    for(let i=0;i<n;i++) if(!visited[i] && dist[i] < best){ best = dist[i]; u = i; }
    if(u === -1) break;
    visited[u] = true;
    snap(`选出未访问节点中 dist 最小的：节点 ${u}（dist=${fmt(dist[u])}），标记为已确定`, {[u]:'ok'});
    adj[u].forEach(([v,w]) => {
      if(!visited[v] && dist[u] + w < dist[v]){
        const old = fmt(dist[v]);
        dist[v] = dist[u] + w;
        snap(`用节点 ${u} 更新邻居 ${v}：dist[${u}]+w = ${dist[u]}+${w} = ${dist[v]} < 原来的 ${old}，更新`, {[v]:'accent'});
      }
    });
  }
  snap('所有节点都确定后，dist[] 就是从起点到每个点的最短距离', {});
  return steps;
}

function buildDiffSteps(arr, l, r, delta){
  const n = arr.length;
  const diff = new Array(n).fill(0);
  const result = new Array(n).fill(null);
  const steps = [];
  const snap = (msg, diffHi) => steps.push({
    rows:[
      {label:'原数组 arr[]', values:arr.slice()},
      {label:'diff[] 差分数组', values:diff.slice(), highlights:diffHi || {}},
      {label:'result[]（还原结果）', values:result.slice()}
    ],
    message: msg
  });
  diff[0] = arr[0];
  for(let i=1;i<n;i++) diff[i] = arr[i] - arr[i-1];
  snap('构建差分数组：diff[0]=arr[0]，diff[i]=arr[i]-arr[i-1]（记录相邻差）', {0:'muted'});
  snap(`要给区间 [${l}, ${r}] 整体加上 ${delta}，只需要两处操作：diff[${l}] += ${delta}` + (r+1<n ? `，diff[${r+1}] -= ${delta}` : ''), {});
  diff[l] += delta;
  snap(`diff[${l}] += ${delta} → ${diff[l]}`, {[l]:'warm'});
  if(r + 1 < n){
    diff[r+1] -= delta;
    snap(`diff[${r+1}] -= ${delta} → ${diff[r+1]}`, {[r+1]:'warm'});
  }
  let acc = 0;
  for(let i=0;i<n;i++){ acc += diff[i]; result[i] = acc; }
  snap(`对 diff[] 求前缀和就能还原出更新后的数组：区间 [${l},${r}] 都比原数组多了 ${delta}`, {});
  return steps;
}

function buildSlidingWindowSteps(arr, limit){
  let l = 0, sum = 0, best = 0, bestL = 0, bestR = -1;
  const steps = [];
  const snap = (msg, rIdx, cells) => steps.push({
    rows:[{
      label:`arr[]（窗口和 ≤ ${limit} 的最长子数组）`, values:arr.slice(),
      pointers:[{idx:l,label:'L',color:'accent'}].concat(rIdx !== undefined ? [{idx:rIdx,label:'R',color:'warm'}] : []),
      highlights: cells || {}
    }],
    message: msg
  });
  for(let r=0; r<arr.length; r++){
    sum += arr[r];
    snap(`R 右移到 ${r}，加入 arr[${r}]=${arr[r]}，当前窗口和 = ${sum}`, r, {[r]:'accent'});
    while(sum > limit){
      snap(`窗口和 ${sum} > ${limit}，超了，L 右移收缩窗口：移出 arr[${l}]=${arr[l]}`, r, {[l]:'danger'});
      sum -= arr[l];
      l++;
    }
    if(r - l + 1 > best){ best = r - l + 1; bestL = l; bestR = r; }
    const winHi = {};
    for(let k=l;k<=r;k++) winHi[k] = 'ok';
    snap(`当前窗口 [${l}, ${r}]，长度 ${r-l+1}，窗口和 = ${sum}（≤ ${limit}，合法）`, r, winHi);
  }
  snap(`扫描完成，最长合法窗口长度 = ${best}（区间 [${bestL},${bestR}]）`);
  return steps;
}

function buildMonoStackSteps(arr){
  const n = arr.length;
  const result = new Array(n).fill(null);
  const stack = [];
  const steps = [];
  const snap = (msg, arrHi) => steps.push({
    rows:[
      {label:'arr[]', values:arr.slice(), highlights:arrHi || {}},
      {label:'单调栈（存下标，栈底→栈顶）', values:stack.slice()},
      {label:'result[]（下一个更大元素）', values:result.slice()}
    ],
    message: msg
  });
  snap('从左到右扫描，维护一个"从栈底到栈顶递减"的下标栈', {});
  for(let i=0;i<n;i++){
    while(stack.length && arr[stack[stack.length-1]] < arr[i]){
      const j = stack.pop();
      result[j] = arr[i];
      snap(`arr[${i}]=${arr[i]} > 栈顶 arr[${j}]=${arr[j]}：栈顶找到了它的"下一个更大元素"，弹出，result[${j}]=${arr[i]}`, {[i]:'accent', [j]:'ok'});
    }
    stack.push(i);
    snap(`把下标 ${i}（值 ${arr[i]}）压入栈`, {[i]:'warm'});
  }
  snap('扫描结束，栈里剩下的下标说明它们右边没有更大的元素，result 对应位置保持空', {});
  return steps;
}

/* ---------- 题型数据 ---------- */
const TOPICS = [
  {
    id:'dijkstra', title:'最短路：Dijkstra', badge:'树图 · 最短路', height:150, render:'array',
    explain:'带权图求单源最短路的经典算法：每次从"还没确定最短距离"的点里选出当前 dist 最小的一个，把它标记为已确定，再用它去尝试松弛（更新）它所有邻居的 dist。重复 n 次，所有点的最短距离就都确定了。',
    steps: buildDijkstraSteps(5, [[0,1,4],[0,2,1],[2,1,2],[1,3,1],[2,3,5],[3,4,3]], 0),
    blankParts:[
      T(`vector<int> dist(n, INF);\ndist[src] = 0;\nvector<bool> visited(n, false);\nfor (int iter = 0; iter < n; iter++) {\n    int u = -1;\n    for (int i = 0; i < n; i++)\n        if (!visited[i] && (u == -1 || `),
      B('dist[i] < dist[u]'),
      T(`)) u = i;\n    visited[u] = true;\n    for (auto [v, w] : adj[u]) {\n        if (!visited[v] && `),
      B('dist[u] + w < dist[v]'),
      T(`) {\n            dist[v] = dist[u] + w;\n        }\n    }\n}`)
    ],
    problems:[
      P('BISHI106','【模板】单源最短路Ⅲ ‖ 非负权图', null, 'd7fafd4f3340439e90597532850257b5'),
      P('BISHI107','【模板】最小生成树', null, '6434142fe980434899c396a6124b0778'),
      P('BISHI108','最优乘车', null, '83101a4f624042b59a629089e83b6dd1'),
      P('BISHI109','邮递员送信', null, '2b0c636cf77d441fa96d40ac64290d39')
    ]
  },
  {
    id:'diff-array', title:'差分数组', badge:'数据结构 · 差分', height:280, render:'array',
    explain:'差分是前缀和的"逆运算"：diff[i] = arr[i]-arr[i-1]。它的用处是能把"给一个区间整体加上某个值"这种操作从 O(区间长度) 降到 O(1)——只改 diff 两个位置，最后再对 diff 求一次前缀和就能还原出整个数组。',
    steps: buildDiffSteps([3,3,3,5,5,5,3,3], 2, 4, 2),
    problemNote:'一维/二维前缀和（BISHI110、112）已经在 Day1 讲过了，这里只讲差分这个"反过来"的技巧。',
    blankParts:[
      T(`vector<int> diff(n);\ndiff[0] = arr[0];\nfor (int i = 1; i < n; i++) diff[i] = arr[i] - arr[i-1];\n// 区间 [l, r] 整体加 delta，只需要两步：\n`),
      B('diff[l] += delta'),
      T(`;\nif (r + 1 < n) `),
      B('diff[r + 1] -= delta'),
      T(`;\n// 还原：对 diff 求前缀和\nint acc = 0;\nfor (int i = 0; i < n; i++) { acc += diff[i]; result[i] = acc; }`)
    ],
    problems:[
      P('BISHI111','【模板】差分','入门-8','4bbc401a5df140309edd6f14debdba42'),
      P('BISHI113','【模板】二维差分', null, '50e1a93989df42efb0b1dec386fb4ccc')
    ]
  },
  {
    id:'sliding-window', title:'双指针进阶：滑动窗口', badge:'数据结构 · 双指针', height:150, render:'array',
    explain:'和 Day1 两端夹逼的双指针不同，滑动窗口的 L、R 两个指针始终朝同一个方向移动：R 负责扩大窗口，一旦窗口不满足条件就让 L 收缩窗口，整个过程 L 和 R 都只会各走一遍，总复杂度 O(n)。',
    steps: buildSlidingWindowSteps([2,1,3,4,1,2,1], 6),
    blankParts:[
      T(`int l = 0, sum = 0, best = 0;\nfor (int r = 0; r < n; r++) {\n    sum += arr[r];\n    while (sum > limit) {\n        `),
      B('sum -= arr[l]'),
      T(`;\n        l++;\n    }\n    best = `),
      B('max(best, r - l + 1)'),
      T(`;\n}`)
    ],
    problems:[
      P('BISHI114','【模板】滑动窗口', null, 'be419f584a3f4c5b818833f1ce856626'),
      P('BISHI115','可匹配子段计数', null, 'cfc8ae6269cd445d83686f12da66023c'),
      P('BISHI117','小苯的IDE括号问题（easy）', null, '0a526c7863474220aaef082ab5f2a00a'),
      P('BISHI119','小红的01子序列构造（easy）', null, 'ee0b6c6baa2642c182df8b4390126f9a'),
      P('BISHI120','？？？','入门-10','b6b8bfcde03841e4880c2b9ef00329c6')
    ]
  },
  {
    id:'mono-stack', title:'单调栈：下一个更大元素', badge:'数据结构 · 单调栈', height:280, render:'array',
    explain:'维护一个"从栈底到栈顶递减"的下标栈：新元素来了，只要比栈顶对应的值大，就说明栈顶找到了它的"下一个更大元素"，弹出并记录；否则新下标直接压栈。每个下标只会入栈出栈各一次，整体 O(n)。',
    steps: buildMonoStackSteps([2,1,5,3,4,6]),
    blankParts:[
      T(`stack<int> st;  // 存下标，从栈底到栈顶单调递减\nfor (int i = 0; i < n; i++) {\n    while (!st.empty() && `),
      B('arr[st.top()] < arr[i]'),
      T(`) {\n        `),
      B('result[st.top()] = arr[i]'),
      T(`;\n        st.pop();\n    }\n    st.push(i);\n}`)
    ],
    problems:[
      P('BISHI121','数列后缀极大位置统计', null, '9b791983564d4ad9a1bf298670562c68'),
      P('BISHI122','区间后缀极大位置计数', null, '90f3f5e037264fae88b02918d07d7235')
    ]
  },
  {
    id:'binary-lifting', title:'倍增 / LCA（选学，了解即可）', badge:'数据结构 · 进阶', brief:true,
    explain:'倍增、最近公共祖先（LCA）、ST 表都是处理"树上/区间高频查询"的进阶数据结构，第一轮时间紧可以先跳过。BISHI126 是下一部分"高级数据结构"（线段树）的第一题，提前放在这里当预告，Day7 会正式讲。',
    problems:[
      P('BISHI123','环形字符串跃迁', null, '84c36745b9984c25839bdc36f7f83339'),
      P('BISHI124','【模板】最近公共祖先（LCA）', null, '8004903f8eff4473b5c590b85afd7217'),
      P('BISHI125','【模板】静态区间最值', null, '831a314449d44ea0b1db90ca626bcd1a'),
      P('BISHI126','【模板】动态区间和Ⅱ ‖ 区间修改 + 区间查询', null, 'ef7a50cf0377447b9b435b0f95e48e70')
    ]
  }
];
