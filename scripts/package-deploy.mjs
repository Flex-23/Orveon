// سكربت تغليف النشر — ينتج orveon-deploy.zip جاهزاً للرفع على cPanel.
//
// الفكرة: وضع output:"standalone" في next.config.ts يجعل `next build` ينتج
// .next/standalone وفيه node_modules مصغّر (فقط ما يحتاجه الموقع وقت التشغيل).
// هذا السكربت يجمع كل ما يلزم السيرفر في مجلد deploy-package/ ثم يضغطه:
//   - .next/standalone (الكود + node_modules المصغّر)
//   - .next/static (ملفات الواجهة) + public (بدون uploads)
//   - lib/generated/prisma (محركات لينكس فقط — بدون dll ويندوز الضخم)
//   - sharp بنسخة لينكس (تحسين الصور next/image يحتاجها على السيرفر)
//   - server.js متوافق مع Passenger (نفس النمط المجرَّب: listen فوراً)
//
// الاستخدام:  npm run deploy:pack        (بناء + تغليف)
//             npm run deploy:pack:fast   (تغليف فقط — إذا البناء جاهز)
//
// النتيجة: ارفع orveon-deploy.zip لمجلد التطبيق على cPanel → Extract → Restart.
// لا حاجة لـ Run NPM Install على السيرفر إطلاقاً.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STANDALONE = path.join(ROOT, ".next", "standalone");
const STAGING = path.join(ROOT, "deploy-package");
const ZIP = path.join(ROOT, "orveon-deploy.zip");
const SHARP_CACHE = path.join(ROOT, "scripts", ".sharp-linux");

const log = (msg) => console.log(`[deploy-pack] ${msg}`);
const fail = (msg) => {
  console.error(`\n[deploy-pack] ❌ ${msg}\n`);
  process.exit(1);
};

// ---------- 0) فحوصات مسبقة ----------
if (!fs.existsSync(STANDALONE)) {
  fail(
    "مجلد .next/standalone غير موجود — نفّذ `npm run build` أولاً (أو استخدم npm run deploy:pack).",
  );
}
const generatedServerPath = path.join(STANDALONE, "server.js");
if (!fs.existsSync(generatedServerPath)) {
  fail(".next/standalone/server.js غير موجود — البناء لم يكتمل بنجاح.");
}

// ---------- 1) تجهيز مجلد التجميع ----------
fs.rmSync(STAGING, { recursive: true, force: true });
fs.rmSync(ZIP, { force: true });
fs.mkdirSync(STAGING, { recursive: true });

log("نسخ .next/standalone ...");
fs.cpSync(STANDALONE, STAGING, { recursive: true });

// تتبّع Next يجرّ ملفات لا مكان لها على السيرفر:
// - .env المحلي: أسرار التطوير يجب ألا تُرفع — مصدر الإعدادات الوحيد هو متغيرات cPanel.
// - ملفات توثيق/أدوات محلية لا يستخدمها وقت التشغيل.
for (const junk of [".env", ".env.local", ".env.development", ".env.production", "CLEANUP-REVIEW.md", "skills-lock.json", "scripts", "deploy-package", "orveon-deploy.zip"]) {
  fs.rmSync(path.join(STAGING, junk), { recursive: true, force: true });
}

