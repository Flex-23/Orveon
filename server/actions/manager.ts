"use server";

// إجراءات لوحة المدير: إضافة أدمن، إضافة مشترك، الحظر.
import { randomInt } from "node:crypto";
import { unlink } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireManager,
  requireStaff,
  requirePermission,
  requireDuesAccess,
} from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import { encryptCredential } from "@/lib/auth/credential-crypto";
import {
  buildWhatsAppLink,
  buildWelcomeMessage,
  buildAdminWelcomeMessage,
} from "@/lib/whatsapp";
import { savePrivateFile, resolvePrivateFile, DOC_EXT } from "@/lib/storage";
import { getId, getTrimmed } from "@/lib/form";
import { hasPermission, isManager, type Permission } from "@/lib/auth/permissions";

const MIN_PASSWORD = 8;

export type ManagerActionState = {
  error?: string;
  success?: string;
  whatsappLink?: string;
  credentials?: { username: string; password: string };
  fieldErrors?: Record<string, string>;
  // القيم المُدخَلة تُعاد عند الخطأ لإبقاء الحقول معبّأة (لا يُفرّغ النموذج).
  values?: Record<string, string>;
};

// أبجدية اسم المستخدم: أحرف إنجليزية كبيرة + أرقام، بلا الرموز الملتبسة (0/O/1/I/L).
const USERNAME_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ";
const USERNAME_DIGITS = "23456789";

/**
 * يولّد اسم مستخدم عشوائياً قوياً يمزج أحرفاً إنجليزية وأرقاماً (8 خانات افتراضاً)،
 * مع ضمان وجود حرف ورقم على الأقل، باستخدام عشوائية تشفيرية (crypto).
 */
function randomUsername(len = 8): string {
  const all = USERNAME_LETTERS + USERNAME_DIGITS;
  let out = "";
  for (let i = 0; i < len; i++) out += all[randomInt(all.length)];

  // اضمن مزيجاً من حرف ورقم على الأقل
  if (!/[A-Z]/.test(out) || !/[0-9]/.test(out)) {
    const chars = out.split("");
    const li = randomInt(len);
    let di = randomInt(len);
    if (di === li) di = (di + 1) % len;
    chars[li] = USERNAME_LETTERS[randomInt(USERNAME_LETTERS.length)];
    chars[di] = USERNAME_DIGITS[randomInt(USERNAME_DIGITS.length)];
    out = chars.join("");
  }
  return out;
}

/**
 * يولّد اسم مستخدم فريداً للمشترك (أحرف + أرقام) يستخدمه عند تسجيل الدخول.
 * نتأكد ألّا يتعارض مع اسم مستخدم أو رقم هاتف موجود حتى يبقى الدخول واضحاً.
 */
async function generateUniqueUsername(): Promise<string> {
  for (let i = 0; i < 25; i++) {
    const candidate = randomUsername(8);
    const clash = await prisma.user.findFirst({
      where: { OR: [{ loginCode: candidate }, { phone: candidate }] },
      select: { id: true },
    });
    if (!clash) return candidate;
  }
  // احتياط شبه مؤكد الفرادة — طول أكبر
  return randomUsername(10);
}

