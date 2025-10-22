function fmt(x) {
  const n = Number(x);
  if (!isFinite(n)) return "NaN";
  const r = Math.round(n);
  return Math.abs(n - r) < 1e-9 ? String(r) : n.toFixed(4);
}

function renderMatrix(container, M) {
  const el = (typeof container === 'string') ? document.getElementById(container) : container;
  el.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'matrix';
  const table = document.createElement('table');
  M.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(v => {
      const td = document.createElement('td');
      td.textContent = fmt(v);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  wrap.appendChild(table);
  el.appendChild(wrap);
}

function createMatrixInputs(containerId, dim) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const tbl = document.createElement('table');
  for (let i = 0; i < dim; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < dim; j++) {
      const td = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.step = 'any';
      inp.value = (i === j) ? 1 : 0; // identidade como padrão
      td.appendChild(inp);
      tr.appendChild(td);
    }
    tbl.appendChild(tr);
  }
  const wrap = document.createElement('div');
  wrap.className = 'matrix';
  wrap.appendChild(tbl);
  container.appendChild(wrap);
}

function createMatrixInputsRC(containerId, rows, cols, init) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const tbl = document.createElement('table');
  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < cols; j++) {
      const td = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.step = 'any';
      let v = 0;
      if (typeof init === 'function') v = init(i, j);
      inp.value = isNaN(v) ? 0 : v;
      td.appendChild(inp);
      tr.appendChild(td);
    }
    tbl.appendChild(tr);
  }
  const wrap = document.createElement('div');
  wrap.className = 'matrix';
  wrap.appendChild(tbl);
  container.appendChild(wrap);
}

function readMatrix(containerId) {
  const container = document.getElementById(containerId);
  const inputs = container.querySelectorAll('input');
  const tbl = container.querySelector('table');
  const rows = tbl.querySelectorAll('tr').length;
  const firstRow = tbl.querySelector('tr');
  const cols = firstRow ? firstRow.querySelectorAll('td').length : 0;
  const M = [];
  let k = 0;
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const v = parseFloat(inputs[k++].value);
      row.push(isNaN(v) ? 0 : v);
    }
    M.push(row);
  }
  return M;
}

function addMatrices(A, B) {
  const m = A.length, n = A[0].length;
  if (B.length !== m || B[0].length !== n) throw new Error('Tamanhos incompatíveis para soma.');
  const C = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) C[i][j] = A[i][j] + B[i][j];
  return C;
}

function multiplyMatrices(A, B) {
  const m = A.length, n = A[0].length, p = B[0].length;
  if (B.length !== n) throw new Error('Tamanhos incompatíveis para multiplicação.');
  const C = Array.from({ length: m }, () => Array(p).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let s = 0;
      for (let k = 0; k < n; k++) s += A[i][k] * B[k][j];
      C[i][j] = s;
    }
  }
  return C;
}

function transposeMatrix(A) {
  const m = A.length, n = A[0].length;
  const T = Array.from({ length: n }, () => Array(m).fill(0));
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) T[j][i] = A[i][j];
  return T;
}

function det2x2(A) { return A[0][0]*A[1][1] - A[0][1]*A[1][0]; }

function det3x3(A) {
  const a=A[0][0], b=A[0][1], c=A[0][2], d=A[1][0], e=A[1][1], f=A[1][2], g=A[2][0], h=A[2][1], i=A[2][2];
  return a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
}

function determinant(A) {
  if (A.length === 2 && A[0].length === 2) return det2x2(A);
  if (A.length === 3 && A[0].length === 3) return det3x3(A);
  throw new Error('Determinante suportado apenas para 2×2 e 3×3 nesta demo.');
}

function inverse2x2(A) {
  const d = det2x2(A);
  if (Math.abs(d) < 1e-12) throw new Error('Matriz não invertível (determinante = 0).');
  const inv = [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]].map(row => row.map(v => v / d));
  return inv;
}

