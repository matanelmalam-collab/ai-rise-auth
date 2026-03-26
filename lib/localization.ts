import { heIL } from "@clerk/localizations";

/**
 * AI Rise Hebrew Localization
 *
 * Base: Clerk's community-maintained heIL locale
 * Overrides: Warm, inviting tone for 45-75 age group
 *
 * The default Clerk Hebrew strings are functional but cold/technical.
 * These overrides make the auth experience feel warm, personal, and
 * reassuring — matching AI Rise's landing page tone.
 */
export const aiRiseHebrewLocalization: Record<string, any> = {
  ...heIL,

  signUp: {
    start: {
      title: "בואו נתחיל!",
      subtitle: "2 שיעורים חינם — בלי כרטיס אשראי",
      actionText: "כבר יש לכם חשבון?",
      actionLink: "היכנסו כאן",
    },
    emailLink: {
      title: "בדקו את האימייל שלכם",
      subtitle: "שלחנו לכם קישור — לחצו עליו כדי להמשיך",
      formTitle: "קישור לאימות",
      formSubtitle: "השתמשו בקישור שנשלח לכתובת האימייל שלכם",
      resendButton: "שלחו שוב",
    },
    phoneCode: {
      title: "בדקו את ההודעות בנייד",
      subtitle: "שלחנו קוד בן 6 ספרות למספר שלכם",
      formTitle: "קוד אימות",
      formSubtitle: "הזינו את הקוד שקיבלתם ב-SMS",
      resendButton: "שלחו קוד חדש",
    },
  },

  signIn: {
    start: {
      title: "ברוכים השבים!",
      subtitle: "הקורס מחכה לכם",
      actionText: "אין לכם חשבון עדיין?",
      actionLink: "הרשמו בחינם",
    },
    emailLink: {
      title: "בדקו את האימייל שלכם",
      subtitle: "שלחנו לכם קישור להתחברות",
      formTitle: "קישור להתחברות",
      formSubtitle: "השתמשו בקישור שנשלח אליכם באימייל",
      resendButton: "שלחו שוב",
    },
    phoneCode: {
      title: "בדקו את ההודעות בנייד",
      subtitle: "שלחנו קוד התחברות למספר שלכם",
      formTitle: "קוד התחברות",
      formSubtitle: "הזינו את הקוד שקיבלתם ב-SMS",
      resendButton: "שלחו קוד חדש",
    },
  },

  // Form field labels — warm, clear Hebrew
  formFieldLabel__emailAddress: "כתובת אימייל",
  formFieldLabel__phoneNumber: "מספר נייד",
  formFieldLabel__firstName: "שם פרטי",
  formFieldLabel__lastName: "שם משפחה",

  // Form field placeholders
  formFieldInputPlaceholder__emailAddress: "הכניסו את האימייל שלכם",
  formFieldInputPlaceholder__phoneNumber: "05X-XXX-XXXX",

  // Buttons
  formButtonPrimary: "המשיכו",

  // Social login
  socialButtonsBlockButton: "המשיכו עם {{provider|titleize}}",
  socialButtonsBlockButtonManyInView: "{{provider|titleize}}",

  // Divider
  dividerText: "או",

  // Footer links
  footerActionLink__useAnotherMethod: "נסו דרך אחרת",
  footerPageLink__help: "צריכים עזרה?",
};
