/* ---------- 步骤数据生成 ---------- */
function buildFastPowSteps(base, exp, mod){
  let result = 1, b = base % mod, e = exp;
  const steps = [];
  const toBits = v => v.toString(2).padStart(8,'0').split('').map(Number);
  const snap = msg => steps.push({ bits:toBits(e), resultText:`result=${result}, base=${b}, 剩余指数(二进制)=${e.toString(2)}`, message: msg });
  snap(`计算 ${base}^${exp} mod ${mod}，把指数 ${exp} 看成二进制，从低位到高位处理`);
  while(e > 0){
    if(e & 1){
      result = (result * b) % mod;
      snap(`最低位是 1：result = result * base % mod = ${result}`);
    } else {
      snap('最低位是 0：这一位不用乘，跳过');
    }
    b = (b * b) % mod;
    e = e >> 1;
    snap(`base 自乘：base = base*base % mod = ${b}；指数右移一位变成 ${e}`);
  }
  snap(`指数变成 0，结束。最终 result = ${result}`);
  return steps;
}

function buildPascalSteps(n){
  const grid = [];
  for(let i=0;i<=n;i++){
    const row = [];
    for(let j=0;j<=n;j++) row.push({value:null, hi:null, order:null});
    grid.push(row);
  }
  const steps = [];
  const snapshot = msg => steps.push({ grid: grid.map(row => row.map(c => ({...c}))), message: msg });
  grid[0][0].value = 1; grid[0][0].hi = 'warm';
  snapshot('C(0,0) = 1（边界条件）');
  for(let i=1;i<=n;i++){
    grid[i][0].value = 1; grid[i][0].hi = 'warm';
    snapshot(`C(${i},0) = 1（每行第一个数都是 1）`);
    for(let j=1;j<=i;j++){
      const left = grid[i-1][j-1].value || 0;
      const up = grid[i-1][j].value || 0;
      grid[i][j].value = left + up;
      grid[i][j].hi = 'accent';
      snapshot(`C(${i},${j}) = C(${i-1},${j-1}) + C(${i-1},${j}) = ${left} + ${up} = ${grid[i][j].value}`);
    }
  }
  snapshot('杨辉三角构建完成：C(n, k) 就是第 n 行第 k 个数');
  return steps;
}

function buildPermuteDfsSteps(nums){
  const n = nums.length;
  const path = new Array(n).fill(null);
  const used = new Array(n).fill(0);
  const steps = [];
  const results = [];
  const snap = (msg, hi) => steps.push({
    rows:[
      {label:'path[]（当前路径）', values:path.slice(), highlights:hi || {}},
      {label:'used[]（0/1）', values:used.slice()}
    ],
    message: msg
  });
  function dfs(depth){
    if(depth === n){
      results.push(path.slice());
      snap(`路径填满，得到一个排列 [${path.join(',')}]，记录下来`, {});
      return;
    }
    for(let i=0;i<n;i++){
      if(used[i]) continue;
      used[i] = 1;
      path[depth] = nums[i];
      snap(`选 nums[${i}]=${nums[i]} 放到第 ${depth} 位`, {[depth]:'accent'});
      dfs(depth + 1);
      used[i] = 0;
      path[depth] = null;
      snap(`回溯：撤销第 ${depth} 位的选择，尝试下一种可能`, {[depth]:'muted'});
    }
  }
  snap('从空路径开始尝试', {});
  dfs(0);
  snap(`搜索完成，一共找到 ${results.length} 种排列`, {});
  return steps;
}