function minor2x2(A, r, c) {
  const m = [];
  for (let i = 0; i < 3; i++) if (i !== r) {
    const row = [];
    for (let j = 0; j < 3; j++) if (j !== c) row.push(A[i][j]);
    m.push(row);
  }
  // m é 2×2
  return det2x2(m);
}

function inverse3x3(A) {
  const d = det3x3(A);
  if (Math.abs(d) < 1e-12) throw new Error('Matriz não invertível (determinante = 0).');
  const C = Array.from({ length: 3 }, () => Array(3).fill(0));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const sign = ((i + j) % 2 === 0) ? 1 : -1;
    C[i][j] = sign * minor2x2(A, i, j);
  }
  const adj = transposeMatrix(C);
  return adj.map(row => row.map(v => v / d));
}

function inverse(A) {
  if (A.length === 2 && A[0].length === 2) return inverse2x2(A);
  if (A.length === 3 && A[0].length === 3) return inverse3x3(A);
  throw new Error('Inversa suportada apenas para 2×2 e 3×3 nesta demo.');
}

function clearResults() {
  const R = document.getElementById('results');
  R.innerHTML = '';
}

function addResult(title, content) {
  const R = document.getElementById('results');
  const card = document.createElement('div');
  card.className = 'section';
  const h = document.createElement('h4');
  h.textContent = title;
  card.appendChild(h);
  if (Array.isArray(content)) {
    const wrap = document.createElement('div');
    renderMatrix(wrap, content);
    card.appendChild(wrap);
  } else {
    const p = document.createElement('p');
    p.textContent = content;
    card.appendChild(p);
  }
  R.appendChild(card);
}

function generateByFormula(m, n, formula) {
  const M = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    const I = i + 1, J = j + 1;
    let v = 0;
    switch (formula) {
      case 'i+j': v = I + J; break;
      case 'i*j': v = I * J; break;
      case 'sign': v = ((I + J) % 2 === 0) ? 1 : -1; break;
      case 'identidade': v = (I === J) ? 1 : 0; break;
      default: v = 0;
    }
    M[i][j] = v;
  }
  return M;
}

function setupFormationPanel() {
  const rowsRange = document.getElementById('rows-range');
  const colsRange = document.getElementById('cols-range');
  const rowsVal = document.getElementById('rows-val');
  const colsVal = document.getElementById('cols-val');
  const formulaSelect = document.getElementById('formula-select');
  const genBtn = document.getElementById('gen-btn');
  const out = document.getElementById('form-matrix');

  function updateLabels() {
    rowsVal.textContent = rowsRange.value;
    colsVal.textContent = colsRange.value;
  }
  rowsRange.addEventListener('input', updateLabels);
  colsRange.addEventListener('input', updateLabels);
  updateLabels();

  function generate() {
    const m = parseInt(rowsRange.value, 10);
    const n = parseInt(colsRange.value, 10);
    const f = formulaSelect.value;
    const M = generateByFormula(m, n, f);
    out.innerHTML = '';
    renderMatrix(out, M);
  }
  genBtn.addEventListener('click', generate);
  generate(); // inicial
}

function setupOpsPanel() {
  const dimSel = document.getElementById('dim-select');
  const resetBtn = document.getElementById('reset-inputs');
  const sumBtn = document.getElementById('sum-btn');
  const mulBtn = document.getElementById('mul-btn');
  const transBtn = document.getElementById('trans-btn');
  const detBtn = document.getElementById('det-btn');
  const invBtn = document.getElementById('inv-btn');

  function rebuild() {
    const dim = parseInt(dimSel.value, 10);
    createMatrixInputs('A-input', dim);
    createMatrixInputs('B-input', dim);
    clearResults();
  }
  dimSel.addEventListener('change', rebuild);
  resetBtn.addEventListener('click', rebuild);
  rebuild();

  sumBtn.addEventListener('click', () => {
    try {
      const A = readMatrix('A-input');
      const B = readMatrix('B-input');
      addResult('A + B', addMatrices(A, B));
    } catch (e) { addResult('Erro', e.message); }
  });

  mulBtn.addEventListener('click', () => {
    try {
      const A = readMatrix('A-input');
      const B = readMatrix('B-input');
      addResult('A × B', multiplyMatrices(A, B));
    } catch (e) { addResult('Erro', e.message); }
  });

  transBtn.addEventListener('click', () => {
    try {
      const A = readMatrix('A-input');
      addResult('Transposta de A', transposeMatrix(A));
    } catch (e) { addResult('Erro', e.message); }
  });

  detBtn.addEventListener('click', () => {
    try {
      const A = readMatrix('A-input');
      const d = determinant(A);
      addResult('Determinante de A', `det(A) = ${fmt(d)}`);
    } catch (e) { addResult('Erro', e.message); }
  });

  invBtn.addEventListener('click', () => {
    try {
      const A = readMatrix('A-input');
      const invA = inverse(A);
      addResult('Inversa de A', invA);
    } catch (e) { addResult('Inversa de A', e.message); }
  });
}