/** يقرأ مبلغاً مالياً غير سالب من النموذج (أرقام فقط)، أو 0 إن كان فارغاً/غير صالح. */
function getAmount(formData: FormData, key: string): number {
  const n = Number(getTrimmed(formData, key));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** يقرأ تاريخاً اختيارياً من النموذج، أو null إن كان فارغاً/غير صالح. */
function getOptionalDate(formData: FormData, key: string): Date | null {
  const raw = getTrimmed(formData, key);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

const PERMISSION_KEYS: Permission[] = [
  "canAccessDashboard",
  "canManageProducts",
  "canManageOrders",
  "canManageReservations",
  "canManageMembers",
  "canManageDues",
  "canManageServices",
  "canManageContent",
  "canManageProjects",
];

// ---------------------- إضافة أدمن ----------------------
export async function createAdminAction(
  _prev: ManagerActionState,
  formData: FormData,
): Promise<ManagerActionState> {
  await requireManager();

  const name = getTrimmed(formData, "name");
  const phone = getTrimmed(formData, "phone");
  const password = String(formData.get("password") ?? "");
  const perms = Object.fromEntries(
    PERMISSION_KEYS.map((k) => [k, formData.get(k) === "on"]),
  );
  // نعيد القيم (والصلاحيات المختارة) عند الخطأ حتى لا يُفرّغ النموذج.
  const values: Record<string, string> = {
    name,
    phone,
    password,
    ...Object.fromEntries(PERMISSION_KEYS.map((k) => [k, perms[k] ? "on" : ""])),
  };

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "الاسم مطلوب";
  if (phone.length < 10) fieldErrors.phone = "رقم غير صالح";
  if (password.length < MIN_PASSWORD)
    fieldErrors.password = `كلمة المرور قصيرة (${MIN_PASSWORD} أحرف على الأقل)`;
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) return { fieldErrors: { phone: "هذا الرقم مسجّل مسبقاً" }, values };

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      name,
      phone,
      role: "admin",
      passwordHash,
      // نسخة مشفَّرة قابلة للاسترجاع — يعرضها المدير في التفاصيل ويرسلها عبر واتساب.
      passwordEnc: encryptCredential(password),
      loginCode: phone,
      permissions: { create: perms },
    },
  });

  // رسالة ترحيب + بيانات الدخول + رابط صفحة الحساب — تُرسَل عبر زر واتساب في الواجهة
  // (نفس نمط المشتركين: كلمة المرور لا تُحفَظ، تظهر مرة واحدة ضمن هذا الرد فقط).
  const message = buildAdminWelcomeMessage({ name, phone, password });
  const whatsappLink = buildWhatsAppLink(phone, message);

  revalidatePath("/dashboard/manager/admins");
  return {
    success: `تم إنشاء حساب الأدمن «${name}». يدخل بالرقم وكلمة المرور — استخدم الزر لإرسال البيانات عبر واتساب.`,
    whatsappLink,
    credentials: { username: phone, password },
  };
}

// ---------------------- تعديل أدمن ----------------------
export async function updateAdminAction(
  _prev: ManagerActionState,
  formData: FormData,
): Promise<ManagerActionState> {
  await requireManager();

  const adminId = getId(formData, "adminId");
  if (adminId === null) return { error: "معرّف الأدمن غير صالح." };

  const name = getTrimmed(formData, "name");
  const phone = getTrimmed(formData, "phone");
  const password = String(formData.get("password") ?? ""); // اختياري عند التعديل

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "الاسم مطلوب";
  if (phone.length < 10) fieldErrors.phone = "رقم غير صالح";
  if (password && password.length < MIN_PASSWORD)
    fieldErrors.password = `كلمة المرور قصيرة (${MIN_PASSWORD} أحرف على الأقل)`;
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  // الرقم فريد — استثنِ الأدمن نفسه
  const clash = await prisma.user.findFirst({
    where: { phone, NOT: { id: adminId } },
  });
  if (clash) return { fieldErrors: { phone: "هذا الرقم مسجّل مسبقاً" } };

  const perms = Object.fromEntries(
    PERMISSION_KEYS.map((k) => [k, formData.get(k) === "on"]),
  );

  await prisma.user.update({
    where: { id: adminId },
    data: {
      name,
      phone,
      loginCode: phone,
      ...(password
        ? {
            passwordHash: await hashPassword(password),
            passwordEnc: encryptCredential(password),
          }
        : {}),
      permissions: { upsert: { create: perms, update: perms } },
    },
  });

  revalidatePath("/dashboard/manager/admins");
  revalidatePath(`/dashboard/manager/admins/${adminId}`);
  return { success: `تم تحديث بيانات الأدمن «${name}».` };
}