// ---------- 2) server.js متوافق مع Passenger ----------
// نستخرج إعدادات Next المسلسلة من الملف الذي ولّده standalone (سطر const nextConfig = {...})
// ونحقنها في ملفنا المجرَّب: listen() فوراً + التجهيز بالخلفية + عرض خطأ الإقلاع في المتصفح.
const generatedServer = fs.readFileSync(generatedServerPath, "utf8");
const configMatch = generatedServer.match(/^const nextConfig = (.+)$/m);
if (!configMatch) {
  fail("تعذّر استخراج nextConfig من server.js المولَّد — تغيّر قالب Next؟ افحص .next/standalone/server.js");
}
const passengerServer = `// ملف التشغيل على السيرفر (وضع standalone) — مولَّد تلقائياً بواسطة scripts/package-deploy.mjs
// لا تعدّله يدوياً. نفس نمط الملف المجرَّب مع Passenger على cPanel:
// ينشئ السيرفر ويستدعي listen() فوراً، وتجهيز Next.js يجري بالخلفية.
var http = require('http');

// نعمل من مجلد التطبيق نفسه — Prisma (lib/generated) ورفع الملفات يعتمدان على process.cwd().
process.chdir(__dirname);
process.env.NODE_ENV = 'production';

// إعدادات Next.js محفوظة وقت البناء (بديل next.config.ts غير الموجود في حزمة standalone).
var nextConfig = ${configMatch[1]}
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

var next = require('next');
var app = next({ dev: false, dir: __dirname });
var handle = app.getRequestHandler();

// نبدأ تجهيز Next.js بالخلفية، والسيرفر يقلع فوراً مثل ملف cPanel التجريبي بالضبط.
var prepared = app.prepare();

var server = http.createServer(function (req, res) {
  prepared
    .then(function () {
      handle(req, res);
    })
    .catch(function (err) {
      // إن فشل إقلاع Next.js يظهر سبب الفشل بالمتصفح بدل شاشة بيضاء — يساعدنا نعرف الخطأ.
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('فشل تشغيل الموقع:\\n\\n' + (err && err.message ? err.message : String(err)));
    });
});

// نفس نداء الملف التجريبي: بدون منفذ محدد حتى تختاره الاستضافة بنفسها،
// وإذا وفّرت الاستضافة منفذاً عبر PORT نستخدمه.
server.listen(process.env.PORT);
`;
fs.writeFileSync(path.join(STAGING, "server.js"), passengerServer);
log("كتابة server.js المتوافق مع Passenger (مع إعدادات البناء المحقونة).");

// ---------- 3) الملفات الثابتة ----------
log("نسخ .next/static و public (بدون uploads) ...");
fs.cpSync(path.join(ROOT, ".next", "static"), path.join(STAGING, ".next", "static"), {
  recursive: true,
});
fs.cpSync(path.join(ROOT, "public"), path.join(STAGING, "public"), {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(path.join(ROOT, "public"), src);
    // نستثني محتوى uploads (ملفات المستخدمين على السيرفر يجب ألا تُمس) — نبقي المجلد نفسه فقط.
    if (rel.startsWith("uploads") && rel !== "uploads" && !rel.endsWith(".gitkeep")) return false;
    return true;
  },
});

// ---------- 4) عميل Prisma المولَّد (محركات لينكس فقط) ----------
log("نسخ lib/generated/prisma (محركات لينكس فقط) ...");
const prismaSrc = path.join(ROOT, "lib", "generated", "prisma");
if (!fs.existsSync(prismaSrc)) {
  fail("lib/generated/prisma غير موجود — نفّذ `npx prisma generate` أولاً.");
}
// تتبّع Next قد يكون نسخ المجلد كاملاً (بما فيه محرك ويندوز الضخم) — نحذفه وننسخ نسخة مفلترة.
fs.rmSync(path.join(STAGING, "lib", "generated", "prisma"), { recursive: true, force: true });
fs.cpSync(prismaSrc, path.join(STAGING, "lib", "generated", "prisma"), {
  recursive: true,
  filter: (src) => {
    const base = path.basename(src);
    // محرك ويندوز (~200MB مع ملفات tmp) بلا فائدة على السيرفر.
    if (base.startsWith("query_engine-windows")) return false;
    if (base.endsWith(".tmp")) return false;
    return true;
  },
});
const engines = fs
  .readdirSync(path.join(STAGING, "lib", "generated", "prisma"))
  .filter((f) => f.startsWith("libquery_engine-") && f.endsWith(".so.node"));
if (engines.length === 0) {
  fail(
    "لا يوجد محرك لينكس libquery_engine-*.so.node في lib/generated/prisma — تأكد أن binaryTargets في schema.prisma تشمل لينكس ثم نفّذ npx prisma generate.",
  );
}
log(`محركات Prisma لينكس: ${engines.join("، ")}`);

// ---------- 5) sharp بنسخة لينكس (تحسين الصور) ----------
// next/image يحتاج sharp وقت التشغيل. البناء على ويندوز يجلب نسخة ويندوز فقط،
// لذا ننزّل نسخة لينكس في مجلد كاش منفصل (لا يمسّ node_modules للمشروع) وندمجها.
const nextPkg = JSON.parse(
  fs.readFileSync(path.join(ROOT, "node_modules", "next", "package.json"), "utf8"),
);
const sharpSpec = nextPkg.optionalDependencies?.sharp;
if (!sharpSpec) fail("تعذّر معرفة نسخة sharp من حزمة next.");