function setupGfxDemo() {
  const rotRange = document.getElementById('rot-range');
  const scaleRange = document.getElementById('scale-range');
  const rotVal = document.getElementById('rot-val');
  const scaleVal = document.getElementById('scale-val');
  const canvas = document.getElementById('gfx-canvas');
  const matOut = document.getElementById('gfx-matrix');
  if (!rotRange || !scaleRange || !rotVal || !scaleVal || !canvas || !matOut) return;
  const ctx = canvas.getContext('2d');

  function draw() {
    const angleDeg = parseFloat(rotRange.value);
    const s = parseFloat(scaleRange.value);
    const angle = angleDeg * Math.PI / 180;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const M = [[s * cos, -s * sin], [s * sin, s * cos]]; // rotação + escala
    rotVal.textContent = fmt(angleDeg);
    scaleVal.textContent = fmt(s);

    matOut.innerHTML = '';
    renderMatrix(matOut, M);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // eixos
    ctx.strokeStyle = 'rgba(148,163,184,0.4)';
    ctx.beginPath();
    ctx.moveTo(-canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, 0);
    ctx.moveTo(0, -canvas.height / 2); ctx.lineTo(0, canvas.height / 2);
    ctx.stroke();

    const pts = [[-60, -60], [60, -60], [60, 60], [-60, 60]]; // quadrado

    // original
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    pts.forEach((p, i) => { const [x, y] = p; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.closePath();
    ctx.stroke();

    function apply(M, p) { return [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]]; }
    const tpts = pts.map(p => apply(M, p));

    // transformado
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    tpts.forEach((p, i) => { const [x, y] = p; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  rotRange.addEventListener('input', draw);
  scaleRange.addEventListener('input', draw);
  draw();
}

// Função removida pois as imagens agora são carregadas diretamente de arquivos JPEG

function setupLinearDemo() {
  const yOut = document.getElementById('lin-y');
  const btnReset = document.getElementById('lin-reset');
  const btnCalc = document.getElementById('lin-calc');
  if (!yOut || !btnReset || !btnCalc) return;

  function build() {
    createMatrixInputsRC('lin-W', 2, 2, (i, j) => (i === j ? 1 : 0));
    createMatrixInputsRC('lin-x', 2, 1, (i) => (i === 0 ? 1 : 0));
    createMatrixInputsRC('lin-b', 2, 1, () => 0);
    yOut.innerHTML = '';
  }

  function calc() {
    try {
      const W = readMatrix('lin-W');
      const X = readMatrix('lin-x');
      const B = readMatrix('lin-b');
      const Y = addMatrices(multiplyMatrices(W, X), B);
      yOut.innerHTML = '';
      renderMatrix(yOut, Y);
    } catch (e) {
      yOut.innerHTML = `<p>${e.message}</p>`;
    }
  }

  btnReset.addEventListener('click', build);
  btnCalc.addEventListener('click', calc);
  build();
  calc();
}
window.addEventListener('DOMContentLoaded', () => {
  setupFormationPanel();
  setupOpsPanel();
  setupGfxDemo();
  setupLinearDemo();
});