// ---------------------- حذف أدمن ----------------------
export async function deleteAdminAction(formData: FormData) {
  await requireManager(); // حذف الأدمن للمدير فقط
  const adminId = getId(formData, "adminId");
  if (adminId === null) return;

  // نحذف الأدمن فقط — منعاً لحذف مدير/مشترك بالخطأ.
  const target = await prisma.user.findUnique({
    where: { id: adminId },
    select: { role: true },
  });
  if (!target || target.role !== "admin") return;

  await prisma.user.delete({ where: { id: adminId } });
  revalidatePath("/dashboard/manager/admins");
}

// ---------------------- إضافة مشترك ----------------------
export async function createSubscriberAction(
  _prev: ManagerActionState,
  formData: FormData,
): Promise<ManagerActionState> {
  // المدير أو الأدمن صاحب صلاحية إدارة المشتركين
  const actor = await requirePermission("canManageMembers");

  const name = getTrimmed(formData, "name");
  const phone = getTrimmed(formData, "phone");
  const serviceName = getTrimmed(formData, "serviceName");
  const code = getTrimmed(formData, "code");
  const governorate = getTrimmed(formData, "governorate");
  const endDateRaw = getTrimmed(formData, "endDate");
  const endDate = getOptionalDate(formData, "endDate");
  const totalAmount = getAmount(formData, "totalAmount");
  const paidAmount = getAmount(formData, "paidAmount");
  const values = {
    name,
    phone,
    serviceName,
    code,
    governorate,
    endDate: endDateRaw,
    totalAmount: String(totalAmount),
    paidAmount: String(paidAmount),
  };

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "الاسم مطلوب";
  if (phone.length < 10) fieldErrors.phone = "رقم غير صالح";
  if (serviceName.length < 2) fieldErrors.serviceName = "نوع الخدمة مطلوب";
  if (code.length < 4) fieldErrors.code = "كلمة المرور قصيرة (4 أحرف على الأقل)";
  if (paidAmount > totalAmount)
    fieldErrors.paidAmount = "المبلغ الواصل أكبر من المبلغ الكلي";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) return { fieldErrors: { phone: "هذا الرقم مسجّل مسبقاً" }, values };

  // اسم مستخدم (أحرف + أرقام) يُولَّد تلقائياً، وكلمة المرور يحددها المسؤول (code).
  const username = await generateUniqueUsername();
  const passwordHash = await hashPassword(code);

  await prisma.user.create({
    data: {
      name,
      phone,
      governorate: governorate || null,
      role: "member",
      passwordHash,
      loginCode: username,
      subscriptions: {
        create: {
          serviceName,
          loginCode: code,
          endDate,
          totalAmount,
          paidAmount,
          createdById: actor.id,
        },
      },
    },
  });

  const message = buildWelcomeMessage({ name, username, password: code, serviceName });
  const whatsappLink = buildWhatsAppLink(phone, message);

  revalidatePath("/dashboard/manager/members");
  return {
    success: `تم إنشاء المشترك «${name}». اسم المستخدم: ${username}. استخدم الزر لإرسال بيانات الدخول عبر واتساب.`,
    whatsappLink,
    credentials: { username, password: code },
  };
}

