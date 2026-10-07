const fs = require('fs');

const cssFile = 'frontend/src/index.css';
const htmlFile = 'frontend/index.html';
const appFile = 'frontend/src/App.jsx';
const loader3File = 'frontend/src/components/ui/loader-3.jsx';

const s = 4/3;
const p = (v) => Math.round(v * s) + 'px';

const css = `.loader-container {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #000000;
  z-index: 9999;
}

.loader {
  --duration: 3200ms;
  width: ${p(150)};
  height: ${p(150)};
  position: relative;
}

.loader::before,
.loader::after {
  content: '';
  position: absolute;
  background: #ffffff;
}

.box {
  position: absolute;
  animation: var(--duration) linear forwards infinite;
  transform: translate(var(--x), var(--y));
  will-change: transform;
  backface-visibility: hidden;
}

.box > div {
  width: ${p(48)};
  height: ${p(48)};
  position: relative;
  transform-style: preserve-3d;
  animation: var(--duration) ease forwards infinite;
  transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);
  background: #2563eb;
  will-change: transform;
  backface-visibility: hidden;
}

.box > div::before,
.box > div::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
  backface-visibility: hidden;
}

.box > div::before {
  top: 100%;
  left: 0;
  transform: rotateX(-90deg);
  background: #2563eb;
  filter: brightness(1.15);
}

.box > div::after {
  top: 0;
  left: 100%;
  transform: rotateY(90deg);
  background: #2563eb;
  filter: brightness(1.4);
}

.box0 { --x: ${p(-220)}; --y: ${p(-120)}; left: ${p(58)}; top: ${p(108)}; animation-name: box-move0; }
.box0 > div { animation-name: box-scale0; }

.box1 { --x: ${p(-260)}; --y: ${p(120)}; left: ${p(25)}; top: ${p(120)}; animation-name: box-move1; }
.box1 > div { animation-name: box-scale1; }

.box2 { --x: ${p(120)}; --y: ${p(-190)}; left: ${p(58)}; top: ${p(64)}; animation-name: box-move2; }
.box2 > div { animation-name: box-scale2; }

.box3 { --x: ${p(280)}; --y: ${p(-40)}; left: ${p(91)}; top: ${p(120)}; animation-name: box-move3; }
.box3 > div { animation-name: box-scale3; }

.box4 { --x: ${p(60)}; --y: ${p(200)}; left: ${p(58)}; top: ${p(132)}; animation-name: box-move4; }
.box4 > div { animation-name: box-scale4; }

.box5 { --x: ${p(-220)}; --y: ${p(-120)}; left: ${p(25)}; top: ${p(76)}; animation-name: box-move5; }
.box5 > div { animation-name: box-scale5; }

.box6 { --x: ${p(-260)}; --y: ${p(120)}; left: ${p(91)}; top: ${p(76)}; animation-name: box-move6; }
.box6 > div { animation-name: box-scale6; }

.box7 { --x: ${p(-240)}; --y: ${p(200)}; left: ${p(58)}; top: ${p(87)}; animation-name: box-move7; }
.box7 > div { animation-name: box-scale7; }

.ground {
  position: absolute;
  width: ${p(150)};
  height: ${p(150)};
  left: ${p(20)};
  top: ${p(60)};
  transform-style: preserve-3d;
  transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg);
  will-change: transform;
}

.ground > div {
  width: 100%;
  height: 100%;
  background: #ffffff;
  opacity: 0;
  animation: ground-shine var(--duration) linear infinite forwards;
}

@keyframes box-move0 { 12% { transform: translate(var(--x), var(--y)); } 25%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, ${p(-32)}); } 90%, 100% { transform: translate(0, ${p(188)}); } }
@keyframes box-scale0 { 6% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 14%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move1 { 16% { transform: translate(var(--x), var(--y)); } 29%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, ${p(-32)}); } 90%, 100% { transform: translate(0, ${p(188)}); } }
@keyframes box-scale1 { 10% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 18%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move2 { 20% { transform: translate(var(--x), var(--y)); } 33%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, ${p(-32)}); } 90%, 100% { transform: translate(0, ${p(188)}); } }
@keyframes box-scale2 { 14% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 22%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move3 { 24% { transform: translate(var(--x), var(--y)); } 37%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, ${p(-32)}); } 90%, 100% { transform: translate(0, ${p(188)}); } }
@keyframes box-scale3 { 18% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 26%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move4 { 28% { transform: translate(var(--x), var(--y)); } 41%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, ${p(-32)}); } 90%, 100% { transform: translate(0, ${p(188)}); } }
@keyframes box-scale4 { 22% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 30%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move5 { 32% { transform: translate(var(--x), var(--y)); } 45%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, ${p(-32)}); } 90%, 100% { transform: translate(0, ${p(188)}); } }
@keyframes box-scale5 { 26% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 34%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move6 { 36% { transform: translate(var(--x), var(--y)); } 49%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, ${p(-32)}); } 90%, 100% { transform: translate(0, ${p(188)}); } }
@keyframes box-scale6 { 30% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 38%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
@keyframes box-move7 { 40% { transform: translate(var(--x), var(--y)); } 49%, 53% { transform: translate(0, 0); } 80% { transform: translate(0, ${p(-32)}); } 90%, 100% { transform: translate(0, ${p(188)}); } }
@keyframes box-scale7 { 34% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 42%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }

@keyframes ground-shine { 0%, 70% { opacity: 0; } 75%, 87% { opacity: 0.15; } 100% { opacity: 0; } }`;