const sharpMarker = path.join(SHARP_CACHE, ".spec");
const cacheValid =
  fs.existsSync(path.join(SHARP_CACHE, "node_modules", "@img", "sharp-linux-x64")) &&
  fs.existsSync(sharpMarker) &&
  fs.readFileSync(sharpMarker, "utf8") === sharpSpec;

if (!cacheValid) {
  log(`تنزيل sharp@${sharpSpec} بنسخة لينكس (مرة واحدة، تُحفظ في scripts/.sharp-linux) ...`);
  fs.rmSync(SHARP_CACHE, { recursive: true, force: true });
  fs.mkdirSync(SHARP_CACHE, { recursive: true });
  const npmArgs = [
    "install",
    `sharp@${sharpSpec}`,
    "--prefix",
    SHARP_CACHE,
    "--os=linux",
    "--cpu=x64",
    "--libc=glibc",
    "--no-save",
    "--no-audit",
    "--no-fund",
    "--ignore-scripts",
    "--loglevel=error",
  ];
  // نستدعي npm-cli.js مباشرة عبر node لتجنّب المرور بالصدفة (وتحذير DEP0190 على ويندوز).
  const npmCli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  const res = fs.existsSync(npmCli)
    ? spawnSync(process.execPath, [npmCli, ...npmArgs], { stdio: "inherit" })
    : spawnSync("npm", npmArgs, { stdio: "inherit", shell: process.platform === "win32" });
  if (res.status !== 0) {
    fail("فشل تنزيل sharp لينكس — تحقق من اتصال الإنترنت ثم أعد المحاولة.");
  }
  fs.writeFileSync(sharpMarker, sharpSpec);
}

log("دمج sharp لينكس في الحزمة ...");
const cacheNM = path.join(SHARP_CACHE, "node_modules");
const stagingNM = path.join(STAGING, "node_modules");
// حزمة sharp نفسها (غلاف JS) — نستبدل أي نسخة متتبَّعة لضمان تطابق النسخة مع المحركات.
fs.rmSync(path.join(stagingNM, "sharp"), { recursive: true, force: true });
fs.cpSync(path.join(cacheNM, "sharp"), path.join(stagingNM, "sharp"), { recursive: true });
// اعتماديات sharp الصغيرة — نضعها متداخلة داخل sharp/node_modules لتجنّب أي تعارض بالجذر.
const sharpDeps = fs
  .readdirSync(cacheNM)
  .filter((d) => d !== "sharp" && d !== "@img" && d !== ".bin" && d !== ".package-lock.json");
for (const dep of sharpDeps) {
  fs.cpSync(path.join(cacheNM, dep), path.join(stagingNM, "sharp", "node_modules", dep), {
    recursive: true,
  });
}
// محركات @img — ندمج نسخ لينكس مع أي نسخ موجودة (غلاف sharp يختار المناسبة حسب النظام).
for (const img of fs.readdirSync(path.join(cacheNM, "@img"))) {
  fs.cpSync(path.join(cacheNM, "@img", img), path.join(stagingNM, "@img", img), {
    recursive: true,
  });
}

// ---------- 6) تنظيف دفاعي ----------
// محركات SWC خاصة بالبناء فقط — إن تسرّبت للتتبّع فهي عشرات الميغابايت بلا فائدة.
if (fs.existsSync(path.join(stagingNM, "@next"))) {
  for (const d of fs.readdirSync(path.join(stagingNM, "@next"))) {
    if (d.startsWith("swc-")) {
      fs.rmSync(path.join(stagingNM, "@next", d), { recursive: true, force: true });
      log(`حذف @next/${d} (خاص بالبناء فقط).`);
    }
  }
}