// ---------------------- تعديل مشترك ----------------------
export async function updateSubscriberAction(
  _prev: ManagerActionState,
  formData: FormData,
): Promise<ManagerActionState> {
  await requirePermission("canManageMembers");

  const userId = getId(formData, "userId");
  if (userId === null) return { error: "معرّف المشترك غير صالح." };

  const name = getTrimmed(formData, "name");
  const phone = getTrimmed(formData, "phone");
  const serviceName = getTrimmed(formData, "serviceName");
  const governorate = getTrimmed(formData, "governorate");
  const code = String(formData.get("code") ?? ""); // كلمة مرور جديدة (اختيارية)
  const endDate = getOptionalDate(formData, "endDate");
  const totalAmount = getAmount(formData, "totalAmount");
  const paidAmount = getAmount(formData, "paidAmount");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "الاسم مطلوب";
  if (phone.length < 10) fieldErrors.phone = "رقم غير صالح";
  if (serviceName.length < 2) fieldErrors.serviceName = "نوع الخدمة مطلوب";
  if (code && code.length < 4) fieldErrors.code = "كلمة المرور قصيرة (4 أحرف على الأقل)";
  if (paidAmount > totalAmount)
    fieldErrors.paidAmount = "المبلغ الواصل أكبر من المبلغ الكلي";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  // الهدف يجب أن يكون مشتركاً (عضواً) — مع آخر اشتراك له
  const target = await prisma.user.findFirst({
    where: { id: userId, role: "member" },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!target) return { error: "المشترك غير موجود." };

  // الرقم فريد — استثنِ المشترك نفسه
  const clash = await prisma.user.findFirst({
    where: { phone, NOT: { id: userId } },
    select: { id: true },
  });
  if (clash) return { fieldErrors: { phone: "هذا الرقم مسجّل مسبقاً" } };

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone,
      governorate: governorate || null,
      ...(code ? { passwordHash: await hashPassword(code) } : {}),
    },
  });

  // تحديث الخدمة (وكلمة المرور المعروضة وتاريخ الانتهاء) على آخر اشتراك
  const sub = target.subscriptions[0];
  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        serviceName,
        endDate,
        totalAmount,
        paidAmount,
        ...(code ? { loginCode: code } : {}),
      },
    });
  }

  revalidatePath(`/dashboard/manager/members/${userId}`);
  revalidatePath("/dashboard/manager/members");
  return { success: `تم تحديث بيانات المشترك «${name}».` };
}

// ---------------------- مستحقات الدفع ----------------------
/**
 * يُحدّث كل الصفحات التي تعرض رصيد الزبون حتى تبقى النتيجة واحدة ومتناسقة
 * أينما عُرض المبلغ (قائمة المستحقات + صفحة المشترك + صفحة التعديل).
 */
function revalidateDues(userId: number) {
  revalidatePath("/dashboard/manager/dues");
  revalidatePath(`/dashboard/manager/members/${userId}`);
  revalidatePath(`/dashboard/manager/members/${userId}/edit`);
}

/** يجلب المشترك مع آخر اشتراك وكل مبالغه الإضافية (لحساب إجمالي المستحقات). */
async function getMemberWithCharges(userId: number) {
  return prisma.user.findFirst({
    where: { id: userId, role: "member" },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      extraCharges: { orderBy: { createdAt: "asc" } },
    },
  });
}

/** تسديد كامل لكل مستحقات المشترك: الاشتراك الأصلي + كل المبالغ الإضافية. */
export async function payDuesFullAction(formData: FormData) {
  await requireDuesAccess();
  const userId = getId(formData, "userId");
  if (userId === null) return;

  const member = await getMemberWithCharges(userId);
  if (!member) return;

  const sub = member.subscriptions[0];
  const updates: Promise<unknown>[] = [];
  if (sub && Number(sub.paidAmount) < Number(sub.totalAmount))
    updates.push(
      prisma.subscription.update({
        where: { id: sub.id },
        data: { paidAmount: sub.totalAmount },
      }),
    );
  for (const c of member.extraCharges) {
    if (Number(c.paidAmount) < Number(c.amount))
      updates.push(
        prisma.extraCharge.update({
          where: { id: c.id },
          data: { paidAmount: c.amount },
        }),
      );
  }
  await Promise.all(updates);
  revalidateDues(userId);
}

/**
 * تسديد نصفي على مستوى المشترك: يوزّع المبلغ المستلم على الاشتراك الأصلي أولاً
 * ثم المبالغ الإضافية (الأقدم فالأحدث)، ويعيد حساب الإجمالي المتبقّي.
 */
