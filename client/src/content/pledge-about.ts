// Verbatim bilingual content for the /pledge/about page. EDIT TEXT HERE.
// Do not paraphrase — copy reviewed and approved as-is. Brand is always
// "BHmonitor" (one word). Section ids power deep links (#what, #why, …).

export type Block =
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export interface Section {
  id: string;
  heading: string;
  blocks: Block[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface AboutContent {
  backLink: string;
  title: string;
  intro: string[];
  noticeLabel: string;
  notice: string;
  sections: Section[];
  faq: { id: string; heading: string; items: FaqItem[] };
  footer: string[];
}

const ar: AboutContent = {
  backLink: "العودة إلى صفحة الوثيقة",
  title: "وثيقة الولاء والتأييد عبر BHmonitor",
  intro: [
    "أطلقت منصة BHmonitor هذه الصفحة كمساحة رقمية مجتمعية تتيح للمشاركين التعبير عن الولاء والتأييد لمملكة البحرين وقيادتها الحكيمة، من خلال إنشاء وثيقة رقمية باسم المشارك ومشاركتها بكل سهولة.",
    "هذه المبادرة تأتي من منطلق المحبة والاعتزاز والانتماء، وتهدف إلى توفير تجربة رقمية بسيطة، محترمة، وسهلة المشاركة.",
  ],
  noticeLabel: "تنبيه مهم",
  notice:
    "هذه الوثيقة الرقمية مقدّمة من منصة BHmonitor كتعبير مجتمعي عن الولاء والتأييد، ولا تُعد بديلاً عن أي إجراءات رسمية أو تسليم ورقي معلن من الجهات المختصة.",
  sections: [
    {
      id: "what",
      heading: "ما هي وثيقة الولاء والتأييد؟",
      blocks: [
        {
          type: "p",
          text: "وثيقة الولاء والتأييد هي تصميم رقمي يتيح للمشارك إدخال اسمه وإنشاء صورة مشاركة تحمل اسمه ضمن صيغة رسمية ومحترمة تعبّر عن الولاء والتأييد.",
        },
        {
          type: "p",
          text: "بعد إدخال الاسم، يمكن للمشارك تحميل الصورة أو مشاركتها، كما يظهر اسمه في قائمة المشاركين على صفحة الوثيقة.",
        },
      ],
    },
    {
      id: "why",
      heading: "لماذا أطلقت BHmonitor هذه الصفحة؟",
      blocks: [
        {
          type: "p",
          text: "أطلقت BHmonitor هذه الصفحة لتوفير طريقة رقمية سهلة وسريعة تتيح للمجتمع المشاركة والتعبير عن الولاء والانتماء، بأسلوب منظم، محترم، ومناسب للمشاركة عبر المنصات الرقمية.",
        },
        { type: "p", text: "تهدف الصفحة إلى:" },
        {
          type: "ul",
          items: [
            "تسهيل المشاركة الرقمية.",
            "إنشاء وثيقة شخصية قابلة للتحميل والمشاركة.",
            "عرض عدد المشاركين بشكل مباشر.",
            "عرض أسماء المشاركين في قائمة عامة قابلة للبحث.",
            "الحفاظ على تجربة بسيطة بدون طلب بيانات غير ضرورية.",
          ],
        },
      ],
    },
    {
      id: "data",
      heading: "ما البيانات التي نجمعها؟",
      blocks: [
        { type: "p", text: "نحن نجمع أقل قدر ممكن من البيانات." },
        { type: "p", text: "البيانات التي يتم إدخالها:" },
        { type: "ul", items: ["الاسم الذي يكتبه المشارك."] },
        { type: "p", text: "بيانات تقنية محدودة قد تُستخدم للحماية من إساءة الاستخدام:" },
        {
          type: "ul",
          items: [
            "وقت المشاركة.",
            "حالة الاسم في النظام: ظاهر، محظور، أو محذوف.",
            "نسخة الموافقة على عرض الاسم.",
            "بيانات تقنية محدودة لأغراض الحماية ومنع التكرار أو الإساءة، عند الحاجة.",
          ],
        },
        { type: "p", text: "لا نطلب:" },
        {
          type: "ul",
          items: [
            "الرقم الشخصي CPR.",
            "رقم الهاتف.",
            "البريد الإلكتروني.",
            "العنوان.",
            "جواز السفر.",
            "صورة البطاقة.",
            "التوقيع الشخصي.",
            "أي بيانات حساسة أخرى.",
          ],
        },
      ],
    },
    {
      id: "display",
      heading: "كيف يتم عرض الاسم؟",
      blocks: [
        {
          type: "p",
          text: "عند المشاركة، يوافق المستخدم على عرض اسمه في قائمة المشاركين العامة داخل صفحة وثيقة الولاء والتأييد.",
        },
        { type: "p", text: "قد يظهر الاسم في:" },
        {
          type: "ul",
          items: [
            "قائمة المشاركين.",
            "نتائج البحث داخل قائمة المشاركين.",
            "العداد العام للمشاركين.",
            "الصورة التي يقوم المستخدم بتحميلها أو مشاركتها بنفسه.",
          ],
        },
        { type: "p", text: "لا ننشئ صفحة عامة منفصلة لكل شخص." },
        { type: "p", text: "لا نعرض رقم هاتف أو بريد إلكتروني أو أي بيانات إضافية." },
      ],
    },
    {
      id: "consent",
      heading: "الموافقة",
      blocks: [
        { type: "p", text: "قبل إنشاء الوثيقة، يجب على المشارك الموافقة على النص التالي:" },
        {
          type: "quote",
          text: "أوافق على عرض اسمي في قائمة المشاركين في وثيقة الولاء والتأييد على منصة BHmonitor.",
        },
        {
          type: "p",
          text: "بالموافقة، يقرّ المشارك بأن الاسم المدخل صحيح أو لديه الحق في استخدامه، وأنه يعلم أن الاسم سيظهر ضمن قائمة عامة قابلة للعرض والبحث.",
        },
      ],
    },
    {
      id: "removal",
      heading: "حذف الاسم أو تعديله",
      blocks: [
        {
          type: "p",
          text: "إذا رغبت في حذف اسمك من قائمة المشاركين أو طلب تصحيح الاسم، يمكنك التواصل مع BHmonitor عبر قناة التواصل الرسمية المتاحة في الموقع أو عبر حسابات BHmonitor الرسمية.",
        },
        {
          type: "p",
          text: "عند استلام الطلب، سنراجع الطلب ونتخذ الإجراء المناسب خلال أقرب وقت ممكن.",
        },
        {
          type: "p",
          text: "قد نطلب معلومات بسيطة للتأكد من أن الطلب صادر من الشخص المعني أو من شخص لديه الحق في تقديم الطلب.",
        },
      ],
    },
    {
      id: "terms",
      heading: "شروط الاستخدام",
      blocks: [
        { type: "p", text: "باستخدام صفحة وثيقة الولاء والتأييد، يوافق المستخدم على ما يلي:" },
        {
          type: "ol",
          items: [
            "استخدام الصفحة بطريقة محترمة وقانونية.",
            "عدم إدخال أسماء مسيئة أو مزيفة أو ساخرة أو مخالفة للآداب العامة.",
            "عدم استخدام أسماء أشخاص آخرين دون إذن.",
            "عدم انتحال صفة أي شخصية عامة أو جهة رسمية أو مؤسسة.",
            "عدم محاولة تعطيل الخدمة أو إرسال مشاركات متكررة بشكل مسيء.",
            "يحق لـ BHmonitor حذف أو إخفاء أي اسم تراه غير مناسب أو مخالفاً لهذه الشروط.",
            "يحق لـ BHmonitor إيقاف الخدمة أو تعديلها أو تحديث شروطها في أي وقت عند الحاجة.",
            "هذه الخدمة رقمية ومجتمعية، ولا تمثل بديلاً عن أي إجراء رسمي.",
          ],
        },
      ],
    },
    {
      id: "privacy",
      heading: "سياسة الخصوصية المختصرة",
      blocks: [
        {
          type: "p",
          text: "تحرص BHmonitor على تقليل البيانات التي يتم جمعها. الغرض من جمع الاسم هو إنشاء وثيقة رقمية وعرض الاسم في قائمة المشاركين بعد موافقة المستخدم.",
        },
        { type: "p", text: "نستخدم البيانات فقط من أجل:" },
        {
          type: "ul",
          items: [
            "إنشاء وثيقة الولاء الرقمية.",
            "عرض الاسم في قائمة المشاركين.",
            "تشغيل العداد العام.",
            "البحث داخل قائمة المشاركين.",
            "حماية الخدمة من الإساءة أو الاستخدام غير الطبيعي.",
          ],
        },
        { type: "p", text: "لا نبيع بيانات المشاركين." },
        { type: "p", text: "لا نطلب بيانات حساسة." },
        { type: "p", text: "لا نستخدم الأسماء لأغراض تسويقية مباشرة." },
        {
          type: "p",
          text: "لا نشارك الأسماء مع أطراف خارجية إلا إذا تطلب القانون ذلك أو كان ذلك ضرورياً لحماية الخدمة.",
        },
      ],
    },
    {
      id: "disclaimer",
      heading: "إخلاء المسؤولية",
      blocks: [
        {
          type: "p",
          text: "صفحة وثيقة الولاء والتأييد من BHmonitor هي مبادرة رقمية مجتمعية مستقلة.",
        },
        { type: "p", text: "هذه الصفحة:" },
        {
          type: "ul",
          items: [
            "ليست منصة حكومية رسمية.",
            "لا تمثل جهة حكومية.",
            "لا تستبدل أي تسليم ورقي أو إجراء رسمي.",
            "لا تُعد إثباتاً رسمياً لأي تقديم لدى أي جهة.",
          ],
        },
        { type: "p", text: "المشاركة في هذه الصفحة اختيارية بالكامل." },
      ],
    },
  ],
  faq: {
    id: "faq",
    heading: "الأسئلة الشائعة",
    items: [
      {
        q: "س: هل هذه الصفحة رسمية؟",
        a: "ج: لا. هذه صفحة رقمية مجتمعية مقدّمة من BHmonitor للتعبير عن الولاء والتأييد، ولا تُعد بديلاً عن أي إجراء رسمي.",
      },
      {
        q: "س: هل يجب أن أدخل رقمي الشخصي أو هاتفي؟",
        a: "ج: لا. الصفحة تطلب الاسم فقط. لا نطلب الرقم الشخصي أو الهاتف أو البريد الإلكتروني أو أي بيانات حساسة.",
      },
      {
        q: "س: هل سيظهر اسمي للجميع؟",
        a: "ج: نعم، إذا وافقت على المشاركة، سيظهر اسمك في قائمة المشاركين العامة داخل الصفحة.",
      },
      {
        q: "س: هل يمكنني حذف اسمي لاحقاً؟",
        a: "ج: نعم. يمكنك التواصل مع BHmonitor وطلب حذف الاسم أو تعديله.",
      },
      {
        q: "س: هل يمكنني مشاركة الوثيقة؟",
        a: "ج: نعم. بعد إدخال الاسم، يمكنك تحميل الصورة ومشاركتها عبر واتساب أو إنستغرام أو أي منصة أخرى.",
      },
      {
        q: "س: هل يتم إنشاء رابط خاص لكل شخص؟",
        a: "ج: لا. لا يتم إنشاء صفحة منفصلة لكل مشارك. تظهر الأسماء ضمن قائمة المشاركين العامة فقط.",
      },
      {
        q: "س: لماذا يظهر عداد المشاركين؟",
        a: "ج: العداد يعرض عدد المشاركين في وثيقة الولاء والتأييد عبر BHmonitor بشكل عام.",
      },
      {
        q: "س: هل يمكنني إدخال اسم شخص آخر؟",
        a: "ج: لا يُنصح بذلك. يجب إدخال اسمك أو اسم لديك الحق في استخدامه.",
      },
      {
        q: "س: ماذا يحدث إذا تم إدخال اسم مسيء أو غير مناسب؟",
        a: "ج: يحق لـ BHmonitor إخفاء أو حذف أي اسم مخالف أو مسيء أو غير مناسب.",
      },
      {
        q: "س: هل تحتفظ BHmonitor بالصور التي يتم تحميلها؟",
        a: "ج: لا يلزم حفظ الصور. يمكن إنشاء الصورة للمشارك مباشرة، ويتم حفظ الاسم فقط ضمن قائمة المشاركين إذا وافق المستخدم.",
      },
      {
        q: "س: هل تستخدم BHmonitor الأسماء للإعلانات؟",
        a: "ج: لا. يتم استخدام الاسم لغرض وثيقة الولاء وقائمة المشاركين فقط.",
      },
    ],
  },
  footer: [
    "BHmonitor — منصة بحرينية رقمية للرصد والمتابعة ونشر التحديثات المهمة بسرعة ووضوح.",
    "هذه المبادرة الرقمية تعبّر عن المشاركة المجتمعية ولا تُعد بديلاً عن أي إجراء رسمي.",
  ],
};

const en: AboutContent = {
  backLink: "Back to the pledge page",
  title: "BHmonitor Loyalty and Support Pledge",
  intro: [
    "BHmonitor launched this page as a digital community space that allows participants to express loyalty and support for the Kingdom of Bahrain and its wise leadership by creating a digital pledge document with their name and sharing it easily.",
    "This initiative is based on love, pride, belonging, and national appreciation. It aims to provide a simple, respectful, and easy-to-share digital experience.",
  ],
  noticeLabel: "Important Notice",
  notice:
    "This digital document is provided by BHmonitor as a community expression of loyalty and support. It is not a replacement for any official procedures or physical submissions announced by the relevant authorities.",
  sections: [
    {
      id: "what",
      heading: "What is the Loyalty and Support Pledge?",
      blocks: [
        {
          type: "p",
          text: "The Loyalty and Support Pledge is a digital design that allows a participant to enter their name and generate a shareable image carrying their name within a respectful and formal pledge format.",
        },
        {
          type: "p",
          text: "After entering the name, the participant can download or share the image, and their name will appear in the list of participants on the pledge page.",
        },
      ],
    },
    {
      id: "why",
      heading: "Why did BHmonitor launch this page?",
      blocks: [
        {
          type: "p",
          text: "BHmonitor launched this page to provide an easy and fast digital way for the community to participate and express loyalty and belonging in an organized, respectful, and digitally shareable format.",
        },
        { type: "p", text: "The page aims to:" },
        {
          type: "ul",
          items: [
            "Make digital participation easier.",
            "Create a personal pledge image that can be downloaded and shared.",
            "Display the number of participants live.",
            "Show participant names in a public searchable list.",
            "Keep the experience simple without requesting unnecessary data.",
          ],
        },
      ],
    },
    {
      id: "data",
      heading: "What data do we collect?",
      blocks: [
        { type: "p", text: "We collect the minimum amount of data possible." },
        { type: "p", text: "Data entered by the participant:" },
        { type: "ul", items: ["The name written by the participant."] },
        { type: "p", text: "Limited technical data may be used to protect the service from abuse:" },
        {
          type: "ul",
          items: [
            "Time of participation.",
            "Name status in the system: visible, blocked, or deleted.",
            "Consent version.",
            "Limited technical data for security, abuse prevention, and duplicate/spam prevention when necessary.",
          ],
        },
        { type: "p", text: "We do not request:" },
        {
          type: "ul",
          items: [
            "CPR number.",
            "Phone number.",
            "Email address.",
            "Home address.",
            "Passport number.",
            "ID card image.",
            "Personal signature.",
            "Any other sensitive information.",
          ],
        },
      ],
    },
    {
      id: "display",
      heading: "How is the name displayed?",
      blocks: [
        {
          type: "p",
          text: "When participating, the user agrees for their name to be displayed in the public participant list on the Loyalty and Support Pledge page.",
        },
        { type: "p", text: "The name may appear in:" },
        {
          type: "ul",
          items: [
            "The participant list.",
            "Search results inside the participant list.",
            "The public participant counter.",
            "The image the participant downloads or shares themselves.",
          ],
        },
        { type: "p", text: "We do not create a separate public page for each person." },
        { type: "p", text: "We do not display phone numbers, email addresses, or any additional personal data." },
      ],
    },
    {
      id: "consent",
      heading: "Consent",
      blocks: [
        { type: "p", text: "Before creating the pledge, the participant must agree to the following statement:" },
        {
          type: "quote",
          text: "\"I agree for my name to appear in the list of participants in the Loyalty and Support Pledge on BHmonitor.\"",
        },
        {
          type: "p",
          text: "By agreeing, the participant confirms that the name entered is correct or that they have the right to use it, and that they understand the name will appear in a public list that can be viewed and searched.",
        },
      ],
    },
    {
      id: "removal",
      heading: "Name Removal or Correction",
      blocks: [
        {
          type: "p",
          text: "If you would like to remove your name from the participant list or request a correction, you may contact BHmonitor through the official contact channel available on the website or through BHmonitor's official accounts.",
        },
        {
          type: "p",
          text: "Once the request is received, we will review it and take the appropriate action as soon as possible.",
        },
        {
          type: "p",
          text: "We may request simple information to confirm that the request is being made by the relevant person or by someone who has the right to make the request.",
        },
      ],
    },
    {
      id: "terms",
      heading: "Terms of Use",
      blocks: [
        { type: "p", text: "By using the Loyalty and Support Pledge page, the user agrees to the following:" },
        {
          type: "ol",
          items: [
            "To use the page in a respectful and lawful manner.",
            "Not to enter offensive, fake, mocking, or inappropriate names.",
            "Not to use another person's name without permission.",
            "Not to impersonate any public figure, official entity, or organization.",
            "Not to attempt to disrupt the service or submit repeated abusive entries.",
            "BHmonitor has the right to remove or hide any name it considers inappropriate or in violation of these terms.",
            "BHmonitor has the right to suspend, modify, or update the service and its terms when needed.",
            "This is a digital community service and does not replace any official procedure.",
          ],
        },
      ],
    },
    {
      id: "privacy",
      heading: "Short Privacy Policy",
      blocks: [
        {
          type: "p",
          text: "BHmonitor is committed to minimizing the data it collects. The purpose of collecting the name is to generate a digital pledge document and display the name in the participant list after the user gives consent.",
        },
        { type: "p", text: "We use the data only to:" },
        {
          type: "ul",
          items: [
            "Generate the digital loyalty pledge.",
            "Display the name in the participant list.",
            "Operate the public counter.",
            "Enable search inside the participant list.",
            "Protect the service from abuse or abnormal usage.",
          ],
        },
        { type: "p", text: "We do not sell participant data." },
        { type: "p", text: "We do not request sensitive information." },
        { type: "p", text: "We do not use names for direct marketing purposes." },
        {
          type: "p",
          text: "We do not share names with external parties unless required by law or necessary to protect the service.",
        },
      ],
    },
    {
      id: "disclaimer",
      heading: "Disclaimer",
      blocks: [
        {
          type: "p",
          text: "The BHmonitor Loyalty and Support Pledge page is an independent digital community initiative.",
        },
        { type: "p", text: "This page:" },
        {
          type: "ul",
          items: [
            "Is not an official government platform.",
            "Does not represent any government entity.",
            "Does not replace any physical submission or official procedure.",
            "Does not serve as official proof of submission to any authority.",
          ],
        },
        { type: "p", text: "Participation in this page is fully optional." },
      ],
    },
  ],
  faq: {
    id: "faq",
    heading: "Frequently Asked Questions",
    items: [
      {
        q: "Q: Is this page official?",
        a: "A: No. This is a digital community page provided by BHmonitor to express loyalty and support. It does not replace any official procedure.",
      },
      {
        q: "Q: Do I need to enter my CPR number or phone number?",
        a: "A: No. The page only asks for your name. We do not request CPR, phone number, email address, or any sensitive information.",
      },
      {
        q: "Q: Will my name be visible to everyone?",
        a: "A: Yes. If you agree to participate, your name will appear in the public participant list on the page.",
      },
      {
        q: "Q: Can I remove my name later?",
        a: "A: Yes. You can contact BHmonitor and request that your name be removed or corrected.",
      },
      {
        q: "Q: Can I share the pledge?",
        a: "A: Yes. After entering your name, you can download the image and share it on WhatsApp, Instagram, or any other platform.",
      },
      {
        q: "Q: Is a private link created for each person?",
        a: "A: No. A separate page is not created for each participant. Names appear only in the public participant list.",
      },
      {
        q: "Q: Why is there a participant counter?",
        a: "A: The counter displays the total number of participants in the Loyalty and Support Pledge through BHmonitor.",
      },
      {
        q: "Q: Can I enter someone else's name?",
        a: "A: You should only enter your own name or a name you have permission to use.",
      },
      {
        q: "Q: What happens if someone enters an offensive or inappropriate name?",
        a: "A: BHmonitor has the right to hide or remove any name that is inappropriate, offensive, or in violation of the terms.",
      },
      {
        q: "Q: Does BHmonitor store the images that users download?",
        a: "A: The images do not need to be stored. The image can be generated directly for the participant, while only the name is saved in the participant list if the user agrees.",
      },
      {
        q: "Q: Does BHmonitor use names for advertising?",
        a: "A: No. Names are used only for the pledge document and the participant list.",
      },
    ],
  },
  footer: [
    "BHmonitor — a Bahraini digital platform for monitoring, updates, and publishing important information quickly and clearly.",
    "This digital initiative represents community participation and does not replace any official procedure.",
  ],
};

export const ABOUT_CONTENT: Record<"ar" | "en", AboutContent> = { ar, en };
