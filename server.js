// ملف التشغيل على السيرفر — مبني على نفس بنية ملف cPanel التجريبي الذي يعمل عندك:
// ينشئ السيرفر ويستدعي listen() فوراً بنفس الطريقة، لكنه يسلّم الطلبات لموقع Next.js.
// المتطلبات على السيرفر: node_modules (Run NPM Install) + مجلد .next (npm run build) + Node 20.9 أو أحدث.
var http = require('http');
var next = require('next');

var app = next({ dev: false, dir: __dirname });
var handle = app.getRequestHandler();

// نبدأ تجهيز Next.js بالخلفية، والسيرفر يقلع فوراً مثل الملف التجريبي بالضبط.
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
      res.end('فشل تشغيل الموقع:\n\n' + (err && err.message ? err.message : String(err)));
    });
});

// نفس نداء الملف التجريبي: بدون منفذ محدد حتى تختاره الاستضافة بنفسها،
// وإذا وفّرت الاستضافة منفذاً عبر PORT نستخدمه.
server.listen(process.env.PORT);