export async function payDuesPartialAction(
  _prev: ManagerActionState,
  formData: FormData,
): Promise<ManagerActionState> {
  await requireDuesAccess();
  const userId = getId(formData, "userId");
  if (userId === null) return { error: "معرّف المشترك غير صالح." };

  const received = getAmount(formData, "received");
  if (received <= 0)
    return { fieldErrors: { received: "أدخل مبلغاً صحيحاً أكبر من صفر." } };

  const member = await getMemberWithCharges(userId);
  if (!member) return { error: "المشترك غير موجود." };

  const sub = member.subscriptions[0];
  const subRemaining = sub
    ? Math.max(0, Number(sub.totalAmount) - Number(sub.paidAmount))
    : 0;
  const extrasRemaining = member.extraCharges.reduce(
    (s, c) => s + Math.max(0, Number(c.amount) - Number(c.paidAmount)),
    0,
  );
  const totalRemaining = subRemaining + extrasRemaining;
  if (received > totalRemaining)
    return {
      fieldErrors: {
        received: `المبلغ أكبر من المتبقّي (${totalRemaining.toLocaleString("en-US")} د.ع).`,
      },
    };

  let left = received;
  const updates: Promise<unknown>[] = [];
  if (sub && subRemaining > 0) {
    const pay = Math.min(left, subRemaining);
    updates.push(
      prisma.subscription.update({
        where: { id: sub.id },
        data: { paidAmount: Number(sub.paidAmount) + pay },
      }),
    );
    left -= pay;
  }
  for (const c of member.extraCharges) {
    if (left <= 0) break;
    const rem = Math.max(0, Number(c.amount) - Number(c.paidAmount));
    if (rem <= 0) continue;
    const pay = Math.min(left, rem);
    updates.push(
      prisma.extraCharge.update({
        where: { id: c.id },
        data: { paidAmount: Number(c.paidAmount) + pay },
      }),
    );
    left -= pay;
  }
  await Promise.all(updates);
  revalidateDues(userId);

  const newRemaining = totalRemaining - received;
  return {
    success:
      newRemaining > 0
        ? `تم استلام ${received.toLocaleString("en-US")} د.ع — المتبقّي الآن ${newRemaining.toLocaleString("en-US")} د.ع.`
        : "تم استلام المبلغ — سُدّد الحساب بالكامل.",
  };
}

// ---------------------- المبالغ الإضافية (منفصلة عن الاشتراك الأصلي) ----------------------

/** إضافة مبلغ إضافي مستقلّ على المشترك (تحديث خدمة / نظام آخر). */
export async function addExtraChargeAction(
  _prev: ManagerActionState,
  formData: FormData,
): Promise<ManagerActionState> {
  await requireDuesAccess();
  const userId = getId(formData, "userId");
  if (userId === null) return { error: "معرّف المشترك غير صالح." };

  const label = getTrimmed(formData, "label");
  const amount = getAmount(formData, "amount");

  const fieldErrors: Record<string, string> = {};
  if (label.length < 2) fieldErrors.label = "العنوان مطلوب";
  if (amount <= 0) fieldErrors.amount = "أدخل مبلغاً صحيحاً أكبر من صفر";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const target = await prisma.user.findFirst({
    where: { id: userId, role: "member" },
    select: { id: true },
  });
  if (!target) return { error: "المشترك غير موجود." };

  await prisma.extraCharge.create({ data: { userId, label, amount } });
  revalidateDues(userId);
  return {
    success: `تمت إضافة «${label}» بمبلغ ${amount.toLocaleString("en-US")} د.ع.`,
  };
}

/** حذف مبلغ إضافي. */
export async function deleteExtraChargeAction(formData: FormData) {
  await requireDuesAccess();
  const chargeId = getId(formData, "chargeId");
  const userId = getId(formData, "userId");
  if (chargeId === null) return;
  await prisma.extraCharge.delete({ where: { id: chargeId } });
  if (userId !== null) revalidateDues(userId);
}