function buildBfsMazeSteps(maze){
  const rows = maze.length, cols = maze[0].length;
  const dist = maze.map(row => row.map(v => v === 1 ? null : -1));
  const cellState = maze.map(row => row.map(() => ({value:null, hi:null, order:null})));
  const steps = [];
  const snapshot = msg => steps.push({ grid: cellState.map(row => row.map(c => ({...c}))), message: msg });
  const q = [[0,0]];
  dist[0][0] = 0;
  cellState[0][0].value = 0; cellState[0][0].hi = 'warm'; cellState[0][0].order = 1;
  let order = 1;
  snapshot('起点 (0,0) 距离记为 0，加入队列');
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let qi = 0;
  while(qi < q.length){
    const [r,c] = q[qi]; qi++;
    for(const [dr,dc] of dirs){
      const nr = r+dr, nc = c+dc;
      if(nr<0 || nr>=rows || nc<0 || nc>=cols) continue;
      if(maze[nr][nc] === 1) continue;
      if(dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      order++;
      cellState[nr][nc].value = dist[nr][nc];
      cellState[nr][nc].hi = 'accent';
      cellState[nr][nc].order = order;
      q.push([nr,nc]);
      snapshot(`从 (${r},${c}) 扩展到 (${nr},${nc})：距离 = ${dist[r][c]}+1 = ${dist[nr][nc]}，加入队列`);
    }
  }
  snapshot('队列为空，BFS 结束：每个格子的数字就是从起点到它的最短步数');
  return steps;
}

/* ---------- 题型数据 ---------- */
const TOPICS = [
  {
    id:'fast-pow', title:'快速幂', badge:'数学 · 快速幂', height:150, render:'bit',
    explain:'求 a^n 时不用一个个乘 n 次。把指数 n 看成二进制：每一位是 1 就把当前 base 乘进答案，不管是不是 1，base 都要自己平方一次再进入下一位——总共只需要 O(log n) 次乘法。',
    steps: buildFastPowSteps(3, 13, 1000),
    blankParts:[
      T(`long long qpow(long long base, long long exp, long long mod) {\n    long long result = 1;\n    base %= mod;\n    while (exp > 0) {\n        if (`),
      B('exp & 1'),
      T(`) result = `),
      B('result * base % mod'),
      T(`;\n        base = base * base % mod;\n        exp >>= 1;\n    }\n    return result;\n}`)
    ],
    problems:[
      P('BISHI64','【模板】快速幂Ⅰ ‖ 整数','入门-8','3d624107a6904da1bd0e8c9c85e17167'),
      P('BISHI65','【模板】分数取模','入门-10','23839ef20d5f4dbaa9664daa51864291'),
      P('BISHI66','子数列求积', null, '5daab034da954f5697dcf96c1808d34f')
    ]
  },
  {
    id:'combinatorics', title:'组合数学：杨辉三角', badge:'数学 · 组合数学', height:280, render:'grid',
    explain:'组合数 C(n,k) 满足递推关系 C(n,k) = C(n-1,k-1) + C(n-1,k)：选不选第 n 个元素两种情况相加。按这个递推逐行填表（杨辉三角），比直接算阶乘再除更不容易溢出，也更适合需要取模的场景。',
    steps: buildPascalSteps(5),
    blankParts:[
      T(`vector<vector<long long>> C(n + 1, vector<long long>(n + 1, 0));\nfor (int i = 0; i <= n; i++) {\n    C[i][0] = 1;\n    for (int j = 1; j <= i; j++) {\n        C[i][j] = `),
      B('C[i - 1][j - 1] + C[i - 1][j]'),
      T(`;\n    }\n}`)
    ],
    problems:[
      P('BISHI67','穿搭大挑战','入门-6','cd190da0f3614a8393c84981a11d024e'),
      P('BISHI68','刷题统计','入门-8','99ddb1a6e71d47dcbbe4f272aba532b8'),
      P('BISHI69','[HNOI2008]越狱', null, '33d5016548d84cbe8cdb08ca0c13c2f1'),
      P('BISHI70','【模板】组合数', null, '53f82db091b2452bae5fef4437ffd0bb'),
      P('BISHI71','人员分组问题', null, '482f31bf028f46aa9b7882a4b921ffcf'),
      P('BISHI72','中位数之和', null, '4bc8c3535b8e488eb608c73f8946d9cb')
    ]
  },
  {
    id:'advanced-number-theory', title:'高级数论（选学，了解即可）', badge:'数学 · 进阶', brief:true,
    explain:'欧拉函数、乘法逆元、欧拉降幂都是竞赛/高难度笔试里才会出现的数论工具，用来处理"除法不能直接取模"之类的问题。日常校招笔试遇到的概率不高，建议先跳过，把时间留给后面的搜索和数据结构。',
    problems:[
      P('BISHI73','【模板】欧拉函数Ⅰ ‖ 单个整数','入门-11','6a22f91ad3904c6cbd624ae5ff6a4eac'),
      P('BISHI74','【模板】非质模数下的乘法逆元', null, '52328883c41f475c8eb228726af2ce2f'),
      P('BISHI75','【模板】欧拉降幂', null, 'da7a14c1a58b48bd80e63771b82e50c5')
    ]
  },
  {
    id:'dfs-permute', title:'DFS：用回溯生成全排列', badge:'搜索 · DFS', height:150, render:'array',
    explain:'DFS/回溯的核心动作是"选择 → 递归 → 撤销选择"。生成全排列时，每一层尝试把一个还没用过的数放进当前位置，递归填下一位；填满就是一个答案，然后撤销这一步的选择，换下一个数字继续试。',
    steps: buildPermuteDfsSteps([1,2,3]),
    blankParts:[
      T(`void dfs(int depth) {\n    if (depth == n) { /* 记录一个答案 */ return; }\n    for (int i = 0; i < n; i++) {\n        if (used[i]) continue;\n        `),
      B('used[i] = true'),
      T(`;\n        path[depth] = nums[i];\n        dfs(depth + 1);\n        `),
      B('used[i] = false'),
      T(`;   // 回溯\n    }\n}`)
    ],
    problems:[
      P('BISHI76','迷宫寻路','入门-7','0c8930e517444d04b426e9703d483ed4'),
      P('BISHI77','数水坑','入门-9','664ca4289fcf457ba3109fdf4a7a1a05'),
      P('BISHI78','全排列','入门-6','1d1fe38275da44b5848add89f9e223b1'),
      P('BISHI79','取数游戏', null, 'b002b8eb564245fdbb8a02db8dcf03e4')
    ]
  },
  {
    id:'bfs-maze', title:'BFS：网格最短路', badge:'搜索 · BFS', height:280, render:'grid',
    explain:'BFS 用队列一层一层向外扩展：先处理离起点最近的格子，再处理它们能到达的格子。因为是严格按距离顺序扩展的，第一次到达某个格子时记录的距离就是最短距离，这是 BFS 求无权图最短路的核心原因。',
    steps: buildBfsMazeSteps([[0,0,1,0],[0,1,0,0],[0,0,0,1],[1,0,0,0]]),
    blankParts:[
      T(`queue<pair<int,int>> q;\ndist[sr][sc] = 0;\nq.push({sr, sc});\nwhile (!q.empty()) {\n    auto [r, c] = q.front(); q.pop();\n    for (auto [dr, dc] : dirs) {\n        int nr = r + dr, nc = c + dc;\n        if (!valid(nr, nc) || maze[nr][nc] == 1 || dist[nr][nc] != -1) continue;\n        dist[nr][nc] = `),
      B('dist[r][c] + 1'),
      T(`;\n        `),
      B('q.push({nr, nc})'),
      T(`;\n    }\n}`)
    ],
    problems:[
      P('BISHI80','走迷宫','入门-9','e88b41dc6e764b2893bc4221777ffe64'),
      P('BISHI81','剪纸游戏', null, '33054daa2cc04fd6b97a0d18ccfc66a0'),
      P('BISHI82','没挡住洪水', null, '6d62436fda5f4ef997e68d1ce1dd6eb2'),
      P('BISHI83','迷宫问题','入门-11','cf24906056f4488c9ddb132f317e03bc'),
      P('BISHI84','时津风的资源收集', null, '5a6f83a0e0214ba5a77f6cdc71a3027b')
    ]
  }
];
