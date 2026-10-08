// محدّد معدل بسيط في الذاكرة (نافذة ثابتة) — يحمي الدخول/التسجيل من التخمين بالقوة.
// يكفي لخادم Node واحد (التخزين المحلي في public/uploads يعني أصلاً خادماً واحداً).
// عند التوسّع لعدة خوادم استبدل الـ Map بمخزن مشترك (Redis) بنفس التوقيع.
import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** حذف الدلاء المنتهية حتى لا تتضخم الذاكرة (يُستدعى كسولاً عند الكبر). */
function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

/**
 * يسجّل محاولة على المفتاح ويعيد هل ما زالت ضمن الحد.
 * @param key    معرّف الدلو (مثل `login:ip:1.2.3.4`)
 * @param max    أقصى عدد محاولات ضمن النافذة
 * @param windowMs طول النافذة بالمللي ثانية
 */
export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (buckets.size > 5_000) sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (bucket.count >= max) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** تصفير عدّاد مفتاح (بعد دخول ناجح مثلاً حتى لا تُحسب المحاولات الصحيحة). */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}