/** تسديد كامل لمبلغ إضافي واحد (يصفّر باقيه). */
export async function payExtraChargeFullAction(formData: FormData) {
  await requireDuesAccess();
  const chargeId = getId(formData, "chargeId");
  const userId = getId(formData, "userId");
  if (chargeId === null) return;

  const charge = await prisma.extraCharge.findUnique({ where: { id: chargeId } });
  if (!charge) return;

  await prisma.extraCharge.update({
    where: { id: chargeId },
    data: { paidAmount: charge.amount },
  });
  if (userId !== null) revalidateDues(userId);
}

/** تسديد نصفي لمبلغ إضافي واحد. */
export async function payExtraChargePartialAction(
  _prev: ManagerActionState,
  formData: FormData,
): Promise<ManagerActionState> {
  await requireDuesAccess();
  const chargeId = getId(formData, "chargeId");
  const userId = getId(formData, "userId");
  if (chargeId === null) return { error: "معرّف غير صالح." };

  const received = getAmount(formData, "received");
  if (received <= 0)
    return { fieldErrors: { received: "أدخل مبلغاً صحيحاً أكبر من صفر." } };

  const charge = await prisma.extraCharge.findUnique({ where: { id: chargeId } });
  if (!charge) return { error: "المبلغ غير موجود." };

  const remaining = Math.max(0, Number(charge.amount) - Number(charge.paidAmount));
  if (received > remaining)
    return {
      fieldErrors: {
        received: `المبلغ أكبر من المتبقّي (${remaining.toLocaleString("en-US")} د.ع).`,
      },
    };

  await prisma.extraCharge.update({
    where: { id: chargeId },
    data: { paidAmount: Number(charge.paidAmount) + received },
  });
  if (userId !== null) revalidateDues(userId);

  const newRemaining = remaining - received;
  return {
    success:
      newRemaining > 0
        ? `تم الاستلام — المتبقّي ${newRemaining.toLocaleString("en-US")} د.ع.`
        : "سُدّد المبلغ بالكامل.",
  };
}

// --- تسديد الاشتراك الأصلي كصفّ (نفس أسلوب المبالغ الإضافية) ---

/** تسديد كامل لاشتراك واحد (يصفّر باقيه). */
export async function paySubscriptionFullAction(formData: FormData) {
  await requireDuesAccess();
  const subId = getId(formData, "subscriptionId");
  const userId = getId(formData, "userId");
  if (subId === null) return;

  const sub = await prisma.subscription.findUnique({ where: { id: subId } });
  if (!sub) return;

  await prisma.subscription.update({
    where: { id: subId },
    data: { paidAmount: sub.totalAmount },
  });
  if (userId !== null) revalidateDues(userId);
}

/** تسديد نصفي لاشتراك واحد. */
export async function paySubscriptionPartialAction(
  _prev: ManagerActionState,
  formData: FormData,
): Promise<ManagerActionState> {
  await requireDuesAccess();
  const subId = getId(formData, "subscriptionId");
  const userId = getId(formData, "userId");
  if (subId === null) return { error: "معرّف غير صالح." };

  const received = getAmount(formData, "received");
  if (received <= 0)
    return { fieldErrors: { received: "أدخل مبلغاً صحيحاً أكبر من صفر." } };

  const sub = await prisma.subscription.findUnique({ where: { id: subId } });
  if (!sub) return { error: "الاشتراك غير موجود." };

  const remaining = Math.max(0, Number(sub.totalAmount) - Number(sub.paidAmount));
  if (received > remaining)
    return {
      fieldErrors: {
        received: `المبلغ أكبر من المتبقّي (${remaining.toLocaleString("en-US")} د.ع).`,
      },
    };

  await prisma.subscription.update({
    where: { id: subId },
    data: { paidAmount: Number(sub.paidAmount) + received },
  });
  if (userId !== null) revalidateDues(userId);

  const newRemaining = remaining - received;
  return {
    success:
      newRemaining > 0
        ? `تم الاستلام — المتبقّي ${newRemaining.toLocaleString("en-US")} د.ع.`
        : "سُدّد المبلغ بالكامل.",
  };
}

