/* ---------- 步骤数据生成 ---------- */
function buildBinarySearchSteps(arr, target){
  let lo = 0, hi = arr.length - 1;
  const steps = [];
  function pointers(mid){
    const groups = {};
    const add = (idx, label, color) => {
      if(!groups[idx]) groups[idx] = {idx, labels:[], color};
      groups[idx].labels.push(label);
    };
    add(lo, 'lo', 'accent');
    add(hi, 'hi', 'warm');
    if(mid !== null) add(mid, 'mid', 'ok');
    return Object.values(groups).map(g => ({idx:g.idx, label:g.labels.join('='), color:g.color}));
  }
  const snap = (msg, mid) => steps.push({
    rows:[{ label:`arr[]（有序，target=${target}）`, values:arr.slice(), pointers:pointers(mid) }],
    message: msg
  });
  snap(`初始化 lo=0, hi=${hi}`, null);
  while(lo <= hi){
    const mid = Math.floor((lo + hi) / 2);
    if(arr[mid] === target){
      snap(`mid=${mid}, arr[mid]=${arr[mid]} = target，找到了！`, mid);
      return steps;
    } else if(arr[mid] < target){
      snap(`mid=${mid}, arr[mid]=${arr[mid]} < target，答案在右半边，lo 变成 mid+1`, mid);
      lo = mid + 1;
    } else {
      snap(`mid=${mid}, arr[mid]=${arr[mid]} > target，答案在左半边，hi 变成 mid-1`, mid);
      hi = mid - 1;
    }
  }
  snap('lo > hi，区间为空，说明数组里没有 target', null);
  return steps;
}

function buildMemoSteps(n){
  const memo = new Array(n + 1).fill(null);
  const steps = [];
  const snap = (msg, hi) => steps.push({ rows:[{label:'memo[]', values:memo.slice(), highlights:hi || {}}], message: msg });
  function fib(k){
    if(k <= 1){
      memo[k] = k;
      snap(`fib(${k})：边界条件，直接返回 ${k}`, {[k]:'warm'});
      return k;
    }
    if(memo[k] !== null){
      snap(`fib(${k})：memo 里已经算过，直接返回缓存值 ${memo[k]}，不用重新递归`, {[k]:'ok'});
      return memo[k];
    }
    snap(`fib(${k})：memo 里没有，递归计算 fib(${k-1}) + fib(${k-2})`, {});
    const val = fib(k - 1) + fib(k - 2);
    memo[k] = val;
    snap(`fib(${k}) 计算完成 = ${val}，存入 memo[${k}]`, {[k]:'warm'});
    return val;
  }
  snap(`求 fib(${n})，用 memo 数组记录算过的结果，避免重复递归`, {});
  fib(n);
  snap(`计算完成，fib(${n}) = ${memo[n]}`, {[n]:'ok'});
  return steps;
}

function buildTreeTraversalSteps(tree, mode, label){
  const output = [];
  const steps = [];
  const snap = msg => steps.push({ rows:[{label:`${label} 输出`, values:output.slice()}], message: msg });
  function visit(node){
    if(!node) return;
    if(mode === 'pre'){ output.push(node.val); snap(`访问节点 ${node.val}（先序：根→左→右，一进入节点就记录）`); }
    visit(node.left);
    if(mode === 'in'){ output.push(node.val); snap(`访问节点 ${node.val}（中序：左→根→右，左子树处理完才记录根）`); }
    visit(node.right);
    if(mode === 'post'){ output.push(node.val); snap(`访问节点 ${node.val}（后序：左→右→根，两个子树都处理完才记录根）`); }
  }
  snap(`开始${label}遍历`);
  visit(tree);
  snap(`遍历完成：[${output.join(',')}]`);
  return steps;
}