// ---------- 7) فحوصات سلامة نهائية ----------
const mustExist = [
  ["server.js", "ملف الإقلاع"],
  [".next/BUILD_ID", "هوية البناء"],
  [".next/static", "ملفات الواجهة الثابتة"],
  ["node_modules/next/package.json", "حزمة next"],
  ["node_modules/@img/sharp-linux-x64", "محرك sharp لينكس"],
  ["node_modules/@img/sharp-libvips-linux-x64", "مكتبة libvips لينكس"],
  ["public", "مجلد public"],
  ["lib/generated/prisma/index.js", "عميل Prisma المولَّد"],
  ["package.json", "package.json"],
];
for (const [rel, label] of mustExist) {
  if (!fs.existsSync(path.join(STAGING, rel))) {
    fail(`فحص السلامة فشل: ${label} (${rel}) غير موجود في الحزمة.`);
  }
}
// يجب ألا تتسرب ملفات uploads من السيرفر المحلي إلى الحزمة.
const stagedUploads = path.join(STAGING, "public", "uploads");
if (fs.existsSync(stagedUploads)) {
  const leaked = fs.readdirSync(stagedUploads).filter((f) => f !== ".gitkeep");
  if (leaked.length > 0) {
    fail(`تسرّبت ملفات uploads إلى الحزمة: ${leaked.slice(0, 5).join("، ")} ...`);
  }
}
// لا أسرار محلية ولا محرك ويندوز في الحزمة.
if (fs.existsSync(path.join(STAGING, ".env"))) {
  fail("ملف .env تسرّب إلى الحزمة — يجب ألا يُرفع للسيرفر.");
}
const findWindowsEngines = (dir) => {
  let found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) found = found.concat(findWindowsEngines(p));
    else if (entry.name.startsWith("query_engine-windows")) found.push(p);
  }
  return found;
};
const winEngines = findWindowsEngines(STAGING);
if (winEngines.length > 0) {
  fail(`محرك Prisma ويندوز تسرّب إلى الحزمة: ${winEngines.join("، ")}`);
}

// ---------- 8) تعليمات داخل الحزمة ----------
fs.writeFileSync(
  path.join(STAGING, "DEPLOY-README.txt"),
  `حزمة نشر Orveon — جاهزة للتشغيل بدون npm install
=====================================================

أول مرة (الانتقال من الطريقة القديمة):
1) من File Manager احذف من مجلد التطبيق: node_modules و .next والملفات القديمة
   (لا تحذف أبداً: public/uploads و private-uploads و .htaccess)
2) ارفع orveon-deploy.zip إلى مجلد التطبيق ثم Extract هنا.
3) من Setup Node.js App تأكد أن Startup file هو server.js ثم اضغط Restart.

كل تحديث لاحق:
1) ارفع orveon-deploy.zip الجديد ثم Extract (يستبدل الملفات القديمة تلقائياً).
2) اضغط Restart.

⚠ لا تضغط "Run NPM Install" أبداً — كل شيء موجود داخل الحزمة.
⚠ متغيرات البيئة (DATABASE_URL, AUTH_SECRET, NODE_ENV) تبقى من إعدادات cPanel كما هي.
`,
);

// ---------- 9) الضغط ----------
log("ضغط الحزمة إلى orveon-deploy.zip ...");
let zipped = false;
const tarRes = spawnSync("tar", ["-a", "-c", "-f", ZIP, "-C", STAGING, "."], {
  stdio: "inherit",
});
zipped = tarRes.status === 0 && fs.existsSync(ZIP);
if (!zipped) {
  log("tar غير متاح — استخدام Compress-Archive (أبطأ) ...");
  const psRes = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${STAGING}\\*' -DestinationPath '${ZIP}' -Force`,
    ],
    { stdio: "inherit" },
  );
  zipped = psRes.status === 0 && fs.existsSync(ZIP);
}
if (!zipped) fail("فشل إنشاء ملف zip.");

// ---------- 10) الملخص ----------
const dirSize = (dir) => {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    total += entry.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return total;
};
const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`;
console.log(`
[deploy-pack] ✅ اكتمل التغليف بنجاح
  الحزمة المفكوكة : ${mb(dirSize(STAGING))}  (deploy-package/)
  ملف الرفع       : ${mb(fs.statSync(ZIP).size)}  (orveon-deploy.zip)

الخطوات على cPanel:
  1) ارفع orveon-deploy.zip إلى مجلد التطبيق (File Manager)
  2) Extract في نفس المجلد
  3) Restart من صفحة Setup Node.js App
  — بدون Run NPM Install. التفاصيل في DEPLOY.md
`);