// ---------------------- رفع ملف خدمة للمشترك ----------------------
export async function uploadMemberProgramAction(
  _prev: ManagerActionState,
  formData: FormData,
): Promise<ManagerActionState> {
  await requirePermission("canManageMembers");

  const userId = getId(formData, "userId");
  if (userId === null) return { error: "معرّف المشترك غير صالح." };

  const title = getTrimmed(formData, "title");
  const file = formData.get("file") as File | null;

  const fieldErrors: Record<string, string> = {};
  if (title.length < 2) fieldErrors.title = "عنوان الملف مطلوب";
  if (!file || file.size === 0) fieldErrors.file = "اختر ملفاً مضغوطاً (zip/rar)";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  // الهدف يجب أن يكون مشتركاً (عضواً)
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target || target.role !== "member") return { error: "المشترك غير موجود." };

  let fileUrl: string | null = null;
  try {
    // ملف خاص بالمشترك — يُخزَّن خارج public ويُنزَّل عبر المسار المحمي فقط.
    fileUrl = await savePrivateFile(file, "member-programs", {
      allowedExt: DOC_EXT,
    });
  } catch {
    return { error: "تعذّر رفع الملف. تأكد أنه ملف مضغوط مسموح (zip/rar/7z)." };
  }
  if (!fileUrl) return { fieldErrors: { file: "اختر ملفاً مضغوطاً (zip/rar)" } };

  await prisma.memberProgram.create({ data: { userId, title, fileUrl } });

  revalidatePath(`/dashboard/manager/members/${userId}`);
  revalidatePath("/profile");
  return { success: `تم رفع «${title}» للمشترك.` };
}

export async function deleteMemberProgramAction(formData: FormData) {
  await requirePermission("canManageMembers");
  const id = getId(formData, "programId");
  const userId = getId(formData, "userId");
  if (id === null) return;

  const program = await prisma.memberProgram.findUnique({ where: { id } });
  if (!program) return;

  await prisma.memberProgram.delete({ where: { id } });

  // حذف الملف من القرص أيضاً حتى لا تتراكم ملفات يتيمة (أفضل جهد).
  const fullPath = resolvePrivateFile(program.fileUrl);
  if (fullPath) await unlink(fullPath).catch(() => {});

  if (userId !== null) revalidatePath(`/dashboard/manager/members/${userId}`);
  revalidatePath("/profile");
}

// ---------------------- حذف مشترك ----------------------
export async function deleteSubscriberAction(formData: FormData) {
  await requirePermission("canManageMembers");
  const userId = getId(formData, "userId");
  if (userId === null) return;

  // نحذف المشتركين (الأعضاء) فقط — منعاً لحذف أدمن/مدير بالخطأ.
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target || target.role !== "member") return;

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/dashboard/manager/members");
}

// ---------------------- الحظر / رفع الحظر ----------------------
export async function toggleBanAction(formData: FormData) {
  const actor = await requireStaff();
  const manager = isManager(actor.role);
  // المدير يحظر الجميع؛ الأدمن صاحب صلاحية المشتركين يحظر المشتركين فقط
  if (!manager && !hasPermission(actor, "canManageMembers")) return;

  const userId = getId(formData, "userId");
  const ban = formData.get("ban") === "true";
  if (userId === null) return;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return;
  // منع غير المدير من حظر الأدمن/المدير (تصعيد صلاحيات)
  if (!manager && target.role !== "member") return;

  await prisma.user.update({ where: { id: userId }, data: { isBanned: ban } });
  revalidatePath("/dashboard/manager/admins");
  revalidatePath("/dashboard/manager/members");
}