function buildUnionFindSteps(n, unions, findX){
  const parent = Array.from({length:n}, (_, i) => i);
  const steps = [];
  const snap = (msg, hi) => steps.push({ rows:[{label:'parent[]', values:parent.slice(), highlights:hi || {}}], message: msg });
  function find(x, pathHi){
    if(parent[x] === x) return x;
    const r = find(parent[x], pathHi);
    pathHi[x] = 'accent';
    parent[x] = r;
    return r;
  }
  snap('初始化：每个节点的 parent 指向自己', {});
  unions.forEach(([a,b]) => {
    const ra = find(a, {});
    const rb = find(b, {});
    if(ra !== rb){
      parent[ra] = rb;
      snap(`union(${a}, ${b})：find(${a})=${ra}, find(${b})=${rb}，不同集合，合并：parent[${ra}] = ${rb}`, {[ra]:'warm', [rb]:'ok'});
    } else {
      snap(`union(${a}, ${b})：已经在同一个集合（根都是 ${ra}），不用合并`, {[ra]:'muted'});
    }
  });
  const pathHi = {};
  const root = find(findX, pathHi);
  snap(`find(${findX})：沿途做路径压缩，让路径上的节点直接指向根 ${root}，下次查询更快`, Object.assign({}, pathHi, {[root]:'ok'}));
  return steps;
}