// Fix index.css
let indexCss = fs.readFileSync(cssFile, 'utf8');
const startCss = indexCss.indexOf('.loader-container');
const endCss = indexCss.lastIndexOf('}') + 1;
// Replace everything from .loader-container to end
indexCss = indexCss.substring(0, startCss) + css + '\n';
fs.writeFileSync(cssFile, indexCss);

// Fix index.html
let indexHtml = fs.readFileSync(htmlFile, 'utf8');
indexHtml = indexHtml.replace(/<style>[\s\S]*?<\/style>/, '<style>\n' + css + '\n    </style>');
indexHtml = indexHtml.replace(/<div class="loader">[\s\S]*?<script type="module"/, `<div class="loader">
          <div class="box box0"><div></div></div>
          <div class="box box1"><div></div></div>
          <div class="box box2"><div></div></div>
          <div class="box box3"><div></div></div>
          <div class="box box4"><div></div></div>
          <div class="box box5"><div></div></div>
          <div class="box box6"><div></div></div>
          <div class="box box7"><div></div></div>
          <div class="ground"><div></div></div>
        </div>
      </div>
    </div>
    <script type="module"`);
fs.writeFileSync(htmlFile, indexHtml);

// Fix App.jsx
let appJsx = fs.readFileSync(appFile, 'utf8');
appJsx = appJsx.replace(/<div className="loader">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `<div className="loader">
        <div className="box box0"><div></div></div>
        <div className="box box1"><div></div></div>
        <div className="box box2"><div></div></div>
        <div className="box box3"><div></div></div>
        <div className="box box4"><div></div></div>
        <div className="box box5"><div></div></div>
        <div className="box box6"><div></div></div>
        <div className="box box7"><div></div></div>
        <div className="ground"><div></div></div>
      </div>
    </div>
  </div>`);
fs.writeFileSync(appFile, appJsx);

// Fix loader-3.jsx
let loader3Jsx = fs.readFileSync(loader3File, 'utf8');
loader3Jsx = loader3Jsx.replace(/<div className="loader">[\s\S]*?<\/div>\s*<\/div>/, `<div className="loader">
        <div className="box box0"><div></div></div>
        <div className="box box1"><div></div></div>
        <div className="box box2"><div></div></div>
        <div className="box box3"><div></div></div>
        <div className="box box4"><div></div></div>
        <div className="box box5"><div></div></div>
        <div className="box box6"><div></div></div>
        <div className="box box7"><div></div></div>
        <div className="ground"><div></div></div>
      </div>
    </div>`);
fs.writeFileSync(loader3File, loader3Jsx);