/* ---------- 题型数据 ---------- */
const TOPICS = [
  {
    id:'binary-search', title:'二分查找', badge:'搜索 · 二分', height:150, render:'array',
    explain:'在有序数组里找目标值：每次看中间元素，比目标大就去左半边找，比目标小就去右半边找，每次都能排除一半的候选，O(log n) 就能找到答案。',
    steps: buildBinarySearchSteps([2,5,8,12,16,23,38,45,56,72,91], 45),
    blankParts:[
      T(`int lo = 0, hi = n - 1;\nwhile (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (arr[mid] == target) return mid;\n    else if (`),
      B('arr[mid] < target'),
      T(`) lo = mid + 1;\n    else `),
      B('hi = mid - 1'),
      T(`;\n}\nreturn -1;`)
    ],
    problems:[
      P('BISHI85','【模板】整数域二分','入门-8','d483ab6bf19245518730a75c6ea108ae'),
      P('BISHI86','圆覆盖','入门-11','4f96afe5dfe74dad88dbe419d33f9536'),
      P('BISHI87','[CQOI2010]扑克牌', null, 'b77ff162bbab446993913fd684489cde'),
      P('BISHI88','小苯的魔法染色','入门-0','2e27509b990d4d02a70c0f208f078cdf'),
      P('BISHI89','山峰数组计数', null, 'aac1989d183d4e6daf6ee2e1ca62b50c')
    ]
  },
  {
    id:'memo-search', title:'记忆化搜索', badge:'搜索 · 记忆化/剪枝', height:150, render:'array',
    explain:'递归里如果同一个子问题会被算很多遍（比如朴素递归求斐波那契），可以开一个数组把算过的结果存起来。下次再递归到同一个子问题时直接查表返回，不用重新展开整棵递归树——这就是"记忆化搜索"。',
    steps: buildMemoSteps(5),
    blankParts:[
      T(`int memo[N]; // 初始化为 -1\nint fib(int k) {\n    if (k <= 1) return k;\n    if (`),
      B('memo[k] != -1'),
      T(`) return memo[k];   // 缓存命中，直接用\n    memo[k] = `),
      B('fib(k - 1) + fib(k - 2)'),
      T(`;   // 没算过，递归并记录\n    return memo[k];\n}`)
    ],
    problems:[
      P('BISHI90','【模板】记忆化搜索', null, '211c9fa6ea984185a16c6005e9793736'),
      P('BISHI91','拼接木棍', null, 'e0f5370bf8bb4d7d9c89c832c30da460')
    ]
  },
  {
    id:'string-match', title:'字符串匹配算法（选学）', badge:'搜索 · 字符串匹配', brief:true,
    explain:'KMP（前缀函数）、Trie 字典树、Manacher（马拉车）都是专门优化字符串匹配/查找的经典算法，属于"背模板"性质的进阶内容。第一轮时间紧可以先跳过，等核心套路都过完一遍再回来补。',
    problems:[
      P('BISHI92','【模板】前缀函数（kmp）', null, 'f347bf9d731d47a0bc87bc7e2415cef1'),
      P('BISHI93','【模板】Trie 字典树', null, 'feed1cd7546a4901965751b9fbf5f8a1'),
      P('BISHI94','【模板】马拉车算法', null, 'c01a7b5e88e544db841a009a035bd125')
    ]
  },
  {
    id:'tree-traversal', title:'树的遍历', badge:'树图 · 遍历', height:150, render:'array',
    explain:'二叉树三种遍历的区别只在"什么时候记录根节点"：先序是进节点就记录（根→左→右），中序是处理完左子树再记录（左→根→右），后序是两个子树都处理完才记录（左→右→根）。递归结构完全一样，只是记录的位置不同。',
    steps: buildTreeTraversalSteps({val:1,left:{val:2,left:{val:4},right:{val:5}},right:{val:3}}, 'pre', '先序'),
    blankParts:[
      T(`void preorder(Node* root) {\n    if (!root) return;\n    `),
      B('cout << root->val'),
      T(`;      // 先序：根→左→右\n    preorder(root->left);\n    preorder(root->right);\n}\nvoid inorder(Node* root) {\n    if (!root) return;\n    inorder(root->left);\n    `),
      B('cout << root->val'),
      T(`;      // 中序：左→根→右\n    inorder(root->right);\n}\nvoid postorder(Node* root) {\n    if (!root) return;\n    postorder(root->left);\n    postorder(root->right);\n    `),
      B('cout << root->val'),
      T(`;      // 后序：左→右→根\n}`)
    ],
    problems:[
      P('BISHI95','【模板】链式前向星','入门-8','23f622c8b15f4b37bffe1a986eeea185'),
      P('BISHI96','先序遍历、中序遍历和后序遍历', null, '15fdb346838545d0b272e43957e1cb2a'),
      P('BISHI97','旺仔哥哥走迷宫','入门-10','4b4ee516c23d4bd2b838646363b5c395'),
      P('BISHI98','谍中谍中谍中谍中谍...','入门-9','ee1246384c9b4066b67043ebb37fd9c9'),
      P('BISHI99','我朋友的朋友不是我的朋友', null, '9656866233614f4191f5555a0cdcae4b'),
      P('BISHI100','二分图判定','入门-11','f4b8d0481c7b4278b9b406b636e3c7db'),
      P('BISHI101','世界树上找米库', null, '9dd512f784b24ece85c81600aa3bc06c')
    ]
  },
  {
    id:'union-find', title:'并查集', badge:'树图 · 并查集', height:150, render:'array',
    explain:'并查集用一个 parent 数组维护若干集合，每个集合用一个"根"代表。find(x) 顺着 parent 往上找根，顺手把沿途节点直接接到根上（路径压缩）；union(a,b) 找到两边的根，把一个根接到另一个根上，就完成合并。',
    steps: buildUnionFindSteps(6, [[0,1],[2,3],[1,2],[4,5]], 0),
    blankParts:[
      T(`int find(int x) {\n    if (parent[x] == x) return x;\n    return `),
      B('parent[x] = find(parent[x])'),
      T(`;  // 路径压缩：顺手把 x 的父亲改成根\n}\nvoid unite(int a, int b) {\n    int ra = find(a), rb = find(b);\n    if (`),
      B('ra != rb'),
      T(`) parent[ra] = rb;\n}`)
    ],
    problemNote:'BISHI105 是下一部分"最短路"的第一题，提前放这里当预告，Day6 会正式讲。',
    problems:[
      P('BISHI102','【模板】并查集', null, '513111e4477c4fad8f19f14d4cdf49dc'),
      P('BISHI103','【模板】有依赖的背包问题', null, 'f0a110f831de4cc6bebc6243a26166e6'),
      P('BISHI104','修复公路', null, '8111efc8c04d472da349b6e5010e1951'),
      P('BISHI105','【模板】单源最短路Ⅰ ‖ 无权图','入门-11','359e14832ce1476fadc70dd4bc36b991')
    ]
  }
];
